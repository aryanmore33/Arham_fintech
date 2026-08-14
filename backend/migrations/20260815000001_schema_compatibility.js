exports.up = async (knex) => {
  if (!(await knex.schema.hasColumn("clients", "city"))) await knex.schema.alterTable("clients", (table) => table.string("city", 100));
  if (!(await knex.schema.hasTable("staging_clients"))) await knex.schema.createTable("staging_clients", (table) => {
    table.uuid("sync_run_id").notNullable().references("id").inTable("sync_runs").onDelete("CASCADE");
    table.string("client_id", 50).notNullable(); table.string("name", 150).notNullable(); table.string("email", 255); table.string("phone", 30); table.string("city", 100);
    table.primary(["sync_run_id", "client_id"]);
  });
};
exports.down = async (knex) => { if (await knex.schema.hasTable("staging_clients")) await knex.schema.dropTable("staging_clients"); };
