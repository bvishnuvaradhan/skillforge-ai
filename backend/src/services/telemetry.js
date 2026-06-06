const api = require("@opentelemetry/api");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { SimpleSpanProcessor, ConsoleSpanExporter } = require("@opentelemetry/sdk-trace-base");

let provider = null;
try {
  provider = new NodeTracerProvider();
  provider.register();
  
  if (process.env.ENABLE_TELEMETRY_CONSOLE === "true") {
    provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
    console.log("[Telemetry] OpenTelemetry Console Exporter registered.");
  }
  console.log("[Telemetry] OpenTelemetry SDK initialized successfully.");
} catch (err) {
  console.warn("[Telemetry] Failed to initialize OpenTelemetry SDK. Traces will use Noop provider. Error:", err.message);
}

let tracerInstance = null;

/**
 * Gets or initializes the OpenTelemetry tracer instance
 */
function getTracer() {
  if (!tracerInstance) {
    tracerInstance = api.trace.getTracer("skillforge-backend");
  }
  return tracerInstance;
}

/**
 * Wraps an async function call inside a tracing span.
 * Records exceptions, status, and custom attributes.
 */
async function traceSpan(name, fn, attributes = {}) {
  const tracer = getTracer();
  return tracer.startActiveSpan(name, async (span) => {
    try {
      if (attributes && Object.keys(attributes).length > 0) {
        span.setAttributes(attributes);
      }
      const result = await fn(span);
      span.setStatus({ code: api.SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: api.SpanStatusCode.ERROR,
        message: error.message
      });
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Express middleware to attach span context to incoming HTTP requests
 */
function traceExpressRequest() {
  return (req, res, next) => {
    const spanName = `${req.method} ${req.baseUrl || req.path}`;
    const tracer = getTracer();
    
    const span = tracer.startSpan(spanName, {
      attributes: {
        "http.method": req.method,
        "http.url": req.url,
        "http.route": req.baseUrl || req.path,
        "http.ip": req.ip || ""
      }
    });

    req.span = span;

    res.on("finish", () => {
      span.setAttribute("http.status_code", res.statusCode);
      if (res.statusCode >= 400) {
        span.setStatus({ code: api.SpanStatusCode.ERROR, message: `HTTP ${res.statusCode}` });
      } else {
        span.setStatus({ code: api.SpanStatusCode.OK });
      }
      span.end();
    });

    next();
  };
}

module.exports = {
  traceSpan,
  traceExpressRequest,
  getTracer
};
