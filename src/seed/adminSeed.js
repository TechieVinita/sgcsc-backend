require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const AdminUser = require('../models/AdminUser');

const connect = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
};

const createAdmin = async () => {
  try {
    await connect();

    const existing = await AdminUser.findOne({ email: 'admin@example.com' });
    if (existing) {
      console.log('⚠️ Admin already exists');
      process.exit(0);
    }

    const password = 'ChangeMe123!';
    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = new AdminUser({
      name: 'Super Admin',
      email: 'admin@example.com',
      password: 'ChangeMe123!'
    });


    await admin.save();
    console.log('✅ Admin created successfully!');
    console.log('Email: admin@example.com');
    console.log('Password: ChangeMe123!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();
