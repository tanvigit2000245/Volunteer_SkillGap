# Postman Testing Guide
## Volunteer Skill-Gap Deployment Planner

This guide explains how to import and run the **Postman Collection** covering all 24 backend APIs implemented across the project.

---

## 1. Quick Import into Postman

1. Open **Postman**.
2. Click the **Import** button in the top-left corner.
3. Select or drag-and-drop the file:
   👉 **[`Volunteer_Planner_Postman_Collection.json`](file:///e:/Volunteer_SkillGap/Volunteer_Planner_Postman_Collection.json)** (also located at [`backend/Volunteer_Planner_Postman_Collection.json`](file:///e:/Volunteer_SkillGap/backend/Volunteer_Planner_Postman_Collection.json)).
4. Click **Import**. You will see the collection named **"Volunteer Skill-Gap Deployment Planner"**.

---

## 2. Automated Token & ID Variables

The collection is pre-configured with collection variables and automated Postman test scripts. You **do not** need to manually copy-paste IDs or tokens:

| Variable | Description | Set Automatically By |
|---|---|---|
| `{{baseUrl}}` | Base server URL (defaults to `http://localhost:8080`) | Pre-configured |
| `{{accessToken}}` | Active JWT bearer token | `Login - As Coordinator` or `Login - As Volunteer` |
| `{{volunteerId}}` | Profile ID of the volunteer | `Create Profile (Self)` |
| `{{locationId}}` | Created service location ID | `Create Location with Requirements` |
| `{{requirementId}}`| First requirement subdocument ID | `Create Location with Requirements` |
| `{{runId}}` | Deployment planning run ID | `Generate Deployment Plan` |
| `{{assignmentId}}` | Proposed assignment ID | `Generate Deployment Plan` |

---

## 3. Recommended Step-by-Step Test Sequence

Follow this simple 6-step flow in Postman:

```
[1. Health Check] ──> [2. Register/Login] ──> [3. Create Volunteer Profile]
                                                        │
[6. Export Reports] <── [5. Generate & Override] <──────┴── [4. Create Location]
```

### Step 1: Health Check
- Run **`0. Health Check -> Check Server Status`**
- *Expected response:* `200 OK` with `{ "success": true, "message": "API is running..." }`

---

### Step 2: Authentication
1. Run **`1. Authentication -> Register - Coordinator (Admin)`**
   - Automatically saves coordinator's `{{accessToken}}`.
2. Run **`1. Authentication -> Register - Volunteer User`**
   - Creates a volunteer account (`rahul.volunteer@gmail.com`).
3. Run **`1. Authentication -> Login - As Volunteer`**
   - Switches `{{accessToken}}` to the volunteer.

---

### Step 3: Volunteer Profile
1. Run **`2. Volunteer Profiles -> Create Profile (Self)`**
   - Sends First-Aid Level 4 skill, Hindi fluent language, High mobility, and availability for `2026-11-15`.
   - Automatically saves `{{volunteerId}}`.
2. Run **`2. Volunteer Profiles -> Get My Profile`**
   - Confirms profile retrieval.
3. Switch back to Coordinator:
   - Run **`1. Authentication -> Login - As Coordinator`**
4. Run **`2. Volunteer Profiles -> List All Volunteers (Coordinator)`**
   - Tests search filters: `?skill=First-Aid&mobilityLevel=High`.

---

### Step 4: Service Locations & Requirements
1. Run **`3. Service Locations & Requirements -> Create Location with Requirements`**
   - Creates `"City Community Health Camp - East Wing"` scheduled for `2026-11-15` (09:00 - 17:00).
   - Includes tasks: `"Lead Emergency First-Aid"` and `"Safety & Medical Doctor Lead"`.
   - Automatically saves `{{locationId}}` and `{{requirementId}}`.
2. Run **`3. Service Locations & Requirements -> Get Location By ID`**
   - Inspects location requirements.
3. Run **`3. Service Locations & Requirements -> Add Requirement to Location`**
   - Appends `"Registration & Crowd Desk"`.

---

### Step 5: Constraint Matching & Deployment Planner
1. Run **`4. Deployment Planner & Matching -> Preview Constraint Matching (Dry Run)`**
   - Runs matching algorithm without saving to DB. Displays ranked candidates and detected skill gaps.
2. Run **`4. Deployment Planner & Matching -> Generate Deployment Plan`**
   - Executes matching, saves `DeploymentRun` (status: `PROPOSED`), inserts `Assignment` records, and records `SkillGap` shortages with reason codes.
   - Automatically saves `{{runId}}` and `{{assignmentId}}`.
3. Run **`4. Deployment Planner & Matching -> Get Deployment Plan By ID`**
   - Views assignments with match scores, and skill gaps with human-readable bottleneck explanations.
4. Run **`4. Deployment Planner & Matching -> Coordinator Manual Override`**
   - Overrides an assignment with coordinator audit tracking (`overrideReason: "Volunteer has verified offline certification..."`).
   - If attempting to override a safety-critical task, the server responds with `403 Forbidden`.
5. Run **`4. Deployment Planner & Matching -> Confirm Deployment Plan`**
   - Transitions run and assignments to `CONFIRMED`.

---

### Step 6: Deployment Sheet & Report Exports
1. Run **`5. Deployment Sheet & Reports -> Get Deployment Sheet (JSON)`**
   - Returns aggregated schedule grouped by location with volunteer phone numbers and gap alerts.
2. Run **`5. Deployment Sheet & Reports -> Export Deployment Sheet (Excel .xlsx)`**
   - In Postman, click the dropdown arrow next to **Send** and select **"Send and Download"**.
   - Saves `DeploymentSheet_<runId>.xlsx` containing 2 tabs:
     - Tab 1: *Deployment Roster*
     - Tab 2: *Unresolved Skill Gaps*
3. Run **`5. Deployment Sheet & Reports -> Export Deployment Sheet (PDF .pdf)`**
   - Click **"Send and Download"** in Postman.
   - Saves `DeploymentSheet_<runId>.pdf` with executive summary, assignments, gap alerts, and coordinator sign-off block.

---

## 4. Troubleshooting

- **Server Not Responding:** Ensure your dev server is active:
  ```bash
  cd backend
  npm run dev
  ```
- **Port Conflict:** If your server is running on port `8081` instead of `8080`, edit the collection variable `baseUrl` to `http://localhost:8081`.
- **401 Unauthorized:** Run `Login - As Coordinator` or `Login - As Volunteer` to refresh `{{accessToken}}`.
