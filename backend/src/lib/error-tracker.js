const Sentry = require("@sentry/node");
const { env } = require("../config/env");

let isSentryEnabled = false;

if (process.env.SENTRY_DSN) {
  try {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: env.NODE_ENV,
      tracesSampleRate: 1.0
    });
    isSentryEnabled = true;
    console.log("[Sentry] Error tracking initialized successfully.");
  } catch (err) {
    console.warn("[Sentry] Failed to initialize Sentry SDK. Falling back to local logging. Error:", err.message);
  }
} else {
  console.log("[Sentry] SENTRY_DSN not configured. Running error reporting in local logging mode.");
}

/**
 * Capture exceptions/errors
 */
function captureException(error, context = {}) {
  if (isSentryEnabled) {
    Sentry.captureException(error, { extra: context });
  }
  console.error(`[ErrorTracker] Exception captured:`, error.message, "\nContext:", JSON.stringify(context));
}

/**
 * Capture informational or warning messages
 */
function captureMessage(message, level = "info", context = {}) {
  if (isSentryEnabled) {
    Sentry.captureMessage(message, { level, extra: context });
  }
  console.log(`[ErrorTracker] Message (${level}):`, message, "\nContext:", JSON.stringify(context));
}

module.exports = {
  captureException,
  captureMessage,
  isSentryEnabled: () => isSentryEnabled
};
