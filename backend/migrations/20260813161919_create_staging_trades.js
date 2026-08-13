exports.up = function (knex) {
  return knex.schema.createTable("staging_trades", (table) => {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());

    table
      .uuid("sync_run_id")
      .notNullable()
      .references("id")
      .inTable("sync_runs")
      .onDelete("CASCADE");

    table.string("trade_id", 100).notNullable();

    table.string("client_id", 50).notNullable();

    table.date("trade_date").notNullable();

    table.string("symbol", 30).notNullable();

    table
      .enu("side", ["BUY", "SELL"], {
        useNative: true,
        enumName: "staging_trade_side",
      })
      .notNullable();

    table.bigInteger("quantity").notNullable();

    table.decimal("price", 18, 4).notNullable();

    table.decimal("brokerage", 18, 4).notNullable();

    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());

    table.unique(["sync_run_id", "trade_id"]);

    table.index(["sync_run_id"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("staging_trades");
};