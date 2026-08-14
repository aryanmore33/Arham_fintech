require("dotenv").config();
const bcrypt = require("bcrypt");
const db = require("../config/db");
const clients = require("../../../mock-bse/src/data/clients");
const trades = require("../../../mock-bse/src/data/trades");
const employees = require("../../../mock-bse/src/data/employees");
const mappings = require("../../../mock-bse/src/data/employeeClients");

async function seedDemo() {
  const passwordHash = await bcrypt.hash("password123", 10);
  await db.transaction(async (trx) => {
    await trx("clients").insert(clients.map(({ id, name, email, phone, city }) => ({ id, name, email, phone, city }))).onConflict("id").merge();
    await trx("employees").insert(employees.map(({ id, name, email, role }) => ({ id, name, email, role, password_hash: passwordHash }))).onConflict("id").merge();
    await trx("employee_clients").insert(mappings.map(({ employeeId, clientId }) => ({ employee_id: employeeId, client_id: clientId }))).onConflict(["employee_id", "client_id"]).ignore();
    await trx("trades").insert(trades.map(({ id, clientId, tradeDate, symbol, side, quantity, price, brokerage }) => ({ id, client_id: clientId, trade_date: tradeDate, symbol, side, quantity, price, brokerage }))).onConflict("id").merge();
  });
  console.log(`Demo seeded: ${clients.length} clients, ${trades.length} trades, ${employees.length} employees.`);
}
seedDemo().then(() => db.destroy()).catch((error) => { console.error(error); db.destroy(); process.exitCode = 1; });
