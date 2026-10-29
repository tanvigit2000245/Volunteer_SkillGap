import time
from typing import List, Dict, Any, Tuple, Optional
import numpy as np
from scipy.optimize import milp, LinearConstraint, Bounds

from schemas import (
    OptimizationRequest,
    OptimizationResponse,
    ProposedAssignment,
    DetectedSkillGap,
    GapExplanation,
    GapMetrics,
    OptimizationStats,
    LocationData,
    RequirementData,
    VolunteerData,
)

MOBILITY_MAP = {
    "Low": 1,
    "Medium": 2,
    "High": 3,
}

FLUENCY_MAP = {
    "BASIC": 1,
    "CONVERSATIONAL": 2,
    "FLUENT": 3,
}

def time_to_minutes(time_str: str) -> int:
    if not time_str:
        return 0
    parts = time_str.split(":")
    return int(parts[0]) * 60 + int(parts[1])

def check_availability(volunteer: VolunteerData, target_date: str, shift_start: str, shift_end: str) -> bool:
    if not volunteer.availability:
        return False

    shift_start_min = time_to_minutes(shift_start)
    shift_end_min = time_to_minutes(shift_end)
    target_date_str = target_date.split("T")[0]

    for slot in volunteer.availability:
        slot_date_str = slot.date.split("T")[0]
        if slot_date_str != target_date_str:
            continue

        slot_start_min = time_to_minutes(slot.startTime)
        slot_end_min = time_to_minutes(slot.endTime)

        if slot_start_min <= shift_start_min and slot_end_min >= shift_end_min:
            return True

    return False

def evaluate_hard_constraints(
    volunteer: VolunteerData,
    requirement: RequirementData,
    location_date: str,
    shift_start: str,
    shift_end: str,
) -> Dict[str, Any]:
    failure_reasons = []

    # 1. Availability check
    if not check_availability(volunteer, location_date, shift_start, shift_end):
        failure_reasons.append("AVAILABILITY_SHIFT_CONFLICT")

    # 2. Skill check
    matching_skill = next(
        (s for s in volunteer.skills if s.skill.strip().lower() == requirement.requiredSkill.strip().lower()),
        None,
    )
    if not matching_skill:
        failure_reasons.append("NO_VOLUNTEERS_WITH_SKILL")
    else:
        # 3. Minimum proficiency threshold
        min_prof = requirement.minProficiency or 1
        if matching_skill.proficiency < min_prof:
            failure_reasons.append("BELOW_MINIMUM_PROFICIENCY")

    # 4. Mandatory language check
    if requirement.requiredLanguage:
        matching_lang = next(
            (l for l in volunteer.languages if l.language.strip().lower() == requirement.requiredLanguage.strip().lower()),
            None,
        )
        if not matching_lang:
            failure_reasons.append("MISSING_MANDATORY_LANGUAGE")
        else:
            vol_fluency_rank = FLUENCY_MAP.get(matching_lang.fluency, 1)
            req_fluency_rank = FLUENCY_MAP.get(requirement.minLanguageFluency or "CONVERSATIONAL", 2)
            if vol_fluency_rank < req_fluency_rank:
                failure_reasons.append("BELOW_MIN_LANGUAGE_FLUENCY")

    # 5. Mobility check
    vol_mobility_rank = MOBILITY_MAP.get(volunteer.mobilityLevel, 2)
    req_mobility_rank = MOBILITY_MAP.get(requirement.mobilityLevel or "Low", 1)
    if vol_mobility_rank < req_mobility_rank:
        failure_reasons.append("MOBILITY_LEVEL_INSUFFICIENT")

    return {
        "eligible": len(failure_reasons) == 0,
        "failureReasons": failure_reasons,
        "skillProficiency": matching_skill.proficiency if matching_skill else 0,
        "languageFluency": (
            next((l.fluency for l in volunteer.languages if requirement.requiredLanguage and l.language.strip().lower() == requirement.requiredLanguage.strip().lower()), "BASIC")
            if requirement.requiredLanguage
            else "CONVERSATIONAL"
        ),
    }

def calculate_match_score(
    volunteer: VolunteerData,
    requirement: RequirementData,
    skill_proficiency: int,
    language_fluency: str,
) -> Dict[str, Any]:
    base_score = 40.0

    # Skill proficiency bonus (up to 30 pts)
    min_prof = requirement.minProficiency or 1
    excess_proficiency = max(0, skill_proficiency - min_prof)
    skill_bonus = min(30.0, 15.0 + (excess_proficiency * 7.5))

    # Experience bonus (up to 15 pts)
    experience_bonus = min(15.0, float(volunteer.experienceYears or 0) * 3.0)

    # Language fluency bonus (up to 10 pts)
    if language_fluency == "FLUENT":
        language_bonus = 10.0
    elif language_fluency == "CONVERSATIONAL":
        language_bonus = 5.0
    else:
        language_bonus = 0.0

    # Mobility bonus (up to 5 pts)
    if volunteer.mobilityLevel == "High":
        mobility_bonus = 5.0
    elif volunteer.mobilityLevel == "Medium":
        mobility_bonus = 3.0
    else:
        mobility_bonus = 1.0

    total_score = min(
        100.0,
        round(base_score + skill_bonus + experience_bonus + language_bonus + mobility_bonus, 2),
    )

    return {
        "matchScore": total_score,
        "scoreBreakdown": {
            "baseScore": base_score,
            "skillBonus": skill_bonus,
            "experienceBonus": experience_bonus,
            "languageBonus": language_bonus,
            "mobilityBonus": mobility_bonus,
        },
    }

def build_gap_explanation(shortage: int, metrics: GapMetrics, requirement: RequirementData) -> GapExplanation:
    reason_codes = []
    parts = []

    if metrics.totalVolunteers == 0:
        reason_codes.append("NO_VOLUNTEERS_REGISTERED")
        parts.append("No volunteers are registered in the system")
    elif metrics.noSkillCount == metrics.totalVolunteers:
        reason_codes.append("NO_VOLUNTEERS_WITH_SKILL")
        parts.append(f"No registered volunteers hold the skill '{requirement.requiredSkill}'")
    else:
        if metrics.belowProficiencyCount > 0:
            reason_codes.append("BELOW_MINIMUM_PROFICIENCY")
            parts.append(
                f"{metrics.belowProficiencyCount} volunteer(s) hold the skill but fall below the minimum required proficiency of {requirement.minProficiency}"
            )
        if metrics.shiftUnavailableCount > 0:
            reason_codes.append("AVAILABILITY_SHIFT_CONFLICT")
            parts.append(f"{metrics.shiftUnavailableCount} volunteer(s) are unavailable during this date or shift window")
        if metrics.missingLanguageCount > 0:
            reason_codes.append("MISSING_MANDATORY_LANGUAGE")
            parts.append(
                f"{metrics.missingLanguageCount} volunteer(s) lack required language '{requirement.requiredLanguage}' or fluency"
            )
        if metrics.mobilityDeficitCount > 0:
            reason_codes.append("MOBILITY_LEVEL_INSUFFICIENT")
            parts.append(
                f"{metrics.mobilityDeficitCount} volunteer(s) do not meet the minimum mobility level '{requirement.mobilityLevel}'"
            )
        if metrics.alreadyAssignedCount > 0:
            reason_codes.append("ALREADY_ASSIGNED_TO_OTHER_TASK")
            parts.append(f"{metrics.alreadyAssignedCount} eligible volunteer(s) were assigned to competing tasks")

    if not reason_codes and parts:
        reason_codes.append("INSUFFICIENT_POOL")
    elif not reason_codes and not parts:
        reason_codes.append("INSUFFICIENT_VOLUNTEERS")
        parts.append(f"Insufficient total eligible volunteer pool to fulfill headcount of {requirement.requiredCount}")

    description = f"Shortage: {shortage} volunteer(s). {'; '.join(parts)}."
    return GapExplanation(reasonCodes=reason_codes, description=description, metrics=metrics)

def solve_global_assignment(request: OptimizationRequest) -> OptimizationResponse:
    start_time = time.time()

    locations = request.locations
    volunteers = request.volunteers

    # Flatten requirements with location context
    flat_requirements: List[Dict[str, Any]] = []
    total_required_slots = 0

    for loc in locations:
        for req in loc.requirements:
            total_required_slots += req.requiredCount
            flat_requirements.append({
                "location": loc,
                "requirement": req,
                "key": f"{loc.id}::{req.id}",
            })

    # Pre-filter candidate eligibility and compute match scores
    candidate_pairs: List[Dict[str, Any]] = []
    gap_metrics_dict: Dict[str, GapMetrics] = {}

    for item in flat_requirements:
        loc = item["location"]
        req = item["requirement"]
        key = item["key"]

        metrics = GapMetrics(totalVolunteers=len(volunteers))

        for vol in volunteers:
            eval_res = evaluate_hard_constraints(vol, req, loc.date, loc.shiftStart, loc.shiftEnd)

            if "NO_VOLUNTEERS_WITH_SKILL" in eval_res["failureReasons"]:
                metrics.noSkillCount += 1
            if "BELOW_MINIMUM_PROFICIENCY" in eval_res["failureReasons"]:
                metrics.belowProficiencyCount += 1
            if "MISSING_MANDATORY_LANGUAGE" in eval_res["failureReasons"] or "BELOW_MIN_LANGUAGE_FLUENCY" in eval_res["failureReasons"]:
                metrics.missingLanguageCount += 1
            if "MOBILITY_LEVEL_INSUFFICIENT" in eval_res["failureReasons"]:
                metrics.mobilityDeficitCount += 1
            if "AVAILABILITY_SHIFT_CONFLICT" in eval_res["failureReasons"]:
                metrics.shiftUnavailableCount += 1

            if eval_res["eligible"]:
                scoring = calculate_match_score(
                    vol,
                    req,
                    eval_res["skillProficiency"],
                    eval_res["languageFluency"],
                )
                candidate_pairs.append({
                    "req_key": key,
                    "location": loc,
                    "requirement": req,
                    "volunteer": vol,
                    "matchScore": scoring["matchScore"],
                    "scoreBreakdown": scoring["scoreBreakdown"],
                })

        gap_metrics_dict[key] = metrics

    num_candidates = len(candidate_pairs)
    proposed_assignments: List[ProposedAssignment] = []
    assigned_vol_ids = set()
    requirement_assigned_counts: Dict[str, int] = {item["key"]: 0 for item in flat_requirements}

    solver_name = "HIGHS_MILP"
    status_str = "OPTIMAL"
    objective_val = 0.0

    if num_candidates > 0:
        try:
            # Build MILP with SciPy / HiGHS
            # Objective: Maximize sum((1000 + matchScore) * x_i) => Minimize -sum(...)
            BIG_M = 1000.0
            c = -np.array([BIG_M + cp["matchScore"] for cp in candidate_pairs], dtype=float)
            integrality = np.ones(num_candidates, dtype=int)
            bounds = Bounds(0, 1)

            # Constraints:
            # 1. Headcount quota per requirement: sum(x_i for i in req) <= requiredCount
            # 2. Maximum one assignment per volunteer: sum(x_i for i in vol) <= 1
            num_req_constraints = len(flat_requirements)
            num_vol_constraints = len(volunteers)
            total_constraints = num_req_constraints + num_vol_constraints

            A = np.zeros((total_constraints, num_candidates), dtype=float)
            ub = np.zeros(total_constraints, dtype=float)

            # Map req_key -> constraint index
            req_idx_map = {item["key"]: i for i, item in enumerate(flat_requirements)}
            for item in flat_requirements:
                r_idx = req_idx_map[item["key"]]
                ub[r_idx] = item["requirement"].requiredCount

            # Map vol.id -> constraint index
            vol_idx_map = {vol.id: num_req_constraints + j for j, vol in enumerate(volunteers)}
            for vol in volunteers:
                v_idx = vol_idx_map[vol.id]
                ub[v_idx] = 1.0

            # Fill A matrix
            for i, cp in enumerate(candidate_pairs):
                r_idx = req_idx_map[cp["req_key"]]
                v_idx = vol_idx_map[cp["volunteer"].id]
                A[r_idx, i] = 1.0
                A[v_idx, i] = 1.0

            constraints = LinearConstraint(A, lb=0.0, ub=ub)
            res = milp(c=c, integrality=integrality, bounds=bounds, constraints=constraints)

            if res.success:
                objective_val = float(-res.fun)
                for i, cp in enumerate(candidate_pairs):
                    if res.x[i] > 0.5:
                        vol = cp["volunteer"]
                        req = cp["requirement"]
                        loc = cp["location"]
                        key = cp["req_key"]

                        proposed_assignments.append(ProposedAssignment(
                            locationId=loc.id,
                            requirementId=req.id,
                            volunteerId=vol.id,
                            task=req.task,
                            matchScore=cp["matchScore"],
                            scoreBreakdown=cp["scoreBreakdown"],
                            volunteerDetails={
                                "fullName": vol.fullName,
                                "email": vol.email,
                                "phone": vol.phone,
                            },
                        ))
                        assigned_vol_ids.add(vol.id)
                        requirement_assigned_counts[key] += 1
            else:
                solver_name = "GREEDY_FALLBACK"
                status_str = "FEASIBLE"
        except Exception:
            solver_name = "GREEDY_FALLBACK"
            status_str = "FEASIBLE"

    # Fallback to greedy if MILP was not used or failed
    if solver_name == "GREEDY_FALLBACK" and num_candidates > 0:
        sorted_pairs = sorted(candidate_pairs, key=lambda cp: cp["matchScore"], reverse=True)
        for cp in sorted_pairs:
            key = cp["req_key"]
            req = cp["requirement"]
            vol = cp["volunteer"]
            loc = cp["location"]

            if vol.id not in assigned_vol_ids and requirement_assigned_counts[key] < req.requiredCount:
                assigned_vol_ids.add(vol.id)
                requirement_assigned_counts[key] += 1
                proposed_assignments.append(ProposedAssignment(
                    locationId=loc.id,
                    requirementId=req.id,
                    volunteerId=vol.id,
                    task=req.task,
                    matchScore=cp["matchScore"],
                    scoreBreakdown=cp["scoreBreakdown"],
                    volunteerDetails={
                        "fullName": vol.fullName,
                        "email": vol.email,
                        "phone": vol.phone,
                    },
                ))
        objective_val = float(sum(1000.0 + a.matchScore for a in proposed_assignments))

    # Build Detected Skill Gaps with explainability
    detected_gaps: List[DetectedSkillGap] = []
    for item in flat_requirements:
        key = item["key"]
        loc = item["location"]
        req = item["requirement"]
        assigned_cnt = requirement_assigned_counts[key]

        if assigned_cnt < req.requiredCount:
            shortage = req.requiredCount - assigned_cnt
            metrics = gap_metrics_dict[key]

            # Count candidates that were eligible for this requirement but assigned elsewhere
            assigned_elsewhere = 0
            for cp in candidate_pairs:
                if cp["req_key"] == key and cp["volunteer"].id in assigned_vol_ids:
                    was_assigned_here = any(
                        pa.volunteerId == cp["volunteer"].id and pa.requirementId == req.id
                        for pa in proposed_assignments
                    )
                    if not was_assigned_here:
                        assigned_elsewhere += 1

            metrics.alreadyAssignedCount = assigned_elsewhere
            explanation = build_gap_explanation(shortage, metrics, req)

            detected_gaps.append(DetectedSkillGap(
                locationId=loc.id,
                requirementId=req.id,
                task=req.task,
                requiredSkill=req.requiredSkill,
                requiredLanguage=req.requiredLanguage,
                required=req.requiredCount,
                assigned=assigned_cnt,
                shortage=shortage,
                explanation=explanation,
            ))

    total_assigned = len(proposed_assignments)
    avg_score = (
        round(sum(a.matchScore for a in proposed_assignments) / total_assigned, 2)
        if total_assigned > 0
        else 0.0
    )
    coverage_rate = (
        round((total_assigned / total_required_slots) * 100, 2)
        if total_required_slots > 0
        else 100.0
    )
    elapsed_ms = round((time.time() - start_time) * 1000, 2)

    stats = OptimizationStats(
        totalVolunteersPool=len(volunteers),
        totalRequiredSlots=total_required_slots,
        totalAssigned=total_assigned,
        totalGaps=len(detected_gaps),
        globalCoverageRate=coverage_rate,
        averageMatchScore=avg_score,
        computationTimeMs=elapsed_ms,
    )

    return OptimizationResponse(
        status=status_str,
        solver=solver_name,
        objectiveValue=round(objective_val, 2),
        proposedAssignments=proposed_assignments,
        detectedSkillGaps=detected_gaps,
        stats=stats,
    )
