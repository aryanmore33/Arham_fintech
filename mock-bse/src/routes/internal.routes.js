const express = require("express");

const {
  getEmployees,
  getMappings,
  getEmployeeData,
} = require("../controllers/internal.controller");

const router = express.Router();

router.get("/employees", getEmployees);

router.get("/mappings", getMappings);

router.get("/employees-mappings", getEmployeeData);

module.exports = router;