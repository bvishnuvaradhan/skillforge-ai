const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const { env } = require("./config/env");
const { connectDatabase } = require("./lib/db");
const { authRouter } = require("./routes/auth");
const { profileRouter } = require("./routes/profile");
const { analyticsRouter } = require("./routes/analytics");
const { adminRouter } = require("./routes/admin");
const { initWorkers } = require("./workers");

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "skillforge-backend",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/v1", (_req, res) => {
  res.status(200).json({
    message: "SkillForge API is ready",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/profiles", profileRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/admin", adminRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

async function start() {
  await connectDatabase();
  initWorkers();

  app.listen(env.PORT, () => {
    console.log(`Backend running on http://localhost:${env.PORT}`);
  });
}

void start().catch((error) => {
  console.error("Failed to start backend", error);
  process.exit(1);
});