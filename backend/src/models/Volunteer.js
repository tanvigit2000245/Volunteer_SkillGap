import mongoose, { Schema } from "mongoose";

const skillItemSchema = new Schema(
  {
    skillName: {
      type: String,
      trim: true,
    },
    skill: {
      type: String,
      trim: true,
    },
    proficiency: {
      type: Number,
      min: [1, "Proficiency cannot be less than 1"],
      max: [5, "Proficiency cannot exceed 5"],
      default: 3,
      required: true,
    },
  },
  { _id: false }
);

// Normalize skill and skillName so both are accessible
skillItemSchema.pre("validate", function () {
  if (!this.skillName && this.skill) this.skillName = this.skill;
  if (!this.skill && this.skillName) this.skill = this.skillName;
});

const languageItemSchema = new Schema(
  {
    language: {
      type: String,
      required: [true, "Language name is required"],
      trim: true,
    },
    proficiency: {
      type: String,
      enum: ["BASIC", "CONVERSATIONAL", "FLUENT"],
      default: "BASIC",
    },
  },
  { _id: false }
);

const availabilityItemSchema = new Schema(
  {
    date: {
      type: Date,
      required: [true, "Availability date is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required (e.g., '09:00')"],
      trim: true,
    },
    endTime: {
      type: String,
      required: [true, "End time is required (e.g., '17:00')"],
      trim: true,
    },
  },
  { _id: false }
);

const volunteerSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: [true, "Auth user reference is required"],
      unique: true,
    },
    mobilityLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
      required: true,
    },
    experienceYears: {
      type: Number,
      min: [0, "Experience years cannot be negative"],
      default: 0,
    },
    phone: {
      type: String,
      trim: true,
    },
    homeAddress: {
      type: String,
      trim: true,
    },
    skills: [skillItemSchema],
    languages: [languageItemSchema],
    availability: [availabilityItemSchema],
  },
  { timestamps: true }
);

const Volunteer =
  mongoose.models.Volunteer ||
  mongoose.model("Volunteer", volunteerSchema);

export default Volunteer;
