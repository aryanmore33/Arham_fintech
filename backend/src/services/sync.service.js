const trades = require("../../../mock-bse/src/data/trades");
const db = require("../config/db");

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

const stageClients = async (trx, syncRunId, clients) => {
  if (!clients.length) return;
  await trx("staging_clients").insert(clients.map((client) => ({
    sync_run_id: syncRunId, client_id: client.id, name: client.name, email: client.email,
    phone: client.phone, city: client.city,
  }))).onConflict(["sync_run_id", "client_id"]).merge();
};

// A run is only promoted after every page has arrived. Failed runs remain isolated
// in staging, so readers always see the last complete, internally consistent snapshot.
const promoteRun = async (trx, syncRunId) => {
  const clients = await trx("staging_clients").where({ sync_run_id: syncRunId });
  const trades = await trx("staging_trades").where({ sync_run_id: syncRunId });
  if (clients.length) await trx("clients").insert(clients.map(({ client_id, name, email, phone, city }) =>
    ({ id: client_id, name, email, phone, city }))).onConflict("id").merge();
  if (trades.length) await trx("trades").insert(trades.map(({ trade_id, client_id, trade_date, symbol, side, quantity, price, brokerage }) =>
    ({ id: trade_id, client_id, trade_date, symbol, side, quantity, price, brokerage }))).onConflict("id").merge();
  return trades.length;
};
module.exports = {
  createSyncRun,
  updateSyncRun,
  stageTrades,
  stageClients,
  promoteRun,
};
