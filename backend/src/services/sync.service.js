const trades = require("../../../mock-bse/src/data/trades");
const db = require("../config/database");

const createSyncRun = async () => {
    const [syncRun] = await db("sync_runs")
        .insert({
            status: "RUNNING",
            attempt: 1,
            source: "BSE",
        })
        .returning("*")
    return syncRun;
}

const updateSyncRun = async (syncRunId, data) => {
    await db("sync_runs")
        .where({ id: syncRunId })
        .update(data);
};

const stageTrades = async (trx, syncRunId, trades) => {
    if (!trades.length) { return 0; }
    const rows = trades.map((trade) => ({
        sync_run_id: syncRunId,
        trade_id: trade.id,
        client_id: trade.clientId,
        trade_date: trade.tradeDate,
        symbol: trade.symbol,
        side: trade.side,
        quantity: trade.quantity,
        price: trade.price,
        brokerage: trade.brokerage,
    }));
    await trx("staging_trades")
        .insert(rows)
        .onConflict(["sync_run_id", "trade_id"])
        .ignore();
    return rows.length;
}
module.exports = {
  createSyncRun,
  updateSyncRun,
  stageTrades,
};