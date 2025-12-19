const jwt = require("jsonwebtoken");
const Franchise = require("../models/Franchise");

module.exports = async function franchiseAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const franchise = await Franchise.findById(decoded.id).select("-passwordHash");

    if (!franchise) {
      return res.status(401).json({
        success: false,
        message: "Franchise not found",
      });
    }

    req.franchise = franchise;
    next();
  } catch (err) {
    console.error("franchiseAuth error:", err);
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};
