const { Schema, model } = require("mongoose");

const topicDependencySchema = new Schema(
  {
    topic: { type: String, required: true },

    // Prerequisite relationships (incoming edges)
    prerequisites: [
      {
        topic: String,
        strength: { type: Number, min: 0, max: 1 },
        dependencyType: {
          type: String,
          enum: ["foundational", "reinforcing", "optional"],
          default: "foundational"
        },
        soft: { type: Boolean, default: true },
        minMasteryRequired: { type: Number, min: 0, max: 100, default: 60 },
        confidence: { type: Number, min: 0, max: 95, default: 70 },
        learnedFromData: { type: Boolean, default: false },
        estimatedAt: Date,
        samplesUsed: { type: Number, default: 0 }
      }
    ],

    // Dependent relationships (outgoing edges)
    unlocksTopics: [
      {
        topic: String,
        spilloverFactor: { type: Number, min: 0, max: 1, default: 0.3 },
        confidence: { type: Number, min: 0, max: 95, default: 70 },
        estimatedAt: Date
      }
    ],

    // Role classification
    roles: [String],
    role: { type: String, enum: ["backend", "frontend", "fullstack"], default: "fullstack" },

    // Ordering constraints
    suggestedPosition: { type: Number, min: 1, max: 100 },
    isMilestone: { type: Boolean, default: false },
    isAdvanced: { type: Boolean, default: false },

    // Metadata
    topicCategory: {
      type: String,
      enum: ["fundamentals", "intermediate", "advanced", "specialized"],
      default: "fundamentals"
    },
    difficulty: { type: Number, min: 1, max: 10, default: 5 },
    prerequisites_count: { type: Number, default: 0 },
    dependents_count: { type: Number, default: 0 },

    // Learning path context
    typicalLearningOrder: [String],
    commonSequences: [
      {
        topics: [String],
        frequency: { type: Number, min: 0, max: 1 },
        successRate: { type: Number, min: 0, max: 1 }
      }
    ],

    // CRITICAL SAFEGUARD: Track topology changes
    lastModified: Date,
    modificationReason: String,
    topologyVersion: { type: Number, default: 1 },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    lastCalibrated: Date
  },
  { timestamps: true }
);

topicDependencySchema.index({ topic: 1 });
topicDependencySchema.index({ role: 1, topic: 1 });
topicDependencySchema.index({ isMilestone: 1 });

module.exports = model("TopicDependency", topicDependencySchema);
