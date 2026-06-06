const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const { traceExpressRequest } = require("./services/telemetry");
const errorTracker = require("./lib/error-tracker");
const { env } = require("./config/env");
const { connectDatabase } = require("./lib/db");
const { authRouter } = require("./routes/auth");
const { profileRouter } = require("./routes/profile");
const { analyticsRouter } = require("./routes/analytics");
const { recommendationsRouter } = require("./routes/recommendations");
const { adminRouter } = require("./routes/admin");
const { dnaRouter } = require("./routes/dna");
const { decayRouter } = require("./routes/decay");
const { dependenciesRouter } = require("./routes/dependencies");
const { arbitrationRouter } = require("./routes/arbitration");
const { tracesRouter } = require("./routes/traces");
const { observabilityRouter } = require("./routes/observability");
const { mentorRouter } = require("./routes/mentor");
const { teamRouter } = require("./routes/team");
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

// Mount OpenTelemetry Express request tracing middleware first
app.use(traceExpressRequest());

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

// Route all business routes to /api/v1 namespace prefix
const apiPrefix = "/api/v1";
app.use(`${apiPrefix}/auth`, authRouter);
app.use(`${apiPrefix}/profiles`, profileRouter);
app.use(`${apiPrefix}/analytics`, analyticsRouter);
app.use(`${apiPrefix}/recommendations`, recommendationsRouter);
app.use(`${apiPrefix}/admin`, adminRouter);
app.use(`${apiPrefix}/dna`, dnaRouter);
app.use(`${apiPrefix}/decay`, decayRouter);
app.use(`${apiPrefix}/dependencies`, dependenciesRouter);
app.use(`${apiPrefix}/arbitration`, arbitrationRouter);
app.use(`${apiPrefix}/traces`, tracesRouter);
app.use(`${apiPrefix}/observability`, observabilityRouter);
app.use(`${apiPrefix}/mentor`, mentorRouter);
app.use(`${apiPrefix}/teams`, teamRouter);

// Maintain temporary fallback wrappers for backward compatibility
app.use("/api/auth", authRouter);
app.use("/api/profiles", profileRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/recommendations", recommendationsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/dna", dnaRouter);
app.use("/api/decay", decayRouter);
app.use("/api/dependencies", dependenciesRouter);
app.use("/api/arbitration", arbitrationRouter);
app.use("/api/traces", tracesRouter);
app.use("/api/observability", observabilityRouter);
app.use("/api/mentor", mentorRouter);
app.use("/api/teams", teamRouter);

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

  // Global error handler with Sentry error tracker integration
  app.use((err, req, res, next) => {
    errorTracker.captureException(err, {
      url: req.url,
      method: req.method,
      ip: req.ip
    });
    res.status(500).json({ error: "Internal Server Error" });
  });

  app.listen(env.PORT, () => {
    console.log(`Backend running on http://localhost:${env.PORT}`);
  });
}

void start().catch((error) => {
  console.error("Failed to start backend", error);
  process.exit(1);
});