const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Authentication is required" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "development-only-secret");
    return next();
  } catch (_) {
    return res.status(401).json({ error: "Your session is invalid or expired" });
  }
};

const requireManager = (req, res, next) => req.user.role === "MANAGER"
  ? next()
  : res.status(403).json({ error: "Manager access is required" });

module.exports = { authenticate, requireManager };
