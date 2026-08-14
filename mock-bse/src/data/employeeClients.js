const mappings = [];

const employees = require("./employees");
const employeeCount = 19;
const clientCount = 300;

for (let clientNumber = 1; clientNumber <= clientCount; clientNumber++) {
  const employeeNumber =
    ((clientNumber - 1) % employeeCount) + 2;

  mappings.push({
    employeeId: employees[employeeNumber - 1].id,
    clientId: `C${String(clientNumber).padStart(3, "0")}`,
  });
}

module.exports = mappings;
