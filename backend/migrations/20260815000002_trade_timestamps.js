exports.up = async (knex) => {
  // Preserve the actual exchange execution time, not only the calendar date.
  await knex.raw("ALTER TABLE trades ALTER COLUMN trade_date TYPE timestamp USING trade_date::timestamp");
  await knex.raw("ALTER TABLE staging_trades ALTER COLUMN trade_date TYPE timestamp USING trade_date::timestamp");
};
exports.down = async (knex) => {
  await knex.raw("ALTER TABLE trades ALTER COLUMN trade_date TYPE date USING trade_date::date");
  await knex.raw("ALTER TABLE staging_trades ALTER COLUMN trade_date TYPE date USING trade_date::date");
};
