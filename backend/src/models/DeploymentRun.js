import mongoose, { Schema } from "mongoose";

const deploymentRunSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      default: function () {
        return `Deployment Plan - ${new Date().toISOString().split("T")[0]}`;
      },
    },
    targetDate: {
      type: Date,
      required: [true, "Target operational date is required"],
      index: true,
    },
    locations: [
      {
        type: Schema.Types.ObjectId,
        ref: "Location",
        required: true,
      },
    ],
    status: {
      type: String,
      enum: ["PROPOSED", "CONFIRMED", "CANCELLED"],
      default: "PROPOSED",
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    confirmedBy: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      default: null,
    },
    confirmedAt: {
      type: Date,
      default: null,
    },
    summary: {
      totalRequiredHeadcount: { type: Number, default: 0 },
      totalAssignedHeadcount: { type: Number, default: 0 },
      totalGaps: { type: Number, default: 0 },
      totalOverrides: { type: Number, default: 0 },
      solver: { type: String, default: "LOCAL_GREEDY_HEURISTIC" },
      computationTimeMs: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

const DeploymentRun =
  mongoose.models.DeploymentRun ||
  mongoose.model("DeploymentRun", deploymentRunSchema);

export default DeploymentRun;
