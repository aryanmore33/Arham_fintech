const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const db = require("../config/db");
const { authenticate } = require("../middleware/auth");
const { jwtSecret, issuer, audience, expiresIn, cookieName, cookieOptions } = require("../config/auth");
const router = express.Router();
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false, message: { error: "Too many sign-in attempts. Try again in 15 minutes." } });

router.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
    let employee = await db("employees").whereRaw("lower(email) = lower(?)", [email]).first();
    // First-run bootstrap only creates the single manager. All employee accounts
    // are subsequently created by that manager through the protected API.
    if (!employee && email.toLowerCase() === (process.env.BOOTSTRAP_MANAGER_EMAIL || "manager@arham.com").toLowerCase()) {
      const hash = await bcrypt.hash(process.env.BOOTSTRAP_MANAGER_PASSWORD || "password123", 10);
      [employee] = await db("employees").insert({ id: "00000000-0000-4000-8000-000000000001", name: "Manager", email, role: "MANAGER", password_hash: hash }).returning("*");
    }
    if (!employee?.password_hash || !(await bcrypt.compare(password, employee.password_hash))) return res.status(401).json({ error: "Invalid email or password" });
    const user = { id: employee.id, name: employee.name, email: employee.email, role: employee.role };
    const token = jwt.sign({ role: employee.role }, jwtSecret, { subject: employee.id, expiresIn, algorithm: "HS256", issuer, audience });
    res.cookie(cookieName, token, cookieOptions);
    return res.json({ user });
  } catch (error) { return next(error); }
});

router.get("/me", authenticate, (req, res) => res.json({ data: req.user }));
router.post("/logout", (_req, res) => { res.clearCookie(cookieName, cookieOptions); res.status(204).end(); });
module.exports = router;
