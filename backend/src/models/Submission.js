const { Schema, model } = require("mongoose");

const submissionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    platform: { type: String, enum: ["leetcode", "codechef", "github"], required: true },
    externalId: { type: String, required: true }, // Platform-specific submission ID
    problemName: { type: String, required: true },
    problemUrl: { type: String },
    difficulty: { type: String }, // Raw difficulty from platform (e.g., "Easy", "1400")
    udi: { type: Number, required: true }, // Unified Difficulty Index (1-10)
    topics: [{ type: String }],
    status: { type: String, enum: ["accepted", "failed", "pending"], default: "accepted" },
    solvedAt: { type: Date, required: true },
    solveTime: { type: Number }, // in minutes (if available)
    retries: { type: Number, default: 0 },
    language: { type: String },
  },
  { timestamps: true }
);

// Prevent duplicate submissions
submissionSchema.index({ user: 1, platform: 1, externalId: 1 }, { unique: true });
submissionSchema.index({ user: 1, solvedAt: -1 });

const SubmissionModel = model("Submission", submissionSchema);

module.exports = { SubmissionModel };
