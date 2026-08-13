exports.up = function (knex) {
  return knex.schema.createTable("employees", (table) => {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());

    table.string("name", 100).notNullable();

    table.string("email", 255).notNullable().unique();

    table
      .enu("role", ["MANAGER", "EMPLOYEE"], {
        useNative: true,
        enumName: "employee_role",
      })
      .notNullable()
      .defaultTo("EMPLOYEE");

    table.string("password_hash", 255).notNullable();

    table.boolean("is_active").notNullable().defaultTo(true);

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("employees");
};