// server/src/config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI is not defined");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected");
    console.log("   Host:", conn.connection.host);
    console.log("   Database:", conn.connection.name);
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
