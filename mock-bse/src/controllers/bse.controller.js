const bseService = require("../services/bse.service");

const getClients = async (req, res) => {
  try {
    const clients = await bseService.getClients();

    res.status(200).json({
      success: true,
      count: clients.length,
      data: clients,
    });
  } catch (error) {
    console.error("BSE clients error:", error.message);

    res.status(503).json({
      success: false,
      error: "BSE source temporarily unavailable",
    });
  }
};

const getTrades = async (req, res) => {
  try {
    const { clientId, from, to } = req.query;

    const trades = await bseService.getTrades({
      clientId,
      from,
      to,
    });

    res.status(200).json({
      success: true,
      count: trades.length,
      data: trades,
    });
  } catch (error) {
    console.error("BSE trades error:", error.message);

    res.status(503).json({
      success: false,
      error: "BSE source temporarily unavailable",
    });
  }
};

module.exports = {
  getClients,
  getTrades,
};
