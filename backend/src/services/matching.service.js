import axios from "axios";
import Volunteer from "../models/Volunteer.js";


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
 * Convert "HH:MM" string to minutes from midnight
 */
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

/**
 * Check if a volunteer is available during a specific date and shift window
 */
export const checkAvailability = (volunteer, targetDate, shiftStart, shiftEnd) => {
  if (!volunteer.availability || volunteer.availability.length === 0) {
    return false;
  }

  const shiftStartMin = timeToMinutes(shiftStart);
  const shiftEndMin = timeToMinutes(shiftEnd);

  const targetDateStr = new Date(targetDate).toISOString().split("T")[0];

  return volunteer.availability.some((slot) => {
    const slotDateStr = new Date(slot.date).toISOString().split("T")[0];
    if (slotDateStr !== targetDateStr) return false;

    const slotStartMin = timeToMinutes(slot.startTime);
    const slotEndMin = timeToMinutes(slot.endTime);

    // Volunteer available if their slot covers the shift window
    return slotStartMin <= shiftStartMin && slotEndMin >= shiftEndMin;
  });
};

/**
 * Evaluates hard constraints for a volunteer against a task requirement
 * Returns { eligible: boolean, failureReasons: string[], skillProficiency: number, languageFluency: string }
 */
export const evaluateHardConstraints = (volunteer, requirement, locationDate, shiftStart, shiftEnd) => {
  const failureReasons = [];

  // 1. Availability check
  const isAvailable = checkAvailability(volunteer, locationDate, shiftStart, shiftEnd);
  if (!isAvailable) {
    failureReasons.push("AVAILABILITY_SHIFT_CONFLICT");
  }

  // 2. Skill & Minimum Proficiency check
  const reqSkillLower = requirement.requiredSkill.toLowerCase().trim();
  const volunteerSkill = volunteer.skills?.find((s) => {
    const name = (s.skillName || s.skill || "").toLowerCase().trim();
    return name === reqSkillLower;
  });

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

  // 3. Mandatory Language & Fluency check
  let languageFluency = null;
  if (requirement.requiredLanguage) {
    const reqLangLower = requirement.requiredLanguage.toLowerCase().trim();
    const volunteerLang = volunteer.languages?.find(
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

  // 4. Mobility Requirement check
  const volMobilityScore = MOBILITY_MAP[volunteer.mobilityLevel || "Medium"] || 2;
  const reqMobilityScore = MOBILITY_MAP[requirement.minMobilityLevel || "Low"] || 1;
  if (volMobilityScore < reqMobilityScore) {
    failureReasons.push("MOBILITY_LEVEL_INSUFFICIENT");
  }

  return {
    eligible: failureReasons.length === 0,
    failureReasons,
    skillProficiency,
    languageFluency,
  };
};

/**
 * Compute soft preference score (0 - 100) for an eligible candidate
 */
export const calculateMatchScore = (volunteer, requirement, skillProficiency, languageFluency) => {
  // Skill component (max 40 pts)
  // Base 20 for meeting min threshold, plus up to 20 for higher proficiency
  const minProf = requirement.minProficiency || 1;
  const profDelta = Math.max(0, skillProficiency - minProf);
  const skillScore = Math.min(40, 20 + profDelta * 6.6);

  // Experience component (max 30 pts)
  const expYears = volunteer.experienceYears || 0;
  const experienceScore = Math.min(30, expYears * 7.5);

  // Language component (max 15 pts)
  let languageScore = 0;
  if (languageFluency) {
    const fluencyVal = FLUENCY_MAP[languageFluency] || 1;
    languageScore = fluencyVal * 5; // 5, 10, or 15
  }

  // Mobility component (max 15 pts)
  const volMobilityVal = MOBILITY_MAP[volunteer.mobilityLevel || "Low"] || 1;
  const reqMobilityVal = MOBILITY_MAP[requirement.minMobilityLevel || "Low"] || 1;
  const mobilityDelta = Math.max(0, volMobilityVal - reqMobilityVal);
  const mobilityScore = Math.min(15, 5 + mobilityDelta * 5);

  const totalScore = Math.min(100, Math.round(skillScore + experienceScore + languageScore + mobilityScore));

  return {
    matchScore: totalScore,
    scoreBreakdown: {
      skillScore: Math.round(skillScore),
      experienceScore: Math.round(experienceScore),
      languageScore: Math.round(languageScore),
      mobilityScore: Math.round(mobilityScore),
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
 * Fallback local constraint matching engine (Greedy heuristic)
 */
export const runLocalConstraintMatching = (locations, allVolunteers) => {
  const proposedAssignments = [];
  const detectedSkillGaps = [];

  // Track assigned volunteers in this run so no volunteer is double-booked
  const assignedVolunteerIds = new Set();

  for (const location of locations) {
    const locDate = location.date;
    const shiftStart = location.shiftStart;
    const shiftEnd = location.shiftEnd;

    for (const req of location.requirements) {
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
        const evalResult = evaluateHardConstraints(vol, req, locDate, shiftStart, shiftEnd);

        // Track bottleneck metrics for explainability
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

        // If hard constraints are satisfied, evaluate availability / assignment status
        if (evalResult.eligible) {
          if (assignedVolunteerIds.has(vol._id.toString())) {
            metrics.alreadyAssignedCount++;
          } else {
            const scoring = calculateMatchScore(
              vol,
              req,
              evalResult.skillProficiency,
              evalResult.languageFluency
            );

            candidates.push({
              volunteer: vol,
              matchScore: scoring.matchScore,
              scoreBreakdown: scoring.scoreBreakdown,
            });
          }
        }
      }

      // Rank eligible candidates by matchScore descending (highest suitability first)
      candidates.sort((a, b) => b.matchScore - a.matchScore);

      const assignedCount = Math.min(candidates.length, req.requiredCount);

      // Allocate top candidates
      for (let i = 0; i < assignedCount; i++) {
        const candidate = candidates[i];
        assignedVolunteerIds.add(candidate.volunteer._id.toString());

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
 * Automatically delegates to the external Python Global MILP Optimization Engine
 * when available, with automatic and seamless fallback to the local engine.
 */
export const runConstraintMatching = async (locations) => {
  // 1. Fetch all volunteers with user profiles populated
  const allVolunteers = await Volunteer.find().populate("user", "fullName email role");

  // 2. Attempt remote Python MILP Optimization Service if configured
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
            skill: s.skill,
            proficiency: s.proficiency,
          })),
          languages: (vol.languages || []).map((l) => ({
            language: l.language,
            fluency: l.fluency,
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
          `[MatchingEngine] Global MILP Solver (${response.data.solver}) successfully solved deployment plan. Assigned: ${response.data.stats?.totalAssigned}/${response.data.stats?.totalRequiredSlots} (${response.data.stats?.globalCoverageRate}% coverage) in ${response.data.stats?.computationTimeMs}ms`
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

  // 3. Fallback to local heuristic matching
  return runLocalConstraintMatching(locations, allVolunteers);
};

