import axios from "axios";
import Volunteer from "../models/Volunteer.js";
import Auth from "../models/Auth.js";
import Location from "../models/Location.js";
import Assignment from "../models/Assignment.js";
import { releaseExpiredAssignments, isDeploymentOver } from "./location.service.js";

// Helper for mobility numerical ranking
const MOBILITY_MAP = {
  Low: 1,
  Medium: 2,
  High: 3,
};

// Helper for language fluency numerical ranking
const FLUENCY_MAP = {
  BASIC: 1,
  CONVERSATIONAL: 2,
  FLUENT: 3,
};

/**
 * Normalized token generator for skills (removes punctuation, lowercases)
 */
export const normalizeSkillToken = (s) =>
  (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

/**
 * Common skill aliases and domain synonyms for disaster/volunteer response
 */
const SKILL_DOMAIN_ALIASES = {
  firstaid: ["medical", "cpr", "emergencyresponse", "patientcare", "patientmonitoring", "firstaid", "nursing", "paramedic"],
  medical: ["firstaid", "cpr", "emergencyresponse", "patientcare", "patientmonitoring", "medicaladvanced", "nursing", "doctor"],
  medicaladvanced: ["medical", "firstaid", "emergencyresponse", "patientcare", "patientmonitoring", "nursing", "doctor"],
  emergencyresponse: ["firstaid", "cpr", "medical", "patientmonitoring", "emergencysupport", "disasterhelp"],
  patientcare: ["medical", "firstaid", "nursing", "patientmonitoring"],
  patientmonitoring: ["medical", "firstaid", "patientcare", "nursing", "emergencyresponse"],
  construction: ["carpentry", "masonry", "building", "equipmenthandling", "heavyequipment", "demolition", "repairs"],
  equipmenthandling: ["construction", "heavyequipment", "logistics", "toolsoperation"],
  teaching: ["education", "training", "tutoring", "instruction", "mentoring"],
  logistics: ["supplychain", "warehousing", "inventory", "transportation", "distribution"],
  communication: ["translation", "publicrelations", "english", "hindi", "dispatch"],
  safety: ["safetymanagement", "construction", "security", "hazardcontrol"],
};

/**
 * Flexible skill matcher: checks exact normalized string, token overlap, and domain synonyms
 */
export const skillsMatch = (volSkillName, reqSkillName) => {
  if (!volSkillName || !reqSkillName) return false;
  const vNorm = normalizeSkillToken(volSkillName);
  const rNorm = normalizeSkillToken(reqSkillName);

  if (vNorm === rNorm) return true;

  // Substring check if length >= 4
  if (vNorm.length >= 4 && rNorm.length >= 4) {
    if (vNorm.includes(rNorm) || rNorm.includes(vNorm)) return true;
  }

  // Token-level check
  const vWords = (volSkillName || "").toLowerCase().split(/[\s,/-]+/).filter((w) => w.length > 2);
  const rWords = (reqSkillName || "").toLowerCase().split(/[\s,/-]+/).filter((w) => w.length > 2);

  const tokenOverlap = vWords.some((vw) => rWords.some((rw) => vw.includes(rw) || rw.includes(vw)));
  if (tokenOverlap) return true;

  // Domain synonym check
  for (const [key, aliasList] of Object.entries(SKILL_DOMAIN_ALIASES)) {
    const vMatches = vNorm.includes(key) || aliasList.some((a) => vNorm.includes(a));
    const rMatches = rNorm.includes(key) || aliasList.some((a) => rNorm.includes(a));
    if (vMatches && rMatches) {
      return true;
    }
  }

  return false;
};

export const GENERIC_REGION_WORDS = new Set([
  "punjab", "delhi", "maharashtra", "karnataka", "tamil", "nadu", "gujarat",
  "rajasthan", "uttar", "pradesh", "haryana", "kerala", "bengal", "india",
  "state", "district", "city", "region", "zone", "north", "south", "east", "west", "central", "usa", "uk"
]);

/**
 * Checks if a volunteer's location/city matches the deployment site location
 */
export const isLocationMatch = (volAddress, locAddress) => {
  if (!locAddress || !locAddress.trim()) return true;
  if (!volAddress || !volAddress.trim()) return false;

  const vClean = volAddress.toLowerCase().trim();
  const lClean = locAddress.toLowerCase().trim();

  // Exact match or direct substring
  if (vClean === lClean || vClean.includes(lClean) || lClean.includes(vClean)) {
    return true;
  }

  // Compare primary city / first comma-separated component
  const vParts = vClean.split(",").map((s) => s.trim()).filter(Boolean);
  const lParts = lClean.split(",").map((s) => s.trim()).filter(Boolean);
  if (vParts[0] && lParts[0]) {
    if (vParts[0] === lParts[0] || vParts[0].includes(lParts[0]) || lParts[0].includes(vParts[0])) {
      return true;
    }
  }

  // Tokenize and filter out generic state/region words
  const vTokens = vClean.split(/[\s,.-]+/).filter((t) => t.length > 2 && !GENERIC_REGION_WORDS.has(t));
  const lTokens = lClean.split(/[\s,.-]+/).filter((t) => t.length > 2 && !GENERIC_REGION_WORDS.has(t));

  if (vTokens.length > 0 && lTokens.length > 0) {
    return vTokens.some((vt) => lTokens.some((lt) => vt === lt || vt.includes(lt) || lt.includes(vt)));
  }

  return false;
};

/**
 * Convert "HH:MM" string to minutes from midnight
 */
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

/**
 * Check if a volunteer is available during a specific date and shift window.
 * Returns { isAvailable: boolean, matchLevel: 'FULL' | 'PARTIAL' | 'FLEXIBLE' | 'DATE_MISMATCH' | 'NONE', details: string }
 */
export const checkAvailabilityDetailed = (volunteer, targetDate, shiftStart, shiftEnd) => {
  if (!volunteer.availability || volunteer.availability.length === 0) {
    // No calendar blackout restrictions configured: volunteer has flexible availability
    return {
      isAvailable: true,
      matchLevel: "FLEXIBLE",
      score: 60,
      details: "Open/flexible availability (no calendar restrictions specified)",
    };
  }

  const shiftStartMin = timeToMinutes(shiftStart || "09:00");
  const shiftEndMin = timeToMinutes(shiftEnd || "17:00");
  const targetDateStr = targetDate ? new Date(targetDate).toISOString().split("T")[0] : null;

  let hasDateMatch = false;
  let fullShiftMatch = false;
  let partialShiftMatch = false;

  for (const slot of volunteer.availability) {
    if (!slot.date) continue;
    const slotDateStr = new Date(slot.date).toISOString().split("T")[0];

    if (slotDateStr === targetDateStr) {
      hasDateMatch = true;
      const slotStartMin = timeToMinutes(slot.startTime);
      const slotEndMin = timeToMinutes(slot.endTime);

      if (slotStartMin <= shiftStartMin && slotEndMin >= shiftEndMin) {
        fullShiftMatch = true;
        break;
      }

      // Check for at least 50% shift overlap
      const overlapStart = Math.max(slotStartMin, shiftStartMin);
      const overlapEnd = Math.min(slotEndMin, shiftEndMin);
      const overlap = Math.max(0, overlapEnd - overlapStart);
      const shiftDuration = Math.max(1, shiftEndMin - shiftStartMin);

      if (overlap / shiftDuration >= 0.5) {
        partialShiftMatch = true;
      }
    }
  }

  if (fullShiftMatch) {
    return {
      isAvailable: true,
      matchLevel: "FULL",
      score: 100,
      details: "Fully available for the requested date and shift window",
    };
  }

  if (partialShiftMatch) {
    return {
      isAvailable: true,
      matchLevel: "PARTIAL",
      score: 75,
      details: "Partial shift overlap (available for 50%+ of required hours)",
    };
  }

  if (hasDateMatch) {
    return {
      isAvailable: false,
      matchLevel: "TIME_CONFLICT",
      score: 25,
      details: "Registered for this date, but shift hours do not match the required time",
    };
  }

  // Date registered is different
  return {
    isAvailable: false,
    matchLevel: "DATE_MISMATCH",
    score: 40,
    details: "Available on different dates; flexible rescheduling may be possible",
  };
};

/**
 * Standard availability check boolean for backwards compatibility
 */
export const checkAvailability = (volunteer, targetDate, shiftStart, shiftEnd) => {
  const result = checkAvailabilityDetailed(volunteer, targetDate, shiftStart, shiftEnd);
  return result.isAvailable;
};

/**
 * Evaluates hard constraints for a volunteer against a task requirement
 */
export const evaluateHardConstraints = (
  volunteer,
  requirement,
  locationDate,
  shiftStart,
  shiftEnd,
  locationCity
) => {
  const failureReasons = [];

  // 1. Skill & Minimum Proficiency check using flexible matcher
  const volunteerSkill = (volunteer.skills || []).find((s) =>
    skillsMatch(s.skillName || s.skill || "", requirement.requiredSkill)
  );

  let skillProficiency = 0;
  if (!volunteerSkill) {
    failureReasons.push("NO_VOLUNTEERS_WITH_SKILL");
  } else {
    skillProficiency = volunteerSkill.proficiency || 1;
    const minProf = requirement.minProficiency || 1;
    if (skillProficiency < minProf) {
      failureReasons.push("BELOW_MINIMUM_PROFICIENCY");
    }
  }

  // 2. Mandatory Language & Fluency check
  let languageFluency = null;
  if (requirement.requiredLanguage) {
    const reqLangLower = requirement.requiredLanguage.toLowerCase().trim();
    const volunteerLang = (volunteer.languages || []).find(
      (l) => (l.language || "").toLowerCase().trim() === reqLangLower
    );

    if (volunteerLang) {
      languageFluency = volunteerLang.proficiency || "BASIC";
    }

    if (requirement.isLanguageMandatory) {
      if (!volunteerLang) {
        failureReasons.push("MISSING_MANDATORY_LANGUAGE");
      } else {
        const requiredFluencyScore = FLUENCY_MAP[requirement.minLanguageFluency || "BASIC"] || 1;
        const volunteerFluencyScore = FLUENCY_MAP[languageFluency] || 1;
        if (volunteerFluencyScore < requiredFluencyScore) {
          failureReasons.push("BELOW_MIN_LANGUAGE_FLUENCY");
        }
      }
    }
  }

  // 3. Mobility Requirement check
  const volMobilityScore = MOBILITY_MAP[volunteer.mobilityLevel || "Medium"] || 2;
  const reqMobilityScore = MOBILITY_MAP[requirement.minMobilityLevel || "Low"] || 1;
  if (volMobilityScore < reqMobilityScore) {
    failureReasons.push("MOBILITY_LEVEL_INSUFFICIENT");
  }

  // 4. Availability analysis: date and shift timing must match
  const availResult = checkAvailabilityDetailed(volunteer, locationDate, shiftStart, shiftEnd);
  if (!availResult.isAvailable) {
    failureReasons.push("AVAILABILITY_SHIFT_CONFLICT");
  }

  // 5. Location matching check: volunteer location must match site location
  if (locationCity && locationCity.trim()) {
    const volCity = (volunteer.homeAddress || volunteer.city || "").toLowerCase().trim();
    if (!isLocationMatch(volCity, locationCity)) {
      failureReasons.push("LOCATION_MISMATCH");
    }
  }

  return {
    eligible: failureReasons.length === 0,
    failureReasons,
    skillProficiency,
    languageFluency,
    availResult,
  };
};

/**
 * Weighted multi-factor ranking algorithm:
 * - Skills & Proficiency: 40%
 * - Location & Travel Proximity: 25%
 * - Availability & Shift Timing: 25%
 * - Relevant Experience: 10%
 * Returns total score (0 - 100) and detailed sub-scores.
 */
export const calculateWeightedMatchScore = (volunteer, location, requirement, skillProficiency, availResult) => {
  // ── 1. Skills & Proficiency Score (0 - 100, weight 40%) ──────────────
  const minProf = requirement.minProficiency || 1;
  let skillsScore = 50; // Base score for having the matching skill

  if (skillProficiency >= minProf) {
    const profDelta = skillProficiency - minProf;
    skillsScore = Math.min(90, 70 + profDelta * 10);
    // Advanced proficiency (level 4-5) certification bonus
    if (skillProficiency >= 4) {
      skillsScore = Math.min(100, skillsScore + 10);
    }
  } else if (skillProficiency > 0) {
    // Below minimum proficiency: partial credit
    skillsScore = Math.max(20, Math.round((skillProficiency / minProf) * 45));
  } else {
    skillsScore = 0;
  }

  // ── 2. Location & Travel Distance Score (0 - 100, weight 25%) ────────
  let locationScore = 50;
  const volCity = (volunteer.homeAddress || volunteer.city || "").toLowerCase().trim();
  const locCity = (location.city || location.address || "").toLowerCase().trim();

  if (volCity && locCity && (volCity.includes(locCity) || locCity.includes(volCity))) {
    // Same city/locality: minimal travel required
    locationScore = 100;
  } else if (volCity && locCity) {
    // Different city: adjust by volunteer's mobility level
    const mobility = volunteer.mobilityLevel || "Medium";
    if (mobility === "High") locationScore = 70; // Willing and able to travel
    else if (mobility === "Medium") locationScore = 45;
    else locationScore = 25; // Low mobility: difficult travel
  } else {
    // Default location score based on mobility
    const mobility = volunteer.mobilityLevel || "Medium";
    locationScore = mobility === "High" ? 65 : mobility === "Medium" ? 50 : 35;
  }

  // ── 3. Availability & Shift Timing Score (0 - 100, weight 25%) ───────
  const availabilityScore = availResult?.score ?? 50;

  // ── 4. Experience Score (0 - 100, weight 10%) ────────────────────────
  const expYears = volunteer.experienceYears || 0;
  let experienceScore = 30; // Base entry-level
  if (expYears >= 5) experienceScore = 100;
  else if (expYears >= 3) experienceScore = 90;
  else if (expYears >= 2) experienceScore = 75;
  else if (expYears >= 1) experienceScore = 55;
  else experienceScore = 30;

  // ── Weighted Composite Score ──────────────────────────────────────────
  const weightedTotal = Math.round(
    skillsScore * 0.40 +
    locationScore * 0.25 +
    availabilityScore * 0.25 +
    experienceScore * 0.10
  );

  return {
    matchScore: Math.min(100, Math.max(0, weightedTotal)),
    scoreBreakdown: {
      skillsScore: Math.round(skillsScore),
      locationScore: Math.round(locationScore),
      availabilityScore: Math.round(availabilityScore),
      experienceScore: Math.round(experienceScore),
      weights: {
        skills: "40%",
        location: "25%",
        availability: "25%",
        experience: "10%",
      },
    },
  };
};

/**
 * Backwards compatibility helper for existing callers
 */
export const calculateMatchScore = (volunteer, requirement, skillProficiency, languageFluency) => {
  const dummyLoc = { city: "", address: "" };
  const dummyAvail = { score: 75 };
  const res = calculateWeightedMatchScore(volunteer, dummyLoc, requirement, skillProficiency, dummyAvail);
  return {
    matchScore: res.matchScore,
    scoreBreakdown: {
      skillScore: res.scoreBreakdown.skillsScore,
      experienceScore: res.scoreBreakdown.experienceScore,
      languageScore: res.scoreBreakdown.locationScore,
      mobilityScore: res.scoreBreakdown.availabilityScore,
    },
  };
};

/**
 * Generate human-readable explanation for unresolved skill gaps
 */
const buildGapExplanation = (shortage, metrics, requirement) => {
  const reasonCodes = [];
  const parts = [];

  if (metrics.belowProficiencyCount > 0) {
    reasonCodes.push("BELOW_MINIMUM_PROFICIENCY");
    parts.push(
      `${metrics.belowProficiencyCount} volunteer(s) have '${requirement.requiredSkill}' but fail the minimum proficiency threshold (required: level ${requirement.minProficiency})`
    );
  }

  if (metrics.shiftUnavailableCount > 0) {
    reasonCodes.push("AVAILABILITY_SHIFT_CONFLICT");
    parts.push(`${metrics.shiftUnavailableCount} qualified volunteer(s) are unavailable during this date/shift`);
  }

  if (metrics.missingLanguageCount > 0 && requirement.isLanguageMandatory) {
    reasonCodes.push("MISSING_MANDATORY_LANGUAGE");
    parts.push(
      `${metrics.missingLanguageCount} volunteer(s) meet the skill but lack mandatory '${requirement.requiredLanguage}' fluency`
    );
  }

  if (metrics.mobilityDeficitCount > 0) {
    reasonCodes.push("MOBILITY_LEVEL_INSUFFICIENT");
    parts.push(`${metrics.mobilityDeficitCount} volunteer(s) fail the required mobility level ('${requirement.minMobilityLevel}')`);
  }

  if (metrics.alreadyAssignedCount > 0) {
    reasonCodes.push("ALREADY_ASSIGNED_TO_OTHER_TASK");
    parts.push(`${metrics.alreadyAssignedCount} qualified volunteer(s) are already allocated to concurrent assignments`);
  }

  if (metrics.noSkillCount === metrics.totalVolunteers) {
    reasonCodes.push("NO_VOLUNTEERS_WITH_SKILL");
    parts.push(`No registered volunteers hold the skill '${requirement.requiredSkill}'`);
  } else if (parts.length === 0) {
    reasonCodes.push("INSUFFICIENT_VOLUNTEERS");
    parts.push(`Insufficient total eligible volunteer pool to fulfill headcount of ${requirement.requiredCount}`);
  }

  const description = `Shortage: ${shortage} volunteer(s). ${parts.join("; ")}.`;

  return { reasonCodes, description, metrics };
};

/**
 * Local Constraint Matching & Multi-Site Allocation Engine (Greedy heuristic with travel minimization)
 */
export const runLocalConstraintMatching = (locations, allVolunteers) => {
  const proposedAssignments = [];
  const detectedSkillGaps = [];

  // Track assigned volunteers globally across sites by date to prevent double-booking
  const assignedVolunteersByDate = new Map(); // dateStr -> Set of volunteerIds

  for (const location of locations) {
    const locDateStr = location.date ? new Date(location.date).toISOString().split("T")[0] : "all_dates";
    if (!assignedVolunteersByDate.has(locDateStr)) {
      assignedVolunteersByDate.set(locDateStr, new Set());
    }
    const assignedToday = assignedVolunteersByDate.get(locDateStr);

    for (const req of location.requirements || []) {
      const candidates = [];
      const metrics = {
        totalVolunteers: allVolunteers.length,
        noSkillCount: 0,
        belowProficiencyCount: 0,
        missingLanguageCount: 0,
        mobilityDeficitCount: 0,
        shiftUnavailableCount: 0,
        alreadyAssignedCount: 0,
      };

      for (const vol of allVolunteers) {
        const volId = vol._id.toString();
        const evalResult = evaluateHardConstraints(
          vol,
          req,
          location.date,
          location.shiftStart,
          location.shiftEnd,
          location.city || location.address
        );

        if (evalResult.failureReasons.includes("NO_VOLUNTEERS_WITH_SKILL")) {
          metrics.noSkillCount++;
        }
        if (evalResult.failureReasons.includes("BELOW_MINIMUM_PROFICIENCY")) {
          metrics.belowProficiencyCount++;
        }
        if (
          evalResult.failureReasons.includes("MISSING_MANDATORY_LANGUAGE") ||
          evalResult.failureReasons.includes("BELOW_MIN_LANGUAGE_FLUENCY")
        ) {
          metrics.missingLanguageCount++;
        }
        if (evalResult.failureReasons.includes("MOBILITY_LEVEL_INSUFFICIENT")) {
          metrics.mobilityDeficitCount++;
        }
        if (evalResult.failureReasons.includes("AVAILABILITY_SHIFT_CONFLICT")) {
          metrics.shiftUnavailableCount++;
        }

        // Only candidates who satisfy all hard constraints are eligible for allocation
        if (evalResult.eligible) {
          if (assignedToday.has(volId)) {
            metrics.alreadyAssignedCount++;
          } else {
            const scoring = calculateWeightedMatchScore(
              vol,
              location,
              req,
              evalResult.skillProficiency,
              evalResult.availResult
            );

            // Candidate is eligible: score is computed
            candidates.push({
              volunteer: vol,
              matchScore: scoring.matchScore,
              scoreBreakdown: scoring.scoreBreakdown,
              evalResult,
            });
          }
        }
      }

      // If there are more candidates than required, select top candidates with the best matching percentage
      candidates.sort((a, b) => b.matchScore - a.matchScore);

      const assignedCount = Math.min(candidates.length, req.requiredCount);

      // Allocate top candidates with the best match score
      for (let i = 0; i < assignedCount; i++) {
        const candidate = candidates[i];
        assignedToday.add(candidate.volunteer._id.toString());

        const volName = candidate.volunteer.user?.fullName || "Volunteer";
        const locName = location.name || "Service Location";
        const isLocal = candidate.scoreBreakdown.locationScore >= 80;
        const rankNote = candidates.length > req.requiredCount
          ? `Selected as top match (${i + 1} of ${req.requiredCount} allocated from pool of ${candidates.length} candidates with ${candidate.matchScore}% matching score).`
          : `Match score: ${candidate.matchScore}%.`;

        proposedAssignments.push({
          locationId: location._id,
          requirementId: req._id,
          volunteerId: candidate.volunteer._id,
          task: req.task,
          matchScore: candidate.matchScore,
          scoreBreakdown: candidate.scoreBreakdown,
          volunteerDetails: {
            fullName: candidate.volunteer.user?.fullName,
            email: candidate.volunteer.user?.email,
            phone: candidate.volunteer.phone,
          },
          assignmentExplanation: `${volName} was assigned to ${locName} for ${req.task}. ${rankNote} ${
            isLocal ? "They are local to the site, minimizing travel time." : "Their mobility profile permits deployment to this area."
          } Skills: ${candidate.scoreBreakdown.skillsScore}%, Proximity: ${candidate.scoreBreakdown.locationScore}%, Availability: ${candidate.scoreBreakdown.availabilityScore}%.`,
        });
      }

      // If headcount is not fully satisfied, detect skill gap with explanation
      if (assignedCount < req.requiredCount) {
        const shortage = req.requiredCount - assignedCount;
        const explanation = buildGapExplanation(shortage, metrics, req);

        detectedSkillGaps.push({
          locationId: location._id,
          requirementId: req._id,
          task: req.task,
          requiredSkill: req.requiredSkill,
          requiredLanguage: req.requiredLanguage,
          required: req.requiredCount,
          assigned: assignedCount,
          shortage,
          explanation,
        });
      }
    }
  }

  return {
    proposedAssignments,
    detectedSkillGaps,
    stats: {
      totalVolunteersPool: allVolunteers.length,
      totalAssigned: proposedAssignments.length,
      totalGaps: detectedSkillGaps.length,
      engineUsed: "LOCAL_GREEDY_HEURISTIC",
    },
  };
};

/**
 * Runs matching and gap detection across service locations and a volunteer pool.
 * Seamless fallback between external Python HiGHS MILP and local engine.
 */
export const runConstraintMatching = async (locations) => {
  const allVolunteers = await Volunteer.find().populate("user", "fullName email role");

  const engineUrl = process.env.ENGINE_URL;
  if (engineUrl) {
    try {
      const payload = {
        locations: locations.map((loc) => ({
          id: loc._id.toString(),
          name: loc.name,
          address: loc.address || "",
          city: loc.city || "",
          date: new Date(loc.date).toISOString().split("T")[0],
          shiftStart: loc.shiftStart,
          shiftEnd: loc.shiftEnd,
          requirements: (loc.requirements || []).map((req) => ({
            id: req._id.toString(),
            task: req.task,
            requiredSkill: req.requiredSkill,
            minProficiency: req.minProficiency || 1,
            requiredLanguage: req.requiredLanguage || null,
            minLanguageFluency: req.minLanguageFluency || "CONVERSATIONAL",
            mobilityLevel: req.mobilityLevel || "Low",
            requiredCount: req.requiredCount || 1,
            isSafetyCritical: Boolean(req.isSafetyCritical),
          })),
        })),
        volunteers: allVolunteers.map((vol) => ({
          id: vol._id.toString(),
          fullName: vol.user?.fullName || "Volunteer",
          email: vol.user?.email || "",
          phone: vol.phone || "",
          skills: (vol.skills || []).map((s) => ({
            skill: s.skill || s.skillName || "",
            proficiency: s.proficiency || 1,
          })),
          languages: (vol.languages || []).map((l) => ({
            language: l.language,
            fluency: l.proficiency || l.fluency || "CONVERSATIONAL",
          })),
          mobilityLevel: vol.mobilityLevel || "Medium",
          experienceYears: vol.experienceYears || 0,
          availability: (vol.availability || []).map((a) => ({
            date: new Date(a.date).toISOString().split("T")[0],
            startTime: a.startTime,
            endTime: a.endTime,
          })),
          rating: vol.rating || 5.0,
        })),
      };

      const response = await axios.post(
        `${engineUrl.replace(/\/$/, "")}/api/optimize`,
        payload,
        { timeout: 4000 }
      );

      if (response.data && response.data.proposedAssignments) {
        console.log(
          `[MatchingEngine] Global MILP Solver (${response.data.solver}) successfully solved deployment plan. Assigned: ${response.data.stats?.totalAssigned}/${response.data.stats?.totalRequiredSlots} in ${response.data.stats?.computationTimeMs}ms`
        );
        return {
          proposedAssignments: response.data.proposedAssignments,
          detectedSkillGaps: response.data.detectedSkillGaps,
          stats: {
            ...response.data.stats,
            engineUsed: response.data.solver,
          },
        };
      }
    } catch (err) {
      console.warn(
        `[MatchingEngine] Python Optimization Service at ${engineUrl} not reachable (${err.message}). Seamlessly falling back to local heuristic matching engine.`
      );
    }
  }

  return runLocalConstraintMatching(locations, allVolunteers);
};

/**
 * Get skill-matched candidates for a specific location.
 * Separates candidates into:
 * - Eligible: Satisfies all mandatory skill requirements for this site
 * - Potentially Suitable: Partial skill match or missing 1 requirement
 * - Ineligible: Holds zero matching skills or severe conflict, with clear reason
 *
 * Implements weighted ranking (Skills 40%, Location 25%, Availability 25%, Experience 10%),
 * double-booking prevention, multi-site conflict detection, and recommendation reasons.
 */
export const getCandidatesForLocation = async (locationId) => {
  // Automatically release expired assignments before computing candidate pools
  await releaseExpiredAssignments();

  const location = await Location.findById(locationId);
  if (!location) {
    const error = new Error("Location not found");
    error.statusCode = 404;
    throw error;
  }

  const isLocationOver = isDeploymentOver(location.date, location.shiftEnd);

  const allVolunteers = await Volunteer.find().populate("user", "fullName email role");

  // Query ALL active assignments across all sites to detect cross-site double-booking
  const allActiveAssignments = await Assignment.find({
    status: { $in: ["PROPOSED", "CONFIRMED"] },
  }).populate("location", "name date shiftStart shiftEnd");

  const assignmentsByVolunteer = new Map();
  for (const assign of allActiveAssignments) {
    const vId = assign.volunteer.toString();
    if (!assignmentsByVolunteer.has(vId)) {
      assignmentsByVolunteer.set(vId, []);
    }
    assignmentsByVolunteer.get(vId).push(assign);
  }

  const requirements = location.requirements || [];
  if (requirements.length === 0) {
    return {
      eligible: [],
      potentiallySuitable: [],
      ineligible: [],
      locationRequirements: [],
    };
  }

  const locDateStr = location.date ? new Date(location.date).toISOString().split("T")[0] : null;
  const eligibleList = [];
  const suitableList = [];
  const ineligibleList = [];

  for (const vol of allVolunteers) {
    const volId = vol._id.toString();
    const volSkills = vol.skills || [];
    const volName = vol.user?.fullName || "Volunteer";
    const exp = vol.experienceYears || 0;

    // Check cross-site double booking & existing assignments
    const volunteerAssignments = assignmentsByVolunteer.get(volId) || [];
    const isAlreadyAssignedHere = volunteerAssignments.some(
      (a) => a.location?._id?.toString() === locationId.toString()
    );

    // Cross-site conflict: already booked at another location on the same deployment date (or general active deployment)
    const crossSiteConflict = volunteerAssignments.find((a) => {
      if (!a.location) return false;
      if (a.location?._id?.toString() === locationId.toString()) return false;
      if (!a.location?.date || !locDateStr) return true;
      const otherDateStr = new Date(a.location.date).toISOString().split("T")[0];
      return otherDateStr === locDateStr;
    });

    const isDoubleBooked = Boolean(crossSiteConflict);
    const doubleBookedDetails = crossSiteConflict
      ? `Already deployed at ${crossSiteConflict.location?.name || "another site"} on this date (${crossSiteConflict.task})`
      : null;

    // Evaluate matching skills against all requirements
    const matchingSkills = [];
    const missingSkills = [];
    let bestWeightedScore = 0;
    let bestScoreBreakdown = null;

    for (const req of requirements) {
      const matchedVolSkill = volSkills.find((s) =>
        skillsMatch(s.skillName || s.skill || "", req.requiredSkill)
      );

      if (matchedVolSkill) {
        const proficiency = matchedVolSkill.proficiency || 1;
        const meetsProficiency = proficiency >= (req.minProficiency || 1);
        matchingSkills.push({
          skill: req.requiredSkill,
          volunteerSkillName: matchedVolSkill.skillName || matchedVolSkill.skill,
          proficiency,
          required: req.minProficiency || 1,
          meetsProficiency,
        });

        // Compute weighted score for this requirement
        const availResult = checkAvailabilityDetailed(vol, location.date, location.shiftStart, location.shiftEnd);
        const scoring = calculateWeightedMatchScore(vol, location, req, proficiency, availResult);

        if (scoring.matchScore > bestWeightedScore) {
          bestWeightedScore = scoring.matchScore;
          bestScoreBreakdown = scoring.scoreBreakdown;
        }
      } else {
        missingSkills.push({
          skill: req.requiredSkill,
          minProficiency: req.minProficiency || 1,
        });
      }
    }

    const availResult = checkAvailabilityDetailed(vol, location.date, location.shiftStart, location.shiftEnd);

    // If no skills matched at all, compute baseline score for ineligible display
    if (!bestScoreBreakdown) {
      const scoring = calculateWeightedMatchScore(vol, location, requirements[0], 0, availResult);
      bestWeightedScore = scoring.matchScore;
      bestScoreBreakdown = scoring.scoreBreakdown;
    }

    const totalRequiredCount = requirements.length;
    const matchPercentage = bestWeightedScore;

    const registeredSkillNames = volSkills.map((s) => s.skillName || s.skill).filter(Boolean);
    const matchedNames = matchingSkills.map((s) => s.skill);
    const missingNames = missingSkills.map((s) => s.skill);

    // ── Location & Time Match Checks ──
    const volCity = (vol.homeAddress || vol.city || "").toLowerCase().trim();
    const locCity = (location.city || location.address || "").toLowerCase().trim();
    const locationMatches = isLocationMatch(volCity, locCity);
    let locationMismatchReason = "";

    if (!locationMatches) {
      locationMismatchReason = !volCity
        ? `Location not specified (site is in ${location.city || location.address})`
        : `Location mismatch: volunteer is in ${vol.homeAddress || vol.city}, site is in ${location.city || location.address}`;
    }

    const timeMatches = Boolean(availResult.isAvailable);
    const timeMismatchReason = !timeMatches
      ? availResult.details || "Shift date or time does not match site deployment window"
      : "";

    // ── 3-Tier Separation: Eligible, Potentially Suitable, Ineligible ──
    const hasQualifiedSkill = matchingSkills.some((s) => s.meetsProficiency);

    // Build data-driven recommendation / assessment reason
    let recommendationReason = "";
    if (hasQualifiedSkill && locationMatches && timeMatches && !isDoubleBooked && !isAlreadyAssignedHere) {
      recommendationReason = `${volName} is highly recommended with a ${bestWeightedScore}% match score. They satisfy required skills (${matchedNames.join(", ")}), are based locally (${vol.homeAddress || vol.city || "Matches site"}), and are fully available for this shift window.`;
    } else if (matchingSkills.length > 0) {
      const reasons = [];
      if (!hasQualifiedSkill) reasons.push("skill proficiency below required threshold");
      if (!locationMatches) reasons.push(locationMismatchReason);
      if (!timeMatches) reasons.push(timeMismatchReason);
      if (isDoubleBooked) reasons.push(`cross-site conflict: ${doubleBookedDetails}`);
      if (isAlreadyAssignedHere) reasons.push("already assigned to this site");

      recommendationReason = `${volName} holds relevant ${matchedNames.join(" and ")} skills (${bestWeightedScore}% score), but is moved to Potentially Suitable because: ${reasons.join("; ")}.`;
    } else {
      recommendationReason = `${volName} has no registered skills matching this site's requirements (${requirements.map((r) => r.requiredSkill).join(", ")}). Registered skills: ${registeredSkillNames.join(", ") || "None specified"}.`;
    }

    const candidateObj = {
      volunteerId: volId,
      volunteerName: volName,
      email: vol.user?.email || "",
      phone: vol.phone || "",
      experienceYears: exp,
      mobilityLevel: vol.mobilityLevel || "Medium",
      homeAddress: vol.homeAddress || "",
      locationMatches,
      timeMatches,
      locationMismatchReason,
      timeMismatchReason,
      matchPercentage,
      matchingSkills,
      missingSkills,
      totalRequiredSkills: totalRequiredCount,
      matchScore: bestWeightedScore,
      scoreBreakdown: bestScoreBreakdown,
      isAvailable: availResult.isAvailable && !isDoubleBooked && !isAlreadyAssignedHere,
      availabilityDetails: availResult.details,
      isAlreadyAssigned: isAlreadyAssignedHere,
      isDoubleBooked,
      doubleBookedDetails,
      recommendationReason,
      languages: (vol.languages || []).map((l) => ({
        language: l.language,
        proficiency: l.proficiency,
      })),
      allSkills: volSkills.map((s) => ({
        skill: s.skillName || s.skill || "",
        proficiency: s.proficiency || 1,
      })),
    };

    // ── 3-Tier Separation: Eligible, Potentially Suitable, Ineligible ──
    // ACTUALLY ELIGIBLE: Must satisfy matching skill at required proficiency AND location must match site AND time must match shift
    if (hasQualifiedSkill && locationMatches && timeMatches) {
      candidateObj.type = "eligible";
      eligibleList.push(candidateObj);
    } else if (matchingSkills.length > 0) {
      // Potentially Suitable: Matches some skills, but missing required proficiency, location, or timing
      candidateObj.type = "suitable";
      suitableList.push(candidateObj);
    } else {
      // Ineligible: Unrelated skills
      candidateObj.type = "ineligible";
      ineligibleList.push(candidateObj);
    }
  }

  // Calculate actual site capacity and staffing metrics
  const assignedHereCount = (allActiveAssignments || []).filter(
    (a) => a.location?._id?.toString() === locationId.toString()
  ).length;
  const totalRequiredCount = requirements.reduce((s, r) => s + (r.requiredCount || 1), 0);
  const isSiteFull = assignedHereCount >= totalRequiredCount;

  // Sort candidates descending by weighted match score
  eligibleList.sort((a, b) => b.matchScore - a.matchScore);
  suitableList.sort((a, b) => b.matchScore - a.matchScore);
  ineligibleList.sort((a, b) => b.matchScore - a.matchScore);

  return {
    eligible: eligibleList,
    potentiallySuitable: suitableList,
    ineligible: ineligibleList,
    assignedCount: assignedHereCount,
    totalRequired: totalRequiredCount,
    isSiteFull,
    isDeploymentOver: isLocationOver,
    remainingNeeded: Math.max(0, totalRequiredCount - assignedHereCount),
    locationRequirements: requirements.map((r) => ({
      id: r._id,
      task: r.task,
      requiredSkill: r.requiredSkill,
      minProficiency: r.minProficiency || 1,
      requiredCount: r.requiredCount || 1,
      isSafetyCritical: r.isSafetyCritical || false,
      requiredLanguage: r.requiredLanguage || null,
      minMobilityLevel: r.minMobilityLevel || "Low",
    })),
  };
};

