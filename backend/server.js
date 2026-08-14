require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const http = require("http");
const { Server } = require("socket.io");
const portalRoutes = require("./src/routes/portal.routes");
const authRoutes = require("./src/routes/auth.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/api", portalRoutes);
const frontendBuild = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(fs.existsSync(frontendBuild) ? frontendBuild : path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.json({
    message: "Server is running",
  });
});
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "arham-backend",
    status: "healthy",
  });
});


app.use((err, _req, res, _next) => { console.error(err); res.status(500).json({ error: "Unable to read cached data" }); });
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
app.set("io", io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
