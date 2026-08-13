const employees = require("../data/employees");
const mappings = require("../data/employeeClients")

const getEmployees = () => {
  return employees;
};

const getMappings = () => {
  return mappings;
};

const getEmployeeData = () => {
  return {
    employees,
    mappings,
  };
};

module.exports = {
  getEmployees,
  getMappings,
  getEmployeeData,
};