import mongoose, { Schema } from "mongoose";

const requirementSchema = new Schema(
  {
    task: {
      type: String,
      required: [true, "Task description or role title is required"],
      trim: true,
    },
    requiredSkill: {
      type: String,
      required: [true, "Required skill name is required"],
      trim: true,
    },
    minProficiency: {
      type: Number,
      min: [1, "Proficiency cannot be less than 1"],
      max: [5, "Proficiency cannot be greater than 5"],
      default: 1,
    },
    requiredLanguage: {
      type: String,
      trim: true,
      default: null,
    },
    minLanguageFluency: {
      type: String,
      enum: ["BASIC", "CONVERSATIONAL", "FLUENT"],
      default: "BASIC",
    },
    isLanguageMandatory: {
      type: Boolean,
      default: false,
    },
    minMobilityLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low",
    },
    requiredCount: {
      type: Number,
      min: [1, "Required headcount must be at least 1"],
      required: [true, "Staffing headcount requirement is mandatory"],
    },
    isSafetyCritical: {
      type: Boolean,
      default: false, // If true, this requirement cannot be bypassed via manual override
    },
  },
  { _id: true }
);

const locationSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Location name is required"],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Deployment date is required"],
      index: true,
    },
    shiftStart: {
      type: String,
      required: [true, "Shift start time is required (e.g., '09:00')"],
      trim: true,
    },
    shiftEnd: {
      type: String,
      required: [true, "Shift end time is required (e.g., '17:00')"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["UPCOMING", "ACTIVE", "COMPLETED", "CANCELLED"],
      default: "UPCOMING",
    },
    requirements: [requirementSchema],
  },
  { timestamps: true }
);

// Helpful index for scheduling and availability queries
locationSchema.index({ date: 1, status: 1 });

const Location = mongoose.models.Location || mongoose.model("Location", locationSchema);

export default Location;