const express = require("express");

const {
  getClients,
  getTrades,
} = require("../controllers/bse.controller");

const router = express.Router();

router.get("/clients", getClients);

router.get("/trades", getTrades);

module.exports = router;