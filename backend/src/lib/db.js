const mongoose = require("mongoose");
const { env } = require("../config/env");

let connectionPromise = null;

function connectDatabase() {
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(env.MONGODB_URI);
  }

  return connectionPromise;
}

module.exports = { connectDatabase };