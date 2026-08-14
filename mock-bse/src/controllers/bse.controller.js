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

module.exports = {
  getClients,
  getTrades,
};
