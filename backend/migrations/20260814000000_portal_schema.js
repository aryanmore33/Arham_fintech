exports.up = async (knex) => {
  // Shared environments may already have the earlier migration-branch schema.
  if (await knex.schema.hasTable("employees")) return;
  await knex.schema.createTable("employees", (t) => {
    t.string("id", 50).primary(); t.string("name", 100).notNullable(); t.string("email", 255).notNullable().unique();
    t.string("role", 20).notNullable(); t.timestamps(true, true);
  });
  await knex.schema.createTable("clients", (t) => {
    t.string("id", 50).primary(); t.string("name", 150).notNullable(); t.string("email", 255); t.string("phone", 30); t.string("city", 100); t.timestamps(true, true);
  });
  await knex.schema.createTable("employee_clients", (t) => {
    t.string("employee_id", 50).references("id").inTable("employees").onDelete("CASCADE");
    t.string("client_id", 50).references("id").inTable("clients").onDelete("CASCADE"); t.primary(["employee_id", "client_id"]);
  });
  await knex.schema.createTable("trades", (t) => {
    t.string("id", 100).primary(); t.string("client_id", 50).notNullable().references("id").inTable("clients");
    t.date("trade_date").notNullable(); t.string("symbol", 30).notNullable(); t.string("side", 10).notNullable(); t.bigInteger("quantity").notNullable(); t.decimal("price", 18, 4).notNullable(); t.decimal("brokerage", 18, 4).notNullable(); t.timestamps(true, true);
    t.index(["client_id", "trade_date"]);
  });
  await knex.schema.createTable("sync_runs", (t) => { t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()")); t.string("status", 20).notNullable(); t.integer("attempt").notNullable().defaultTo(1); t.integer("records_received").defaultTo(0); t.integer("records_imported").defaultTo(0); t.string("source", 50); t.text("error_message"); t.timestamp("started_at").defaultTo(knex.fn.now()); t.timestamp("completed_at"); });
  await knex.schema.createTable("staging_clients", (t) => { t.uuid("sync_run_id").references("id").inTable("sync_runs").onDelete("CASCADE"); t.string("client_id", 50); t.string("name", 150); t.string("email", 255); t.string("phone", 30); t.string("city", 100); t.primary(["sync_run_id", "client_id"]); });
  await knex.schema.createTable("staging_trades", (t) => { t.uuid("sync_run_id").references("id").inTable("sync_runs").onDelete("CASCADE"); t.string("trade_id", 100); t.string("client_id", 50); t.date("trade_date"); t.string("symbol", 30); t.string("side", 10); t.bigInteger("quantity"); t.decimal("price", 18, 4); t.decimal("brokerage", 18, 4); t.primary(["sync_run_id", "trade_id"]); });
};
exports.down = async (knex) => { for (const name of ["staging_trades", "staging_clients", "employee_clients", "trades", "clients", "employees", "sync_runs"]) await knex.schema.dropTableIfExists(name); };
