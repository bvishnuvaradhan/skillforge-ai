const { Schema, model } = require("mongoose");

const arbitrationTraceSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    runId: { type: String, required: true },
    startedAt: { type: Date, required: true },
    completedAt: { type: Date, required: true },
    latencyMs: { type: Number, required: true },
    stageDurations: {
      normalizeMs: { type: Number, default: 0 },
      scoreMs: { type: Number, default: 0 },
      conflictMs: { type: Number, default: 0 },
      governMs: { type: Number, default: 0 },
      lifecycleMs: { type: Number, default: 0 },
      focusMs: { type: Number, default: 0 }
    },
    counts: {
      inputCandidates: { type: Number, default: 0 },
      normalizedCandidates: { type: Number, default: 0 },
      normalizationFailures: { type: Number, default: 0 },
      winners: { type: Number, default: 0 },
      deferred: { type: Number, default: 0 },
      conflicts: { type: Number, default: 0 }
    },
    metrics: {
      suppressionRate: { type: Number, default: 0 },
      cooldownBlocks: { type: Number, default: 0 },
      governanceConflicts: { type: Number, default: 0 },
      lifecycleTransitions: { type: Number, default: 0 },
      churnRate: { type: Number, default: 0 },
      retainedRecommendations: { type: Number, default: 0 },
      addedRecommendations: { type: Number, default: 0 },
      removedRecommendations: { type: Number, default: 0 },
      winnerDistributionByType: {
        type: Map,
        of: Number,
        default: {}
      },
      winnerDistributionByEngine: {
        type: Map,
        of: Number,
        default: {}
      }
    },
    status: {
      type: String,
      enum: ["completed", "replayed"],
      default: "completed"
    },
    idempotency: {
      key: String,
      requestHash: String,
      replayedFromRunId: String
    },
    eventMetadata: {
      source: { type: String, default: "api" },
      trigger: { type: String, default: "manual" },
      replaySafe: { type: Boolean, default: true },
      sequence: Number
    },
    ordering: {
      candidateIds: [Schema.Types.Mixed],
      candidateOrderHash: String
    },
    output: {
      winnerIds: [Schema.Types.Mixed],
      deferredIds: [Schema.Types.Mixed],
      failureCount: { type: Number, default: 0 }
    },
    normalizationFailures: [
      {
        recommendationId: Schema.Types.Mixed,
        topic: String,
        error: String
      }
    ],
    suppressedRecommendations: [
      {
        recommendationId: Schema.Types.Mixed,
        topic: String,
        type: String,
        deferredReason: String,
        finalPriorityScore: Number
      }
    ],
    signalAncestry: [
      {
        recommendationId: Schema.Types.Mixed,
        topic: String,
        type: String,
        sourceAlgorithm: String,
        sourceEngine: String
      }
    ],
    decisionLineage: [
      {
        recommendationId: Schema.Types.Mixed,
        topic: String,
        winnerReason: String,
        winningSignal: String,
        finalPriorityScore: Number
      }
    ]
  },
  { timestamps: true }
);

arbitrationTraceSchema.index({ user: 1, createdAt: -1 });
arbitrationTraceSchema.index({ user: 1, runId: 1 }, { unique: true });
arbitrationTraceSchema.index(
  { user: 1, "idempotency.key": 1 },
  {
    unique: true,
    partialFilterExpression: { "idempotency.key": { $exists: true, $type: "string" } }
  }
);

const ArbitrationTraceModel = model("ArbitrationTrace", arbitrationTraceSchema);

module.exports = { ArbitrationTraceModel };
