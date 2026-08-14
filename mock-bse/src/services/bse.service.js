const clients = require("../data/clients");
const trades = require("../data/trades");

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
        trade.tradeDate >= from
    );
  }

  if (to) {
    filteredTrades = filteredTrades.filter(
      (trade) =>
        trade.tradeDate <= to
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


module.exports = {
  getClients,
  getTrades,
};