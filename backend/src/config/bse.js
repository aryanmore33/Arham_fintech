const BSE_BASE_URL =
  process.env.BSE_BASE_URL || "http://localhost:4000/api/bse";

const INTERNAL_BASE_URL =
  process.env.INTERNAL_BASE_URL ||
  "http://localhost:4000/api/internal";

const BSE_REQUEST_TIMEOUT_MS = Number(
  process.env.BSE_REQUEST_TIMEOUT_MS || 25000
);

const BSE_MAX_RETRIES = Number(
  process.env.BSE_MAX_RETRIES || 3
);

const BSE_RETRY_BASE_DELAY_MS = Number(
  process.env.BSE_RETRY_BASE_DELAY_MS || 2000
);

const BSE_PAGE_SIZE = Number(
  process.env.BSE_PAGE_SIZE || 500
);
const BSE_EXPORT_POLL_MS = Number(process.env.BSE_EXPORT_POLL_MS || 1000);

module.exports = {
  BSE_BASE_URL,
  INTERNAL_BASE_URL,
  BSE_REQUEST_TIMEOUT_MS,
  BSE_MAX_RETRIES,
  BSE_RETRY_BASE_DELAY_MS,
  BSE_PAGE_SIZE,
  BSE_EXPORT_POLL_MS,
};
