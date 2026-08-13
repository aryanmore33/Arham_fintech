const bseService = require("../services/bse.service");

const getClients = async (req, res) => {
  try {
    const clients = await bseService.getClients();

    return res.status(200).json({
      success: true,
      count: clients.length,
      data: clients,
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
    const {
      clientId,
      from,
      to,
    } = req.query;

    const trades = await bseService.getTrades({
      clientId,
      from,
      to,
    });

    return res.status(200).json({
      success: true,
      count: trades.length,
      data: trades,
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
