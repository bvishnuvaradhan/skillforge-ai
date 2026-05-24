const { Schema, model } = require("mongoose");

const dependencyGraphSchema = new Schema(
  {
    name: { type: String, default: "default" },
    version: { type: Number, default: 1 },
    status: { type: String, enum: ["active", "archived", "rolled_back"], default: "active" },
    roleScope: { type: String, enum: ["backend", "frontend", "fullstack", "global"], default: "global" },

    nodesCount: { type: Number, default: 0 },
    edgesCount: { type: Number, default: 0 },
    integrityHash: { type: String },

    snapshot: {
      nodes: [String],
      edges: [
        {
          from: String,
          to: String,
          weight: Number,
          confidence: Number,
          soft: { type: Boolean, default: true }
        }
      ]
    },

    metadata: {
      createdBy: { type: String, default: "system" },
      updatedBy: { type: String, default: "system" },
      reason: { type: String, default: "Static graph initialization" },
      topologyNotes: String,
      debugInfo: Schema.Types.Mixed
    },

    rollbackFromVersion: Number,
    rolledBackAt: Date,
    lastIntegrityCheckAt: Date
  },
  { timestamps: true }
);

dependencyGraphSchema.index({ name: 1, version: -1 });

dependencyGraphSchema.index({ status: 1, updatedAt: -1 });

module.exports = model("DependencyGraph", dependencyGraphSchema);
