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

const simulateBseBehavior = async () => {
  const delayMs = getDelay();

  console.log(`BSE: waiting ${delayMs}ms...`);

  await delay(delayMs);

  const shouldFail = Math.random() < getFailureRate();

  if (shouldFail) {
    console.log("BSE: simulated failure");

    const error = new Error("Simulated BSE connection failure");
    error.code = "BSE_MOCK_FAILURE";

    throw error;
  }
};

const getClients = async () => {
  await simulateBseBehavior();

  return clients;
};

const getTrades = async ({ clientId, from, to }) => {
  await simulateBseBehavior();

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

  return result;
};

module.exports = {
  getClients,
  getTrades,
};
