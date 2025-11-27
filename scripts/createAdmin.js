// scripts/createAdmin.js
// Usage:
//   node scripts/createAdmin.js --email admin@example.com --password MyP@ssw0rd --name "Admin Name"

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

const argv = require('minimist')(process.argv.slice(2));

const email = argv.email || argv.e || 'admin@example.com';
const password = argv.password || argv.p || 'admin123';
const name = argv.name || 'Administrator';
const role = argv.role || 'admin';

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/sgcsc';

async function main() {
  console.log('Connecting to MongoDB:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI, {});

  // Try to load existing AdminUser model
  let AdminUser = null;
  try {
    AdminUser = require(path.join(__dirname, '..', 'src', 'models', 'AdminUser'));
    console.log('Using existing AdminUser model at src/models/AdminUser.js');
  } catch (err) {
    console.warn('AdminUser model not found at src/models/AdminUser.js — will use fallback schema.');
  }

  const hashed = bcrypt.hashSync(password, 10);

  if (AdminUser) {
    // Upsert by email
    const existing = await AdminUser.findOne({ email });
    if (existing) {
      existing.password = hashed;
      existing.name = name;
      existing.role = role;
      await existing.save();
      console.log(`Updated existing admin user ${email}`);
      console.log(existing);
    } else {
      const doc = new AdminUser({ email, password: hashed, name, role });
      await doc.save();
      console.log(`Created admin user ${email}`);
      console.log(doc);
    }
  } else {
    // Fallback direct insertion into adminusers collection
    const collectionName = 'adminusers';
    const collection = mongoose.connection.collection(collectionName);
    const existing = await collection.findOne({ email });
    if (existing) {
      await collection.updateOne({ email }, { $set: { password: hashed, name, role } });
      console.log(`Updated existing admin user in collection ${collectionName}: ${email}`);
    } else {
      const now = new Date();
      const doc = { email, password: hashed, name, role, createdAt: now, updatedAt: now };
      await collection.insertOne(doc);
      console.log(`Inserted admin user into collection ${collectionName}: ${email}`);
    }
  }

  await mongoose.disconnect();
  console.log('Done. You can now attempt login with the credentials you provided.');
  process.exit(0);
}

main().catch(err => {
  console.error('Error creating admin', err);
  process.exit(1);
});
