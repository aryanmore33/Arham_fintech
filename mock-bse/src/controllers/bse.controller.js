const bseService = require("../services/bse.service");

const getClients = async (req, res) => {
  try {
    const clients = await bseService.getClients(req.query);

    return res.status(200).json({
      success: true,
      count: clients.data.length,
      ...clients,
    });
  } catch (error) {
    console.error(
      "BSE clients pull failed:",
      error.message
    );

    return res.status(503).json({
      success: false,
      error: error.message,
      code: error.code || "BSE_ERROR",
      recordsProcessed: error.recordsProcessed || 0,
      totalRecords: error.totalRecords || 0,
    });
  }
};

const getTrades = async (req, res) => {
  try {
    const trades = await bseService.getTrades(req.query);

    return res.status(200).json({
      success: true,
      count: trades.data.length,
      ...trades,
    });
  } catch (error) {
    console.error(
      "BSE trades pull failed:",
      error.message
    );

    return res.status(503).json({
      success: false,
      error: error.message,
      code: error.code || "BSE_ERROR",
      recordsProcessed: error.recordsProcessed || 0,
      totalRecords: error.totalRecords || 0,
    });
  }
};

const createDemoTrade = (_req, res) => res.status(201).json({ success: true, data: bseService.addDemoTrade() });
const createExport = (req, res) => res.status(202).json({ success: true, data: bseService.createExport(req.body) });
const getExport = async (req, res) => {
  try { const page = await bseService.getExportPage(req.params.id, req.query); return res.json({ success: true, ...page }); }
  catch (error) { return res.status(error.code === "EXPORT_NOT_FOUND" ? 404 : 503).json({ success: false, error: error.message, code: error.code }); }
};

module.exports = {
  getClients,
  getTrades,
  createDemoTrade,
  createExport,
  getExport,
};
