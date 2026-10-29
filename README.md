# Volunteer Skill-Gap Deployment Planner

**Project Code:** MCA-SP-029 | **Domain:** Community Services | **Program:** MCA Major Project  
**Guide:** Ankush Kapoor  
**Team:** Rohit Kumar, Tanvi Keshri, I Tanushree, Swastika Raj Kowar, Deepak Tiwari, Shreedhar Panday  

---

## 1. Project Description

A nonprofit knows how many volunteers registered, but not whether each service location has the right combination of language, mobility, and task skills. 

The **Volunteer Skill-Gap Deployment Planner** detects skill gaps, recommends valid assignments, and clearly explains unresolved coverage constraints.

> **Key Premise:** *Volunteer quantity is not volunteer suitability.* A volunteer who looks suitable at a glance may fail critical eligibility constraints (e.g., conflicting shifts, lack of required language fluency, or sub-threshold certification).

### Core Capabilities
- **Volunteer Skills & Profiles:** Track multi-level proficiency, language fluencies, mobility levels, and time slots.
- **Location Requirements:** Define operational staffing targets, task requirements, mandatory skills, language needs, and shifts.
- **Constraint-Matching Engine:** Distinguish between *suitable* and *actually eligible* candidates via hard constraints and soft preferences.
- **Skill-Gap Alerts:** Automatically explain why specific requirements cannot be satisfied.
- **Coordinator Review & Manual Override:** Enable authorized coordinators to adjust assignments with mandatory audit logging (who, why, overridden constraints) while strictly enforcing non-overridable safety qualifications.
- **Deployment Sheet:** Export comprehensive operational deployment schedules with assignments and unresolved gaps.

---

## 2. Core Workflow

```
┌─────────────────────────────────┐      ┌─────────────────────────────────┐
│     1. Volunteer Profiles       │      │    2. Location Requirements     │
│  - Skills & Proficiency (1-5)   │      │  - Required tasks & headcounts  │
│  - Languages & Fluency          │      │  - Skill & proficiency minimums │
│  - Mobility Level (Low/Med/High)│      │  - Mandatory languages          │
│  - Date & Time Availability     │      │  - Mobility & shift schedules   │
│  - Prior Experience (years)     │      │                                 │
└────────────────┬────────────────┘      └────────────────┬────────────────┘
                 │                                        │
                 └──────────────────┬─────────────────────┘
                                    ▼
                 ┌──────────────────────────────────────┐
                 │     3. Constraint-Matching Engine    │
                 │  - Filter ineligible (Hard rules)    │
                 │  - Score valid candidates (Soft prefs│
                 │  - Detect unfulfilled requirements   │
                 └───────┬──────────────────────┬───────┘
                         │                      │
             Valid Assignments           Skill-Gap Alerts
             (Recommended pool)          (Detailed reasons & counts)
                         │                      │
                         └──────────┬───────────┘
                                    ▼
                 ┌──────────────────────────────────────┐
                 │        4. Coordinator Review         │
                 │  - Review recommendations & gaps     │
                 │  - Manual override with logged audit │
                 │  - Generate final Deployment Sheet   │
                 └──────────────────────────────────────┘
```

1. **Volunteer Profiles:** Volunteers register and maintain proficiencies across specialized skills, language fluencies, mobility constraints, date/time availability slots, and experience.
2. **Location Requirements:** Coordinators define service sites, shift timings, task requirements, required headcounts, skill proficiency thresholds, mandatory languages, and mobility levels.
3. **Constraint-Matching Engine:**
   - Evaluates availability, eligibility, proficiency, and coverage requirements.
   - **Valid assignments:** Identifies and ranks suitable volunteers.
   - **Skill-gap alerts:** Detects shortages and computes explainability metrics for missing skills.
4. **Coordinator Review:**
   - Coordinators inspect recommendations and gap alerts.
   - Manual overrides are supported with full audit logging (who, why, which rule was bypassed).
   - Generates the final multi-location **Deployment Sheet**.

---

## 3. Data Models & Responsibilities

| Model | File | Responsibility |
|---|---|---|
| **Auth** | [Auth.js](file:///e:/Volunteer_SkillGap/backend/src/models/Auth.js) | Login, authentication, password hashing, and user roles (`admin`, `volunteer`, `coordinator`). |
| **Volunteer** | [Volunteer.js](file:///e:/Volunteer_SkillGap/backend/src/models/Volunteer.js) | Volunteer skills, proficiency levels (1–5), languages, mobility ratings, experience, and availability slots. |
| **Location** | [Location.js](file:///e:/Volunteer_SkillGap/backend/src/models/Location.js) | Service location details and operational requirements (tasks, skill thresholds, mandatory languages, mobility, shift schedules). |
| **SkillGap** | [SkillGap.js](file:///e:/Volunteer_SkillGap/backend/src/models/SkillGap.js) | Missing skills, staffing gaps, shortage counts, and unresolved coverage constraints with explanation reasons. |
| **Assignment** | [Assignment.js](file:///e:/Volunteer_SkillGap/backend/src/models/Assignment.js) | Proposed and confirmed volunteer assignments, match score, override audit information, and warnings. |

---

## 4. Constraint Matching Architecture

The deployment planner strictly separates a volunteer who *looks suitable* from one who is *actually eligible*:

### Hard Constraints (Mandatory for Eligibility)
Must be 100% satisfied for any valid assignment. If any hard constraint fails, the volunteer is disqualified:
- **Availability:** Volunteer must be completely free during the location's operational date and shift window without conflicting assignments.
- **Required Skills & Minimum Proficiency:** Volunteer must possess the required skill at or above the designated threshold (e.g., First-Aid level ≥ 3).
- **Mandatory Language Fluency:** Must meet the minimum language fluency level (e.g., FLUENT in Hindi/Spanish) if specified as mandatory for that task.
- **Mobility Requirements:** Volunteer's mobility rating must equal or exceed the location's minimum demand (e.g., HIGH mobility for field disaster response).
- **Staffing Headcount Limits:** Cannot over-allocate volunteers beyond task capacity.

### Soft Preferences (Ranking & Optimization)
Used to rank and prioritize candidates who have already passed all hard constraints:
- **Additional Experience:** Extra years of volunteer service.
- **Higher Proficiency:** Exceeding the minimum required proficiency score.
- **Preferred Languages:** Secondary or preferred languages that enhance service delivery.
- **Proximity / Travel Distance:** Shorter commute distance when geographical data is provided.

### Unresolved Constraints (Explainability Engine)
If a requirement cannot be fulfilled, the system does not simply report a shortfall—it explains **why** no valid candidate was eligible:
- *Example 1:* `"Shortage: 2 First-Aid Leads. Reason: 4 volunteers hold the skill but fail minimum proficiency threshold (level 2 < 3); 3 are unavailable during this shift."`
- *Example 2:* `"Shortage: 1 Hindi Translator. Reason: All 5 fluent speakers are already allocated to higher-priority emergency shifts."`

### Manual Override & Audit Policy
- A manual override **never silently converts an invalid assignment into a valid one**.
- When an authorized coordinator overrides a constraint, the system records:
  1. **Who** performed the override (`coordinatorId`).
  2. **Why** the override was applied (`overrideReason`).
  3. **Which constraint** was bypassed (`overriddenConstraint`).
- **Non-Overridable Constraints:** Safety-critical qualifications (e.g., medical licenses, child-safety clearances) cannot be overridden under any circumstances.

---

## 5. Recommended Backend Implementation Order

1. **Finalize Data Models:**
   - Standardize schemas and relationships across `Auth`, `Volunteer`, `Location`, `Assignment`, and `SkillGap`.
   - Ensure proper indexes, Mongoose validation, and cross-model references.
2. **Build Volunteer Profile APIs:**
   - Create, retrieve, and update volunteer profiles linked to existing JWT authentication.
   - Validate profile inputs (proficiency levels, languages, availability slots).
3. **Define Location & Operational Requirement APIs:**
   - Location management CRUD (name, address, date, shifts).
   - Structured requirement definition: task types, skills, proficiency thresholds, mandatory languages, mobility, and headcounts.
4. **Build Matching & Constraint Engine:**
   - Phase 1 filtering: eliminate volunteers failing hard constraints.
   - Phase 2 scoring: calculate weighted match scores for eligible candidates.
   - Phase 3 gap detection & explanation: log shortage counts and constraint conflict reasons.
5. **Build Deployment Planner & Override Service:**
   - Generate and persist proposed deployment runs.
   - Coordinator review workflows: approve, reject, or manually assign.
   - Audit trail logger for manual overrides (tracking coordinator, reason, bypassed rule).
6. **Generate Deployment Sheets & Reports:**
   - Aggregate assignments organized by location, shift timing, task, volunteer, and contact information.
   - Include clear summaries of unresolved skill gaps.
   - Export capability (JSON, Excel via ExcelJS, PDF via PDFKit).

---

## 6. Project Status & Progress

For detailed tracking of what has been implemented vs. what remains to be built, please refer to:
👉 **[STAGE.md](file:///e:/Volunteer_SkillGap/STAGE.md)**
