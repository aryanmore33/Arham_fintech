const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const bseRoutes = require("./src/routes/bse.routes");
const internalRoutes = require("./src/routes/internal.routes")

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/bse", bseRoutes);
app.use("/api/internal", internalRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "mock-bse",
    status: "healthy",
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Mock BSE API running on port ${PORT}`);
});
