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
| **Auth** | `src/models/Auth.js` | User credentials, password hashing (bcrypt), JWT generation, and roles (`admin`, `coordinator`, `volunteer`). |
| **Volunteer** | `src/models/Volunteer.js` | Volunteer profiles: multi-skill proficiency levels (1–5), languages with fluency levels, mobility ratings, experience, and availability slots. |
| **Location** | `src/models/Location.js` | Service locations, dates, shift hours, operational tasks, and granular requirement criteria (skills, languages, mobility, headcounts). |
| **SkillGap** | `src/models/SkillGap.js` | Unmet requirements per deployment run: required vs. assigned counts, shortages, and machine-generated explanations (reason codes). |
| **Assignment** | `src/models/Assignment.js` | Proposed and confirmed volunteer-to-location assignments, match scores, override flags, audit details, and constraint warnings. |

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

## 6. Architecture & Tech Stack

```
React / Next.js (Admin & Coordinator Dashboard, Volunteer Portal)
       │
       ▼
Node.js + Express 5 (REST APIs, Auth, Validation, Business Logic, Reports)
       │                              │
       ▼                              ▼
  MongoDB + Mongoose 9         Matching & Optimization Service
  (Atlas / Local)              (Hard constraint filtering, scoring,
                                gap detection & reason attribution)
```

| Layer | Technology | Purpose |
|---|---|---|
| **Runtime & Framework** | Node.js (v20+), Express 5 | Asynchronous REST API server (ES Modules) |
| **Database** | MongoDB with Mongoose 9 | Document storage with schema validation |
| **Authentication** | JWT, bcryptjs, cookie-parser | Role-based authentication (`admin`, `coordinator`, `volunteer`) |
| **Validation** | Zod | Schema validation for requests and data integrity |
| **Reporting** | ExcelJS, PDFKit | Deployment sheet and gap report exports |
| **Testing** | Jest, Supertest, mongodb-memory-server | Unit, API, and database test suites |

---

## 7. API Specification Overview

| Area | Method | Endpoint | Access | Status |
|---|---|---|---|---|
| **Health** | GET | `/` | Public | Implemented |
| **Auth** | POST | `/api/auth/register` | Public | Implemented |
| **Auth** | POST | `/api/auth/login` | Public | Implemented |
| **Auth** | POST | `/api/auth/refresh` | Public | Implemented |
| **Volunteer** | POST | `/api/volunteer/profile` | Protected (Volunteer) | Implemented |
| **Volunteer** | GET | `/api/volunteer/profile/me` | Protected (Volunteer) | Implemented |
| **Volunteer** | PUT | `/api/volunteer/profile/me` | Protected (Volunteer) | Implemented |
| **Volunteer** | DELETE | `/api/volunteer/profile/me` | Protected (Volunteer) | Implemented |
| **Volunteer** | GET | `/api/volunteer/all` | Protected (Admin/Coord) | Implemented |
| **Volunteer** | GET | `/api/volunteer/:id` | Protected (Admin/Coord) | Implemented |
| **Locations** | POST | `/api/locations` | Protected (Admin/Coord) | Implemented |
| **Locations** | GET | `/api/locations` | Protected | Implemented |
| **Locations** | GET | `/api/locations/:id` | Protected | Implemented |
| **Locations** | PUT | `/api/locations/:id` | Protected (Admin/Coord) | Implemented |
| **Locations** | DELETE | `/api/locations/:id` | Protected (Admin) | Implemented |
| **Requirements** | POST | `/api/locations/:id/requirements` | Protected (Admin/Coord) | Implemented |
| **Requirements** | PUT | `/api/locations/:id/requirements/:reqId` | Protected (Admin/Coord) | Implemented |
| **Requirements** | DELETE | `/api/locations/:id/requirements/:reqId` | Protected (Admin/Coord) | Implemented |
| **Matching** | POST | `/api/planner/match` | Protected (Admin/Coord) | Implemented |
| **Deployment** | POST | `/api/planner/generate` | Protected (Admin/Coord) | Implemented |
| **Deployment** | GET | `/api/planner/runs` | Protected (Admin/Coord) | Implemented |
| **Deployment** | GET | `/api/planner/runs/:runId` | Protected (Admin/Coord) | Implemented |
| **Deployment** | POST | `/api/planner/override` | Protected (Admin/Coord) | Implemented |
| **Deployment** | POST | `/api/planner/confirm/:runId` | Protected (Admin/Coord) | Implemented |
| **Deployment Sheet** | GET | `/api/reports/sheet/:runId` | Protected (Admin/Coord) | Implemented |
| **Reports** | GET | `/api/reports/export/excel/:runId` | Protected (Admin/Coord) | Implemented |
| **Reports** | GET | `/api/reports/export/pdf/:runId` | Protected (Admin/Coord) | Implemented |

---

## 8. Getting Started

### Prerequisites
- Node.js **v20 or higher**
- MongoDB (Local or Atlas connection URI)

### Installation
```bash
cd backend
npm install
```

### Environment Configuration
Create a `.env` file in the `backend/` directory:
```env
PORT=8081
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/volunteer_planner
JWT_SECRET=your_jwt_access_secret_key_here
JWT_EXPIRES_IN=60m
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

### Run Server
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

---

## 9. Progress Tracking

See the comprehensive implementation status in [STAGE.md](file:///e:/Volunteer_SkillGap/STAGE.md).