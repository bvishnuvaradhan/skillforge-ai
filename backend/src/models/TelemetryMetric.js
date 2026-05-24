const { Schema, model } = require("mongoose");

const telemetryMetricSchema = new Schema(
  {
    name: { type: String, required: true },
    value: Schema.Types.Mixed,
    tags: Schema.Types.Mixed,
    intervalStart: Date,
    intervalEnd: Date,
    meta: Schema.Types.Mixed
  },
  { timestamps: true }
);

telemetryMetricSchema.index({ name: 1, intervalStart: -1 });

const TelemetryMetricModel = model("TelemetryMetric", telemetryMetricSchema);

module.exports = { TelemetryMetricModel };
