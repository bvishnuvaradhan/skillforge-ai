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
const { scrapingQueue, analyticsQueue } = require("./lib/queue");

// Bull Board (queue UI) - optional mount for ops visibility
let mountBullBoard = false;
try {
  // require lazily so it doesn't break environments without the package
  const { createBullBoard } = require("@bull-board/api");
  const { BullMQAdapter } = require("@bull-board/api/bullMQAdapter");
  const { ExpressAdapter } = require("@bull-board/express");
  mountBullBoard = { createBullBoard, BullMQAdapter, ExpressAdapter };
} catch (err) {
  // Bull Board packages may not be installed in all environments; log and continue
  console.warn("@bull-board packages not available; skipping admin UI mount");
}

const app = express();

app.use(helmet());
// Support multiple origins (comma-separated in CLIENT_ORIGIN) for dev (e.g. localhost:3000,3001)
const allowedOrigins = String(env.CLIENT_ORIGIN || "").split(",").map((s) => s.trim()).filter(Boolean);
app.use(
  cors({
    origin: (incomingOrigin, callback) => {
      // Allow non-browser requests with no origin
      if (!incomingOrigin) return callback(null, true);
      if (allowedOrigins.includes(incomingOrigin)) return callback(null, true);
      return callback(new Error("CORS origin denied"), false);
    },
    credentials: true,
  })
);
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

// NOTE: 404 handler will be registered after optional runtime mounts (e.g., Bull Board)

async function start() {
  await connectDatabase();
  initWorkers();

  // Mount Bull Board UI if available
  if (mountBullBoard) {
    try {
      const serverAdapter = new mountBullBoard.ExpressAdapter();
      serverAdapter.setBasePath("/admin/queues");
      mountBullBoard.createBullBoard({
        queues: [
          new mountBullBoard.BullMQAdapter(scrapingQueue),
          new mountBullBoard.BullMQAdapter(analyticsQueue),
        ],
        serverAdapter,
      });
      // Mount router at root; serverAdapter.setBasePath controls the UI base path
      app.use(serverAdapter.getRouter());
      console.log("Bull Board mounted at /admin/queues");
    } catch (err) {
      console.warn("Failed to mount Bull Board:", err && err.message);
    }
  }

  // 404 handler (registered after dynamic mounts)
  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  app.listen(env.PORT, () => {
    console.log(`Backend running on http://localhost:${env.PORT}`);
  });
}

void start().catch((error) => {
  console.error("Failed to start backend", error);
  process.exit(1);
});