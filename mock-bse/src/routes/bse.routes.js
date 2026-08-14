const express = require("express");

const {
  getClients,
  getTrades,
  createDemoTrade,
  createExport,
  getExport,
} = require("../controllers/bse.controller");

const router = express.Router();

router.get("/clients", getClients);

router.get("/trades", getTrades);
router.post("/demo-trades", createDemoTrade);
router.post("/exports", createExport);
router.get("/exports/:id", getExport);

module.exports = router;
