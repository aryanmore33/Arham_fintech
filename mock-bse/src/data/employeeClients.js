const mappings = [];

const employeeCount = 19;
const clientCount = 300;

for (let clientNumber = 1; clientNumber <= clientCount; clientNumber++) {
  const employeeNumber =
    ((clientNumber - 1) % employeeCount) + 2;

  mappings.push({
    employeeId: `E${String(employeeNumber).padStart(3, "0")}`,
    clientId: `C${String(clientNumber).padStart(3, "0")}`,
  });
}

module.exports = mappings;