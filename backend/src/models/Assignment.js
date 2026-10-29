import mongoose, { Schema } from "mongoose";

const assignmentSchema = new Schema(
  {
    run: {
      type: Schema.Types.ObjectId,
      ref: "DeploymentRun",
      required: [true, "Deployment run reference is required"],
      index: true,
    },
    volunteer: {
      type: Schema.Types.ObjectId,
      ref: "Volunteer",
      required: [true, "Volunteer reference is required"],
      index: true,
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: "Location",
      required: [true, "Location reference is required"],
      index: true,
    },
    requirementId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    task: {
      type: String,
      required: [true, "Task role title is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["PROPOSED", "CONFIRMED", "REJECTED"],
      default: "PROPOSED",
      index: true,
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    scoreBreakdown: {
      skillScore: { type: Number, default: 0 },
      experienceScore: { type: Number, default: 0 },
      languageScore: { type: Number, default: 0 },
      mobilityScore: { type: Number, default: 0 },
    },
    // Manual override audit fields (coordinator review)
    isManualOverride: {
      type: Boolean,
      default: false,
      index: true,
    },
    overriddenBy: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      default: null, // Records WHO performed the override
    },
    overrideReason: {
      type: String,
      trim: true,
      default: null, // Records WHY the override was applied
    },
    overriddenConstraint: {
      type: String,
      trim: true,
      default: null, // Records WHICH constraint was bypassed (e.g., 'MIN_PROFICIENCY', 'AVAILABILITY')
    },
    overriddenAt: {
      type: Date,
      default: null,
    },
    warnings: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

// Prevent assigning the same volunteer twice within the same deployment run
assignmentSchema.index({ run: 1, volunteer: 1 }, { unique: true });

const Assignment =
  mongoose.models.Assignment ||
  mongoose.model("Assignment", assignmentSchema);

export default Assignment;