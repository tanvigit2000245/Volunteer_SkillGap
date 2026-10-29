import mongoose, { Schema } from "mongoose";

const skillGapSchema = new Schema(
  {
    run: {
      type: Schema.Types.ObjectId,
      ref: "DeploymentRun",
      required: [true, "Deployment run reference is required"],
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
      required: [true, "Location requirement reference is required"],
    },
    task: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },
    requiredSkill: {
      type: String,
      trim: true,
      default: null,
    },
    requiredLanguage: {
      type: String,
      trim: true,
      default: null,
    },
    required: {
      type: Number,
      required: [true, "Required headcount is mandatory"],
      min: 1,
    },
    assigned: {
      type: Number,
      default: 0,
      min: 0,
    },
    shortage: {
      type: Number,
      required: [true, "Shortage count is mandatory"],
      min: 1,
    },
    explanation: {
      // Reason codes: e.g. ['BELOW_MIN_PROFICIENCY', 'SHIFT_UNAVAILABLE', 'NO_MANDATORY_LANGUAGE_SPEAKER']
      reasonCodes: [
        {
          type: String,
          trim: true,
        },
      ],
      // Human-readable summary explaining why the gap could not be filled
      description: {
        type: String,
        trim: true,
      },
      // Quantitative bottleneck metrics (e.g. { evaluated: 10, failedProficiency: 4, failedShift: 6 })
      metrics: {
        type: Schema.Types.Mixed,
        default: {},
      },
    },
  },
  { timestamps: true }
);

// Helpful index to query gaps by deployment run and location
skillGapSchema.index({ run: 1, location: 1 });

const SkillGap =
  mongoose.models.SkillGap || mongoose.model("SkillGap", skillGapSchema);

export default SkillGap;