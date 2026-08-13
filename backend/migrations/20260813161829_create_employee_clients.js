exports.up = function (knex) {
  return knex.schema.createTable("employee_clients", (table) => {
    table
      .uuid("employee_id")
      .notNullable()
      .references("id")
      .inTable("employees")
      .onDelete("CASCADE");

    table
      .string("client_id", 50)
      .notNullable()
      .references("id")
      .inTable("clients")
      .onDelete("CASCADE");

    table
      .timestamp("assigned_at")
      .notNullable()
      .defaultTo(knex.fn.now());

    table.primary(["employee_id", "client_id"]);

    table.index(["employee_id"]);
    table.index(["client_id"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("employee_clients");
};