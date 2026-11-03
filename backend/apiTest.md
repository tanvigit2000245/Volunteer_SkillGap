Global Configuration
Base URL: http://localhost:8080 (or http://localhost:8081 if port shifted)
Headers:
http
Content-Type: application/json
Authorization: Bearer <ACCESS_TOKEN>
1. Authentication APIs
1.1 Register Coordinator / Admin
Method & URL: POST /api/auth/register
Request Body:
json
{
  "fullName": "Dr. Sarah Mitchell",
  "email": "sarah.coordinator@example.com",
  "password": "Password123!",
  "role": "coordinator"
}
1.2 Register Volunteer
Method & URL: POST /api/auth/register
Request Body:
json
{
  "fullName": "Rahul Sharma",
  "email": "rahul.volunteer@example.com",
  "password": "Password123!",
  "role": "volunteer"
}
1.3 Login (Generates Bearer Token)
Method & URL: POST /api/auth/login
Request Body:
json
{
  "email": "sarah.coordinator@example.com",
  "password": "Password123!"
}

(Copy the accessToken from response to use in the Authorization: Bearer <token> header).

1.4 Refresh Access Token
Method & URL: POST /api/auth/refresh
Uses httpOnly cookie refreshToken automatically sent by browser/Postman.
2. Volunteer Profiles (CRUD Operations)
2.1 CREATE: Create Self Profile
Method & URL: POST /api/volunteer/profile
Auth: Volunteer Bearer Token
Request Body:
json
{
  "phone": "+91-9876543210",
  "mobilityLevel": "High",
  "experienceYears": 3,
  "skills": [
    { "skillName": "First-Aid", "proficiency": 4 },
    { "skillName": "Emergency Response", "proficiency": 3 },
    { "skillName": "Triage", "proficiency": 2 }
  ],
  "languages": [
    { "language": "Hindi", "proficiency": "FLUENT" },
    { "language": "English", "proficiency": "CONVERSATIONAL" }
  ],
  "availability": [
    {
      "date": "2026-11-15T00:00:00.000Z",
      "startTime": "08:00",
      "endTime": "18:00"
    }
  ]
}
2.2 READ: Get My Profile
Method & URL: GET /api/volunteer/profile/me
Auth: Volunteer Bearer Token
2.3 UPDATE: Update My Profile
Method & URL: PUT /api/volunteer/profile/me
Auth: Volunteer Bearer Token
Request Body:
json
{
  "phone": "+91-9876500000",
  "mobilityLevel": "High",
  "experienceYears": 4,
  "skills": [
    { "skillName": "First-Aid", "proficiency": 5 },
    { "skillName": "Emergency Response", "proficiency": 4 },
    { "skillName": "Doctor Consultation", "proficiency": 4 }
  ],
  "languages": [
    { "language": "Hindi", "proficiency": "FLUENT" },
    { "language": "English", "proficiency": "FLUENT" }
  ],
  "availability": [
    {
      "date": "2026-11-15T00:00:00.000Z",
      "startTime": "08:00",
      "endTime": "18:00"
    }
  ]
}
2.4 DELETE: Delete My Profile
Method & URL: DELETE /api/volunteer/profile/me
Auth: Volunteer Bearer Token
2.5 READ ALL: Volunteer Directory (Filterable)
Method & URL: GET /api/volunteer/all?skill=First-Aid&mobilityLevel=High&page=1&limit=10
Auth: Coordinator / Admin Bearer Token
2.6 READ ONE: Get Volunteer by ID
Method & URL: GET /api/volunteer/:id
Auth: Coordinator / Admin Bearer Token
3. Service Locations & Requirements (CRUD Operations)
3.1 CREATE: Create Location with Initial Requirements
Method & URL: POST /api/locations
Auth: Coordinator / Admin Bearer Token
Request Body:
json
{
  "name": "City Community Health Camp - East Wing",
  "address": "Community Center Sector 4, New Delhi",
  "date": "2026-11-15T00:00:00.000Z",
  "shiftStart": "09:00",
  "shiftEnd": "17:00",
  "status": "UPCOMING",
  "requirements": [
    {
      "task": "Lead Emergency First-Aid",
      "requiredSkill": "First-Aid",
      "minProficiency": 3,
      "minLanguageFluency": "CONVERSATIONAL",
      "minMobilityLevel": "Medium",
      "requiredCount": 2,
      "isCritical": false
    },
    {
      "task": "Safety & Medical Doctor Lead",
      "requiredSkill": "Doctor Consultation",
      "minProficiency": 4,
      "minLanguageFluency": "FLUENT",
      "minMobilityLevel": "Low",
      "requiredCount": 1,
      "isCritical": true
    }
  ]
}
3.2 READ ALL: List Locations
Method & URL: GET /api/locations?status=UPCOMING&page=1&limit=10
Auth: Any authenticated user
3.3 READ ONE: Get Location by ID
Method & URL: GET /api/locations/:id
Auth: Any authenticated user
3.4 UPDATE: Update Location Details
Method & URL: PUT /api/locations/:id
Auth: Coordinator / Admin Bearer Token
Request Body:
json
{
  "name": "City Community Health Camp - East Wing (Updated)",
  "shiftStart": "08:30",
  "shiftEnd": "17:30",
  "status": "UPCOMING"
}
3.5 SUB-CRUD: Add Requirement to Location
Method & URL: POST /api/locations/:id/requirements
Auth: Coordinator / Admin Bearer Token
Request Body:
json
{
  "task": "Registration & Crowd Desk",
  "requiredSkill": "Customer Service",
  "minProficiency": 2,
  "minLanguageFluency": "FLUENT",
  "minMobilityLevel": "Low",
  "requiredCount": 2,
  "isCritical": false
}
3.6 SUB-CRUD: Update Requirement inside Location
Method & URL: PUT /api/locations/:id/requirements/:reqId
Auth: Coordinator / Admin Bearer Token
Request Body:
json
{
  "minProficiency": 4,
  "requiredCount": 3
}
3.7 SUB-CRUD: Delete Requirement from Location
Method & URL: DELETE /api/locations/:id/requirements/:reqId
Auth: Coordinator / Admin Bearer Token
3.8 DELETE: Delete Location
Method & URL: DELETE /api/locations/:id
Auth: Admin Bearer Token
4. Constraint Matching & Deployment Planner
4.1 Preview Matching (Dry Run - No DB write)
Method & URL: POST /api/planner/match
Auth: Coordinator / Admin Bearer Token
Request Body:
json
{
  "locationIds": ["<PASTE_LOCATION_ID_HERE>"]
}
4.2 Generate Deployment Plan (Saves Run, Assignments & Gaps)
Method & URL: POST /api/planner/generate
Auth: Coordinator / Admin Bearer Token
Request Body:
json
{
  "title": "East Wing Health Drive - Wave 1",
  "targetDate": "2026-11-15T00:00:00.000Z",
  "locationIds": ["<PASTE_LOCATION_ID_HERE>"]
}
4.3 List All Deployment Runs
Method & URL: GET /api/planner/runs
Auth: Coordinator / Admin Bearer Token
4.4 Get Deployment Plan by Run ID
Method & URL: GET /api/planner/runs/:runId
Auth: Coordinator / Admin Bearer Token
4.5 Coordinator Manual Override (With Audit Trail)
Method & URL: POST /api/planner/override
Auth: Coordinator / Admin Bearer Token
Request Body:
json
{
  "runId": "<PASTE_RUN_ID_HERE>",
  "assignmentId": "<PASTE_ASSIGNMENT_ID_HERE>",
  "newVolunteerId": "<PASTE_VOLUNTEER_ID_HERE>",
  "overrideReason": "Volunteer has verified offline triage certification.",
  "overriddenConstraint": "minProficiency"
}
4.6 Confirm Deployment Plan
Method & URL: POST /api/planner/confirm/:runId
Auth: Coordinator / Admin Bearer Token
5. Reports & Export APIs
5.1 Get Deployment Sheet (JSON)
Method & URL: GET /api/reports/sheet/:runId
Auth: Coordinator / Admin Bearer Token
5.2 Export Deployment Sheet (Excel .xlsx)
Method & URL: GET /api/reports/export/excel/:runId
Auth: Coordinator / Admin Bearer Token
In Postman, click Send and Download to receive the .xlsx file.
5.3 Export Deployment Sheet (PDF .pdf)
Method & URL: GET /api/reports/export/pdf/:runId
Auth: Coordinator / Admin Bearer Token
In Postman, click Send and Download to receive the .pdf file.
Recommended Testing Order
text
1. POST /api/auth/register (Create Coordinator & Volunteer)
2. POST /api/auth/login (Obtain Bearer token)
3. POST /api/volunteer/profile (Setup volunteer skills & availability)
4. POST /api/locations (Create location with requirement slots)
5. POST /api/planner/generate (Run matching engine -> produces assignments & gaps)
6. POST /api/planner/override (Test audit override)
7. POST /api/planner/confirm/:runId (Finalize plan)
8. GET  /api/reports/sheet/:runId & /export/pdf/:runId (Verify exports)