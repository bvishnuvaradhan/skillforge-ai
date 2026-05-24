const mongoose = require("mongoose");
const { env } = require("../config/env");

let connectionPromise = null;

function connectDatabase() {
  // Allow skipping DB connection in local/dev runs for faster startup or when Mongo isn't available
  if (process.env.SKIP_DB === "true") {
    console.warn("[DB] SKIP_DB=true; skipping mongoose.connect and running without persistent DB");
    return Promise.resolve();
  }

  if (!connectionPromise) {
    // Use a short server selection timeout to fail fast when Mongo isn't reachable
    connectionPromise = mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  }

  return connectionPromise;
}

module.exports = { connectDatabase };