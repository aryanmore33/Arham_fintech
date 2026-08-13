const internalService = require("../services/internal.service")

const getEmployees = (req, res) => {
  const employees = internalService.getEmployees();

  return res.status(200).json({
    success: true,
    count: employees.length,
    data: employees,
  });
};

const getMappings = (req, res) => {
  const mappings = internalService.getMappings();

  return res.status(200).json({
    success: true,
    count: mappings.length,
    data: mappings,
  });
};

const getEmployeeData = (req, res) => {
  const data = internalService.getEmployeeData();

  return res.status(200).json({
    success: true,
    data,
  });
};

module.exports = {
  getEmployees,
  getMappings,
  getEmployeeData,
};