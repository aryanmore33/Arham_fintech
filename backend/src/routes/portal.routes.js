const express = require("express");
const db = require("../config/db");
const { authenticate, requireManager } = require("../middleware/auth");
const { runBseSync } = require("../workers/bseSync.worker");
const { createDemoTrade } = require("../services/bse.service");
const bcrypt = require("bcrypt");
const { randomUUID } = require("crypto");
const router = express.Router();

router.use(authenticate);
const clientScope = (query, user) => user.role === "MANAGER" ? query : query.join("employee_clients as access", "clients.id", "access.client_id").where("access.employee_id", user.id);
const tradeScope = (query, user) => user.role === "MANAGER" ? query : query.join("employee_clients as access", "trades.client_id", "access.client_id").where("access.employee_id", user.id);

router.get("/clients", async (req, res, next) => { try { res.json({ data: await clientScope(db("clients").select("clients.*"), req.user).orderBy("clients.id") }); } catch (e) { next(e); } });
router.get("/trades", async (req, res, next) => { try {
  const base = req.user.role === "MANAGER"
    ? db("trades").join("clients", "trades.client_id", "clients.id").leftJoin("employee_clients as ownership", "trades.client_id", "ownership.client_id").leftJoin("employees as owner", "ownership.employee_id", "owner.id").select("trades.*", "clients.name as client_name", "owner.name as employee_name")
    : db("trades").join("clients", "trades.client_id", "clients.id").select("trades.*", "clients.name as client_name");
  const q = tradeScope(base.orderBy("trades.trade_date", "desc").limit(1000), req.user);
  if (req.query.clientId) q.where("trades.client_id", req.query.clientId); if (req.query.from) q.where("trades.trade_date", ">=", req.query.from); if (req.query.to) q.where("trades.trade_date", "<=", req.query.to);
  if (req.user.role === "MANAGER" && req.query.employeeId) q.where("ownership.employee_id", req.query.employeeId);
  res.json({ data: await q });
} catch (e) { next(e); } });
router.get("/employee-clients", requireManager, async (_req, res, next) => { try {
  const rows = await db("employee_clients as ec").join("employees as e", "ec.employee_id", "e.id").join("clients as c", "ec.client_id", "c.id").leftJoin("trades as t", "c.id", "t.client_id").select("e.name as employee_name", "e.email as employee_email", "c.name as client_name", "c.email as client_email", "c.phone", "c.city").sum({ brokerage: "t.brokerage" }).groupBy("e.name", "e.email", "c.name", "c.email", "c.phone", "c.city").orderBy(["e.name", "c.name"]);
  res.json({ data: rows.map((row) => ({ ...row, brokerage: Number(row.brokerage || 0) })) });
} catch (e) { next(e); } });
router.get("/employees", requireManager, async (_req, res, next) => { try {
  const rows = await db("employees as e").leftJoin("employee_clients as ec", "e.id", "ec.employee_id").leftJoin("trades as t", "ec.client_id", "t.client_id").select("e.id", "e.name", "e.email", "e.role").countDistinct({ client_count: "ec.client_id" }).sum({ brokerage: "t.brokerage" }).groupBy("e.id", "e.name", "e.email", "e.role").orderBy("e.name");
  res.json({ data: rows.map((row) => ({ ...row, brokerage: Number(row.brokerage || 0) })) });
} catch (e) { next(e); } });
router.post("/employees", requireManager, async (req, res, next) => { try {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 8) return res.status(400).json({ error: "Name, email, and an 8-character password are required" });
  const [employee] = await db("employees").insert({ id: randomUUID(), name, email: email.toLowerCase(), role: "EMPLOYEE", password_hash: await bcrypt.hash(password, 10) }).returning(["id", "name", "email", "role"]);
  res.status(201).json({ data: employee });
} catch (e) { if (e.code === "23505") return res.status(409).json({ error: "That email is already in use" }); next(e); } });
router.get("/employees/:id/clients", async (req, res, next) => { try {
  if (req.user.role !== "MANAGER" && req.user.id !== req.params.id) return res.status(403).json({ error: "You can only view your own clients" });
  const rows = await db("clients").join("employee_clients", "clients.id", "employee_clients.client_id").leftJoin("trades", "clients.id", "trades.client_id").where("employee_clients.employee_id", req.params.id).select("clients.*").sum({ brokerage: "trades.brokerage" }).groupBy("clients.id", "clients.name", "clients.email", "clients.phone", "clients.city", "clients.created_at", "clients.updated_at").orderBy("clients.id");
  res.json({ data: rows.map((row) => ({ ...row, brokerage: Number(row.brokerage || 0) })) });
} catch (e) { next(e); } });
router.get("/incentives", async (req, res, next) => { try {
  const requestedId = req.query.employeeId;
  if (req.user.role !== "MANAGER" && requestedId && requestedId !== req.user.id) return res.status(403).json({ error: "You can only view your own incentive" });
  const q = db("employees as e").leftJoin("employee_clients as ec", "e.id", "ec.employee_id").leftJoin("trades as t", "ec.client_id", "t.client_id").select("e.id", "e.name", "e.role").sum({ brokerage: "t.brokerage" }).groupBy("e.id", "e.name", "e.role").orderBy("e.name");
  if (req.user.role !== "MANAGER") q.where("e.id", req.user.id); else if (requestedId) q.where("e.id", requestedId);
  const rows = await q; res.json({ data: rows.map((r) => ({ ...r, brokerage: Number(r.brokerage || 0), incentive: Number(r.brokerage || 0) * 0.1 })) });
} catch (e) { next(e); } });
const broadcastSyncResult = (app, result) => {
  const io = app.get("io");
  if (!io) return;
  if (result.success) io.emit("data:updated", { syncRunId: result.syncRunId, recordsReceived: result.recordsReceived });
  else io.emit("data:sync-failed", { syncRunId: result.syncRunId });
};
router.post("/sync", requireManager, async (req, res) => { res.status(202).json({ message: "Sync started" }); runBseSync().then((result) => broadcastSyncResult(req.app, result)); });
router.post("/demo-trade", requireManager, async (req, res, next) => { try {
  const trade = await createDemoTrade();
  res.status(202).json({ message: "Demo trade created; BSE sync started", data: trade.data || trade });
  runBseSync().then((result) => broadcastSyncResult(req.app, result));
} catch (e) { next(e); } });
router.get("/sync-runs", requireManager, async (_req, res, next) => { try { res.json({ data: await db("sync_runs").orderBy("started_at", "desc").limit(10) }); } catch (e) { next(e); } });
module.exports = router;
