const { Schema, model } = require("mongoose");

const dependencyEdgeSchema = new Schema(
  {
    graphVersion: { type: Number, required: true },
    fromTopic: { type: String, required: true },
    toTopic: { type: String, required: true },

    weight: { type: Number, min: 0, max: 1, default: 0.5 },
    confidence: { type: Number, min: 0, max: 1, default: 0.7 },
    soft: { type: Boolean, default: true },

    dependencyType: {
      type: String,
      enum: ["foundational", "reinforcing", "optional"],
      default: "foundational"
    },
    roleRelevance: {
      type: String,
      enum: ["backend", "frontend", "fullstack", "cross-domain"],
      default: "fullstack"
    },

    modificationHistory: [
      {
        modifiedAt: { type: Date, default: Date.now },
        modifiedBy: { type: String, default: "system" },
        reason: String,
        previousWeight: Number,
        previousConfidence: Number
      }
    ],

    audit: {
      createdBy: { type: String, default: "system" },
      createdReason: String,
      lastModifiedBy: { type: String, default: "system" }
    }
  },
  { timestamps: true }
);

dependencyEdgeSchema.index({ graphVersion: 1, fromTopic: 1, toTopic: 1 }, { unique: true });
dependencyEdgeSchema.index({ toTopic: 1, soft: 1 });

module.exports = model("DependencyEdge", dependencyEdgeSchema);
