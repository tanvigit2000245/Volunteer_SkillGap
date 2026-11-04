import test from "node:test";
import assert from "node:assert";
import {
  checkAvailability,
  evaluateHardConstraints,
  calculateMatchScore,
} from "../src/services/matching.service.js";

test("checkAvailability: returns true when volunteer slot covers requirement window", () => {
  const volunteer = {
    availability: [
      {
        date: "2026-11-01",
        startTime: "08:00",
        endTime: "16:00",
      },
    ],
  };

  const isAvailable = checkAvailability(volunteer, "2026-11-01", "09:00", "13:00");
  assert.strictEqual(isAvailable, true);
});

test("checkAvailability: returns false when date or time does not cover requirement", () => {
  const volunteer = {
    availability: [
      {
        date: "2026-11-01",
        startTime: "14:00",
        endTime: "18:00",
      },
    ],
  };

  // Volunteer starts at 14:00, but shift starts at 09:00
  const isAvailable = checkAvailability(volunteer, "2026-11-01", "09:00", "13:00");
  assert.strictEqual(isAvailable, false);
});

test("evaluateHardConstraints: passes eligible volunteer with sufficient skill & mobility", () => {
  const volunteer = {
    mobilityLevel: "High",
    skills: [{ skill: "First Aid", proficiency: 4 }],
    languages: [{ language: "English", fluency: "FLUENT" }],
    availability: [
      {
        date: "2026-11-01",
        startTime: "08:00",
        endTime: "16:00",
      },
    ],
  };

  const requirement = {
    task: "Paramedic Support",
    requiredSkill: "First Aid",
    minProficiency: 3,
    requiredLanguage: "English",
    minLanguageFluency: "CONVERSATIONAL",
    minMobilityLevel: "Medium",
    requiredCount: 1,
  };

  const result = evaluateHardConstraints(volunteer, requirement, "2026-11-01", "09:00", "13:00");
  assert.strictEqual(result.eligible, true);
  assert.strictEqual(result.failureReasons.length, 0);
  assert.strictEqual(result.skillProficiency, 4);
});

test("evaluateHardConstraints: fails volunteer when proficiency is below threshold", () => {
  const volunteer = {
    mobilityLevel: "High",
    skills: [{ skill: "First Aid", proficiency: 2 }],
    languages: [{ language: "English", fluency: "FLUENT" }],
    availability: [
      {
        date: "2026-11-01",
        startTime: "08:00",
        endTime: "16:00",
      },
    ],
  };

  const requirement = {
    task: "Paramedic Support",
    requiredSkill: "First Aid",
    minProficiency: 3,
    requiredLanguage: "English",
    minLanguageFluency: "CONVERSATIONAL",
    minMobilityLevel: "Medium",
    requiredCount: 1,
  };

  const result = evaluateHardConstraints(volunteer, requirement, "2026-11-01", "09:00", "13:00");
  assert.strictEqual(result.eligible, false);
  assert.ok(result.failureReasons.includes("BELOW_MINIMUM_PROFICIENCY"));
});

test("calculateMatchScore: computes valid score between 0 and 100", () => {
  const volunteer = {
    rating: 4.8,
    experienceYears: 3,
    mobilityLevel: "High",
  };

  const requirement = {
    minProficiency: 3,
    minLanguageFluency: "CONVERSATIONAL",
    minMobilityLevel: "Medium",
  };

  const result = calculateMatchScore(volunteer, requirement, 4, "FLUENT");
  assert.ok(typeof result.matchScore === "number");
  assert.ok(result.matchScore >= 0 && result.matchScore <= 100);
  assert.ok(result.scoreBreakdown !== undefined);
});
