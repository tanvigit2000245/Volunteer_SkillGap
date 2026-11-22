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

import time
import re
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

def normalize_skill(s: str) -> str:
    return re.sub(r"[^a-z0-9]", "", (s or "").lower())

SKILL_DOMAIN_ALIASES = {
    "firstaid": ["medical", "cpr", "emergencyresponse", "patientcare", "patientmonitoring", "firstaid", "nursing", "paramedic"],
    "medical": ["firstaid", "cpr", "emergencyresponse", "patientcare", "patientmonitoring", "medicaladvanced", "nursing", "doctor"],
    "medicaladvanced": ["medical", "firstaid", "emergencyresponse", "patientcare", "patientmonitoring", "nursing", "doctor"],
    "emergencyresponse": ["firstaid", "cpr", "medical", "patientmonitoring", "emergencysupport", "disasterhelp"],
    "patientcare": ["medical", "firstaid", "nursing", "patientmonitoring"],
    "patientmonitoring": ["medical", "firstaid", "patientcare", "nursing", "emergencyresponse"],
    "construction": ["carpentry", "masonry", "building", "equipmenthandling", "heavyequipment", "demolition", "repairs"],
    "equipmenthandling": ["construction", "heavyequipment", "logistics", "toolsoperation"],
    "teaching": ["education", "training", "tutoring", "instruction", "mentoring"],
    "logistics": ["supplychain", "warehousing", "inventory", "transportation", "distribution"],
    "communication": ["translation", "publicrelations", "english", "hindi", "dispatch"],
    "safety": ["safetymanagement", "construction", "security", "hazardcontrol"],
}

def skills_match(vol_skill: str, req_skill: str) -> bool:
    if not vol_skill or not req_skill:
        return False
    v_norm = normalize_skill(vol_skill)
    r_norm = normalize_skill(req_skill)

    if v_norm == r_norm:
        return True

    if len(v_norm) >= 4 and len(r_norm) >= 4:
        if v_norm in r_norm or r_norm in v_norm:
            return True

    v_words = [w for w in re.split(r"[\s,/-]+", vol_skill.lower()) if len(w) > 2]
    r_words = [w for w in re.split(r"[\s,/-]+", req_skill.lower()) if len(w) > 2]
    if any(rw in vw or vw in rw for vw in v_words for rw in r_words):
        return True

    for key, alias_list in SKILL_DOMAIN_ALIASES.items():
        v_has = key in v_norm or any(a in v_norm for a in alias_list)
        r_has = key in r_norm or any(a in r_norm for a in alias_list)
        if v_has and r_has:
            return True

    return False

GENERIC_REGION_WORDS = {
    "punjab", "delhi", "maharashtra", "karnataka", "tamil", "nadu", "gujarat",
    "rajasthan", "uttar", "pradesh", "haryana", "kerala", "bengal", "india",
    "state", "district", "city", "region", "zone", "north", "south", "east", "west", "central", "usa", "uk"
}

def is_location_match(vol_address: str, loc_address: str) -> bool:
    if not loc_address or not loc_address.strip():
        return True
    if not vol_address or not vol_address.strip():
        return False

    v_clean = vol_address.lower().strip()
    l_clean = loc_address.lower().strip()

    if v_clean == l_clean or v_clean in l_clean or l_clean in v_clean:
        return True

    v_parts = [p.strip() for p in v_clean.split(",") if p.strip()]
    l_parts = [p.strip() for p in l_clean.split(",") if p.strip()]
    if v_parts and l_parts:
        if v_parts[0] == l_parts[0] or v_parts[0] in l_parts[0] or l_parts[0] in v_parts[0]:
            return True

    v_tokens = [t for t in re.split(r"[\s,.-]+", v_clean) if len(t) > 2 and t not in GENERIC_REGION_WORDS]
    l_tokens = [t for t in re.split(r"[\s,.-]+", l_clean) if len(t) > 2 and t not in GENERIC_REGION_WORDS]

    if v_tokens and l_tokens:
        return any(vt in lt or lt in vt for vt in v_tokens for lt in l_tokens)

    return False

def time_to_minutes(time_str: str) -> int:
    if not time_str:
        return 0
    parts = time_str.split(":")
    return int(parts[0]) * 60 + int(parts[1])

def check_availability_detailed(volunteer: VolunteerData, target_date: str, shift_start: str, shift_end: str) -> Dict[str, Any]:
    if not volunteer.availability:
        return {
            "isAvailable": True,
            "score": 60,
            "details": "Open/flexible availability (no calendar restrictions specified)",
        }

    shift_start_min = time_to_minutes(shift_start or "09:00")
    shift_end_min = time_to_minutes(shift_end or "17:00")
    target_date_str = target_date.split("T")[0] if target_date else None

    has_date_match = False
    full_match = False
    partial_match = False

    for slot in volunteer.availability:
        slot_date_str = slot.date.split("T")[0] if slot.date else None
        if slot_date_str == target_date_str:
            has_date_match = True
            slot_start_min = time_to_minutes(slot.startTime)
            slot_end_min = time_to_minutes(slot.endTime)

            if slot_start_min <= shift_start_min and slot_end_min >= shift_end_min:
                full_match = True
                break

            overlap_start = max(slot_start_min, shift_start_min)
            overlap_end = min(slot_end_min, shift_end_min)
            overlap = max(0, overlap_end - overlap_start)
            shift_dur = max(1, shift_end_min - shift_start_min)
            if overlap / shift_dur >= 0.5:
                partial_match = True

    if full_match:
        return {"isAvailable": True, "score": 100, "details": "Fully available for date and shift"}
    if partial_match:
        return {"isAvailable": True, "score": 75, "details": "Partial shift overlap (50%+)"}
    if has_date_match:
        return {"isAvailable": False, "score": 25, "details": "Time conflict on this date"}
    return {"isAvailable": False, "score": 40, "details": "Available on alternate dates"}

def check_availability(volunteer: VolunteerData, target_date: str, shift_start: str, shift_end: str) -> bool:
    return check_availability_detailed(volunteer, target_date, shift_start, shift_end)["isAvailable"]

def evaluate_hard_constraints(
    volunteer: VolunteerData,
    requirement: RequirementData,
    location_date: str,
    shift_start: str,
    shift_end: str,
    location_city: Optional[str] = None,
) -> Dict[str, Any]:
    failure_reasons = []

    # 1. Skill check using flexible matcher
    matching_skill = next(
        (s for s in volunteer.skills if skills_match(s.skill, requirement.requiredSkill)),
        None,
    )
    if not matching_skill:
        failure_reasons.append("NO_VOLUNTEERS_WITH_SKILL")
    else:
        min_prof = requirement.minProficiency or 1
        if matching_skill.proficiency < min_prof:
            failure_reasons.append("BELOW_MINIMUM_PROFICIENCY")

    # 2. Mandatory language check
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

    # 3. Mobility check
    vol_mobility_rank = MOBILITY_MAP.get(volunteer.mobilityLevel, 2)
    req_mobility_rank = MOBILITY_MAP.get(requirement.mobilityLevel or "Low", 1)
    if vol_mobility_rank < req_mobility_rank:
        failure_reasons.append("MOBILITY_LEVEL_INSUFFICIENT")

    # 4. Availability analysis: date and shift timing
    avail_res = check_availability_detailed(volunteer, location_date, shift_start, shift_end)
    if not avail_res.get("isAvailable"):
        failure_reasons.append("AVAILABILITY_SHIFT_CONFLICT")

    # 5. Location matching check
    if location_city and location_city.strip():
        vol_city = (getattr(volunteer, "homeAddress", "") or getattr(volunteer, "city", "") or "").lower().strip()
        if not is_location_match(vol_city, location_city):
            failure_reasons.append("LOCATION_MISMATCH")

    return {
        "eligible": len(failure_reasons) == 0,
        "failureReasons": failure_reasons,
        "skillProficiency": matching_skill.proficiency if matching_skill else 0,
        "languageFluency": (
            next((l.fluency for l in volunteer.languages if requirement.requiredLanguage and l.language.strip().lower() == requirement.requiredLanguage.strip().lower()), "BASIC")
            if requirement.requiredLanguage
            else "CONVERSATIONAL"
        ),
        "availResult": avail_res,
    }

def calculate_match_score(
    volunteer: VolunteerData,
    requirement: RequirementData,
    skill_proficiency: int,
    language_fluency: str,
    location: Optional[LocationData] = None,
    avail_result: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    min_prof = requirement.minProficiency or 1

    # Skills Score (40% weight)
    if skill_proficiency >= min_prof:
        skills_score = min(90.0, 70.0 + (skill_proficiency - min_prof) * 10.0)
        if skill_proficiency >= 4:
            skills_score = min(100.0, skills_score + 10.0)
    elif skill_proficiency > 0:
        skills_score = max(20.0, (skill_proficiency / min_prof) * 45.0)
    else:
        skills_score = 0.0

    # Location / Travel Proximity Score (25% weight)
    loc_city = (location.city if location else "").lower().strip()
    vol_city = getattr(volunteer, "city", "").lower().strip()
    if loc_city and vol_city and (loc_city in vol_city or vol_city in loc_city):
        location_score = 100.0
    else:
        mobility = volunteer.mobilityLevel or "Medium"
        location_score = 70.0 if mobility == "High" else 45.0 if mobility == "Medium" else 25.0

    # Availability Score (25% weight)
    avail_score = float(avail_result.get("score", 60) if avail_result else 60)

    # Experience Score (10% weight)
    exp = volunteer.experienceYears or 0
    if exp >= 5:
        exp_score = 100.0
    elif exp >= 3:
        exp_score = 90.0
    elif exp >= 2:
        exp_score = 75.0
    elif exp >= 1:
        exp_score = 55.0
    else:
        exp_score = 30.0

    total_weighted = round(
        (skills_score * 0.40) +
        (location_score * 0.25) +
        (avail_score * 0.25) +
        (exp_score * 0.10),
        2
    )

    return {
        "matchScore": min(100.0, max(0.0, total_weighted)),
        "scoreBreakdown": {
            "skillsScore": round(skills_score, 1),
            "locationScore": round(location_score, 1),
            "availabilityScore": round(avail_score, 1),
            "experienceScore": round(exp_score, 1),
            "weights": {"skills": "40%", "location": "25%", "availability": "25%", "experience": "10%"},
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
            eval_res = evaluate_hard_constraints(
                vol,
                req,
                loc.date,
                loc.shiftStart,
                loc.shiftEnd,
                location_city=loc.city or loc.address,
            )

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
                    location=loc,
                    avail_result=eval_res.get("availResult"),
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
                            assignmentExplanation=(
                                f"{vol.fullName} was assigned to {loc.name} because their "
                                f"{req.requiredSkill} skill matches the site's {req.task} requirement, "
                                f"they are available for the selected shift, and they have no conflicting assignment."
                            ),
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
                    assignmentExplanation=(
                        f"{vol.fullName} was assigned to {loc.name} because their "
                        f"{req.requiredSkill} skill matches the site's {req.task} requirement, "
                        f"they are available for the selected shift, and they have no conflicting assignment."
                    ),
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
