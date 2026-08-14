const employees = [];

for (let i = 1; i <= 20; i++) {
  const employeeId = `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`;

  employees.push({
    id: employeeId,
    name: `Employee ${i}`,
    email: `employee${i}@arham.com`,
    role: "EMPLOYEE",
  });
}

// First employee is the manager.
employees[0].role = "MANAGER";
employees[0].name = "Manager";
employees[0].email = "manager@arham.com";
employees[1].name = "Rahul";
employees[1].email = "rahul@arham.com";
employees[2].name = "Priya";
employees[2].email = "priya@arham.com";

module.exports = employees;
