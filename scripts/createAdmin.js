/**
 * scripts/createAdmin.js
 *
 * Usage:
 *   node scripts/createAdmin.js \
 *     --username sgcsc \
 *     --password StrongP@ssw0rd \
 *     --email admin@sgcsc.co.in \
 *     --name "SGCSC Admin" \
 *     --role superadmin
 */

require("dotenv").config();
const mongoose = require("mongoose");
const minimist = require("minimist");
const path = require("path");

// ---------------- CLI args ----------------
const argv = minimist(process.argv.slice(2));

const username = argv.username || argv.u;
const password = argv.password || argv.p;
const email = argv.email || argv.e;
const name = argv.name || "Administrator";
const role = argv.role || "admin";

// ---------------- Validation ----------------
if (!username || !password) {
  console.error("❌ Missing required fields.");
  console.error("Required: --username --password");
  process.exit(1);
}

if (!email) {
  console.warn("⚠️  No email provided. Using placeholder email.");
}

// ---------------- Mongo ----------------
const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI;

if (!MONGODB_URI) {
  console.error("❌ MongoDB URI not found in env");
  process.exit(1);
}

// ---------------- Main ----------------
async function main() {
  console.log("🔗 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);

  const AdminUser = require(path.join(
    __dirname,
    "..",
    "src",
    "models",
    "AdminUser"
  ));

  // Find by username (source of truth)
  let admin = await AdminUser.findOne({ username });

  if (admin) {
    console.log(`🔁 Updating existing admin: ${username}`);
    admin.password = password; // 🔥 hashed by pre-save hook
    admin.name = name;
    admin.role = role;
    if (email) admin.email = email;
  } else {
    console.log(`➕ Creating new admin: ${username}`);
    admin = new AdminUser({
      username,
      password, // 🔥 hashed by pre-save hook
      email: email || `${username}@placeholder.local`,
      name,
      role,
    });
  }

  await admin.save();

  console.log("✅ Admin ready");
  console.log({
    id: admin._id.toString(),
    username: admin.username,
    email: admin.email,
    role: admin.role,
  });

  await mongoose.disconnect();
  process.exit(0);
}

// ---------------- Run ----------------
main().catch((err) => {
  console.error("❌ Failed to create/update admin:", err);
  process.exit(1);
});
