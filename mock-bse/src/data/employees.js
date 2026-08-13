const employees = [];

for (let i = 1; i <= 20; i++) {
  const employeeId = `E${String(i).padStart(3, "0")}`;

  employees.push({
    id: employeeId,
    name: `Employee ${i}`,
    email: `employee${i}@arham.com`,
    role: "EMPLOYEE",
  });
}

// First employee is the manager.
employees[0].role = "MANAGER";
employees[0].name = "Admin Manager";
employees[0].email = "manager@arham.com";

module.exports = employees;