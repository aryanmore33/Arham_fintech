exports.up = function (knex) {
  return knex.schema.createTable("trades", (table) => {
    table.string("id", 100).primary();

    table
      .string("client_id", 50)
      .notNullable()
      .references("id")
      .inTable("clients")
      .onDelete("RESTRICT");

    table.date("trade_date").notNullable();

    table.string("symbol", 30).notNullable();

    table
      .enu("side", ["BUY", "SELL"], {
        useNative: true,
        enumName: "trade_side",
      })
      .notNullable();

    table.bigInteger("quantity").notNullable();

    table.decimal("price", 18, 4).notNullable();

    table.decimal("brokerage", 18, 4).notNullable();

    table.timestamps(true, true);

    // Important indexes
    table.index(["client_id"]);

    table.index(["trade_date"]);

    table.index(["client_id", "trade_date"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("trades");
};