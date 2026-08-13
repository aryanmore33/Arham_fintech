const clients = require("../data/clients");
const trades = require("../data/trades");

const delay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const getDelay = () => {
  return Number(process.env.BSE_DELAY_MS || 5000);
};

const getFailureRate = () => {
  return Number(process.env.BSE_FAILURE_RATE || 0.2);
};

const getBatchSize = () => {
  return Number(process.env.BSE_BATCH_SIZE || 500);
};

const getBatchDelay = () => {
  return Number(process.env.BSE_BATCH_DELAY_MS || 1000);
};

const processPull = async (data) => {
  const batchSize = getBatchSize();
  const batchDelay = getBatchDelay();

  const shouldFail = Math.random() < getFailureRate();

  const failurePoint = shouldFail
    ? Math.floor(
        data.length * (0.4 + Math.random() * 0.4)
      )
    : null;

  let processed = 0;

  while (processed < data.length) {
    const remaining = data.length - processed;

    const currentBatchSize = Math.min(
      batchSize,
      remaining
    );

    processed += currentBatchSize;

    console.log(
      `BSE: processed ${processed}/${data.length}`
    );

    if (
      failurePoint !== null &&
      processed >= failurePoint
    ) {
      console.log(
        `BSE: simulated mid-pull failure at ${processed}/${data.length}`
      );

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

const getClients = async () => {
  console.log("BSE: starting clients pull");

  await delay(getDelay());

  const result = await processPull(clients);

  console.log("BSE: clients pull completed");

  return result;
};

const getTrades = async ({
  clientId,
  from,
  to,
}) => {
  console.log("BSE: starting trades pull");

  await delay(getDelay());

  let result = trades;

  if (clientId) {
    result = result.filter(
      (trade) => trade.clientId === clientId
    );
  }

  if (from) {
    result = result.filter(
      (trade) => trade.tradeDate >= from
    );
  }

  if (to) {
    result = result.filter(
      (trade) => trade.tradeDate <= to
    );
  }

  const processedResult = await processPull(result);

  console.log(
    `BSE: trades pull completed. ${processedResult.length} records`
  );

  return processedResult;
};

module.exports = {
  getClients,
  getTrades,
};