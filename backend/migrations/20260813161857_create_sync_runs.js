exports.up = function (knex) {
  return knex.schema.createTable("sync_runs", (table) => {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());

    table
      .enu("status", ["RUNNING", "SUCCESS", "FAILED"], {
        useNative: true,
        enumName: "sync_status",
      })
      .notNullable();

    table.timestamp("started_at").notNullable().defaultTo(knex.fn.now());

    table.timestamp("completed_at");

    table.integer("attempt").notNullable().defaultTo(1);

    table.integer("records_received").notNullable().defaultTo(0);

    table.integer("records_imported").notNullable().defaultTo(0);

    table.text("error_message");

    table.string("source", 50).notNullable().defaultTo("BSE");

    table.timestamps(true, true);

    table.index(["status"]);
    table.index(["started_at"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("sync_runs");
};