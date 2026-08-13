exports.up = function (knex) {
  return knex.schema.createTable("clients", (table) => {
    table.string("id", 50).primary();

    table.string("name", 150).notNullable();

    table.string("email", 255);

    table.string("phone", 20);

    table.string("address", 255);

    table.boolean("is_active").notNullable().defaultTo(true);

    table.timestamps(true, true);

    table.index(["name"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("clients");
};