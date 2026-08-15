const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { jwtSecret, issuer, audience, cookieName } = require("../config/auth");

const authenticate = async (req, res, next) => {
  const token = req.cookies?.[cookieName] || req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Authentication is required" });
  try {
    const claims = jwt.verify(token, jwtSecret, { algorithms: ["HS256"], issuer, audience });
    const employee = await db("employees").where({ id: claims.sub, is_active: true }).first();
    if (!employee) return res.status(401).json({ error: "Your account is no longer active" });
    req.user = { id: employee.id, name: employee.name, email: employee.email, role: employee.role };
    return next();
  } catch (_) {
    return res.status(401).json({ error: "Your session is invalid or expired" });
  }
};

const requireManager = (req, res, next) => req.user.role === "MANAGER"
  ? next()
  : res.status(403).json({ error: "Manager access is required" });

module.exports = { authenticate, requireManager };
