exports.up = async (knex) => {
  if (!(await knex.schema.hasColumn("employees", "password_hash"))) await knex.schema.alterTable("employees", (table) => table.string("password_hash", 255).nullable());
};

exports.down = async (knex) => { if (await knex.schema.hasColumn("employees", "password_hash")) await knex.schema.alterTable("employees", (table) => table.dropColumn("password_hash")); };
