const clients = require("../data/clients");
const trades = require("../data/trades");
const crypto = require("crypto");
const exportsById = new Map();

const delay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const getDelay = () =>
  Number(process.env.BSE_DELAY_MS || 5000);

const getFailureRate = () =>
  Number(process.env.BSE_FAILURE_RATE || 0.2);

const getBatchSize = () =>
  Number(process.env.BSE_BATCH_SIZE || 500);

const getBatchDelay = () =>
  Number(process.env.BSE_BATCH_DELAY_MS || 1000);

//  Simulates processing of one BSE pull.

const processPull = async (data) => {
  const batchSize = getBatchSize();
  const batchDelay = getBatchDelay();

  const shouldFail =
    Math.random() < getFailureRate();

  const failurePoint = shouldFail
    ? Math.floor(
        data.length * (0.4 + Math.random() * 0.4)
      )
    : null;

  let processed = 0;

  while (processed < data.length) {
    const currentBatchSize = Math.min(
      batchSize,
      data.length - processed
    );

    processed += currentBatchSize;

    console.log(
      `BSE: processed ${processed}/${data.length}`
    );

    if (
      failurePoint !== null &&
      processed >= failurePoint
    ) {
      const error = new Error(
        `BSE pull failed after ${processed}/${data.length} records`
      );

      error.code = "BSE_MID_PULL_FAILURE";
      error.recordsProcessed = processed;
      error.totalRecords = data.length;

      throw error;
    }

    if (processed < data.length) {
      await delay(batchDelay);
    }
  }

  return data;
};


//  Get paginated clients.
const getClients = async ({
  offset = 0,
  limit = 500,
}) => {
  console.log(
    `BSE clients request: offset=${offset}, limit=${limit}`
  );

  await delay(getDelay());

  const page = clients.slice(
    offset,
    offset + limit
  );

  await processPull(page);

  return {
    data: page,
    total: clients.length,
    offset,
    limit,
    hasMore: offset + page.length < clients.length,
  };
};

// Get paginated trades.
const getTrades = async ({
  offset = 0,
  limit = 500,
  clientId,
  from,
  to,
}) => {
  console.log(
    `BSE trades request: offset=${offset}, limit=${limit}`
  );

  await delay(getDelay());

  let filteredTrades = trades;

  if (clientId) {
    filteredTrades = filteredTrades.filter(
      (trade) =>
        trade.clientId === clientId
    );
  }

  if (from) {
    filteredTrades = filteredTrades.filter(
      (trade) =>
        trade.tradeDate.slice(0, 10) >= from
    );
  }

  if (to) {
    filteredTrades = filteredTrades.filter(
      (trade) =>
        trade.tradeDate.slice(0, 10) <= to
    );
  }

  const page = filteredTrades.slice(
    offset,
    offset + limit
  );

  await processPull(page);

  return {
    data: page,
    total: filteredTrades.length,
    offset,
    limit,
    hasMore:
      offset + page.length <
      filteredTrades.length,
  };
};

const addDemoTrade = () => {
  const symbols = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK", "SBIN", "ITC"];
  // C001, C020, ... are Rahul's mapped clients in the deterministic mock mapping.
  const rahulClients = Array.from({ length: 16 }, (_, index) => `C${String(1 + index * 19).padStart(3, "0")}`);
  const quantity = Math.floor(Math.random() * 900) + 100;
  const price = Number((Math.random() * 4200 + 150).toFixed(2));
  const now = new Date();
  // Keep it newer than seeded August trades, so the newest-first portal table
  // visibly changes immediately while the precise execution time still varies.
  now.setMinutes(now.getMinutes() - Math.floor(Math.random() * 60 * 8));
  const trade = { id: `LIVE${Date.now()}${Math.floor(Math.random() * 1000)}`, clientId: rahulClients[Math.floor(Math.random() * rahulClients.length)], tradeDate: now.toISOString(), symbol: symbols[Math.floor(Math.random() * symbols.length)], side: Math.random() > 0.5 ? "BUY" : "SELL", quantity, price, brokerage: Number((quantity * price * (0.0003 + Math.random() * 0.0005)).toFixed(2)) };
  trades.push(trade);
  return trade;
};

const createExport = ({ resource, clientId, from, to }) => {
  let data = resource === "clients" ? clients : trades;
  if (resource === "trades" && clientId) data = data.filter((trade) => trade.clientId === clientId);
  if (resource === "trades" && from) data = data.filter((trade) => trade.tradeDate.slice(0, 10) >= from);
  if (resource === "trades" && to) data = data.filter((trade) => trade.tradeDate.slice(0, 10) <= to);
  const id = crypto.randomUUID();
  exportsById.set(id, { data, readyAt: Date.now() + getDelay() });
  return { id, status: "PENDING", retryAfterMs: Math.min(getDelay(), 5000) };
};
const getExport = (id) => {
  const job = exportsById.get(id);
  if (!job) return null;
  return Date.now() < job.readyAt ? { id, status: "PENDING", retryAfterMs: Math.min(job.readyAt - Date.now(), 5000) } : { id, status: "READY", total: job.data.length };
};
const getExportPage = async (id, { offset = 0, limit = 500 }) => {
  const job = exportsById.get(id);
  if (!job) { const error = new Error("Unknown export job"); error.code = "EXPORT_NOT_FOUND"; throw error; }
  if (Date.now() < job.readyAt) return { status: "PENDING", retryAfterMs: Math.min(job.readyAt - Date.now(), 5000) };
  const page = job.data.slice(Number(offset), Number(offset) + Number(limit));
  await processPull(page);
  return { status: "READY", data: page, total: job.data.length, offset: Number(offset), limit: Number(limit), hasMore: Number(offset) + page.length < job.data.length };
};

module.exports = {
  getClients,
  getTrades,
  addDemoTrade,
  createExport,
  getExport,
  getExportPage,
};
