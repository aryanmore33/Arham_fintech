const axios = require("axios");

const {
    BSE_BASE_URL,
    INTERNAL_BASE_URL,
    BSE_REQUEST_TIMEOUT_MS,
    BSE_MAX_RETRIES,
    BSE_RETRY_BASE_DELAY_MS,
} = require("../config/bse");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const createHttpClient = (baseURL) => {
    return axios.create({baseURL, timeout:BSE_REQUEST_TIMEOUT_MS})
}
const bseClient = createHttpClient(BSE_BASE_URL)
const internalClient = createHttpClient(INTERNAL_BASE_URL)

// Execute an HTTP request with exponential backoff.
const requestWithRetry = async (requestFn, label) => {
    let lastError;
    for(let attempt=1; attempt<=BSE_MAX_RETRIES; attempt++) {
        try {
            console.log(`${label}: attempt ${attempt}/${BSE_MAX_RETRIES}`)
            const response = await requestFn();
            return response.data;
        } catch (error) {
            lastError = error
            console.error(`${label}: attempt ${attempt} failed - ${error.message}`)
            if (attempt === BSE_MAX_RETRIES) {
                break;
            }
            const delay = BSE_RETRY_BASE_DELAY_MS*Math.pow(2, attempt-1);
            console.log(`${label}: retrying in ${delay}ms`)
            await sleep(delay)
        }
    } throw lastError;
}

// Fetch one page of clients.
const fetchClientsPage = async ({offset = 0, limit}) => {
    return requestWithRetry(
      () => bseClient.get("/clients", { params: { offset, limit } }),
      `BSE clients [${offset}-${offset + limit}]`
    );
}

// Fetch one page of trades.
const fetchTradesPage = async ({
    offset = 0,
    limit, clientId, from, to, 
}) => {
    return requestWithRetry(
      () => bseClient.get("/trades", { params: { offset, limit, clientId, from, to } }),
      `BSE trades [${offset}-${offset + limit}]`
    );
}

// Internal application is reliable, so we don't need BSE-style retry logic here.
const fetchEmployees = async () => {
    const response = await internalClient.get("/employees")
    return response.data;
}
const fetchMappings = async () => {
    const response = await internalClient.get("/mappings")
    return response.data;
}
const createDemoTrade = async () => (await bseClient.post("/demo-trades")).data;
const createExport = async (data) => (await bseClient.post("/exports", data)).data;
const fetchExportPage = async (id, params) => requestWithRetry(() => bseClient.get(`/exports/${id}`, { params }), `BSE export ${id}`);

module.exports= {
    fetchClientsPage,
  fetchTradesPage,
  fetchEmployees,
  fetchMappings,
  createDemoTrade,
  createExport,
  fetchExportPage,
}
