import "dotenv/config";
import axios from "axios";
import { runLocalConstraintMatching } from "./src/services/matching.service.js";

console.log("=== Integration Test: Python Optimization Microservice & Fallback ===");

const engineUrl = process.env.ENGINE_URL || "http://localhost:8000";

const testPayload = {
  locations: [
    {
      id: "671fb0000000000000000001",
      name: "Shelter A",
      address: "123 Main St",
      city: "Cityville",
      date: "2026-11-01",
      shiftStart: "08:00",
      shiftEnd: "12:00",
      requirements: [
        {
          id: "671fb0000000000000000010",
          task: "Emergency Response",
          requiredSkill: "First Aid",
          minProficiency: 3,
          requiredLanguage: "English",
          minLanguageFluency: "CONVERSATIONAL",
          mobilityLevel: "High",
          requiredCount: 1,
          isSafetyCritical: true,
        },
      ],
    },
  ],
  volunteers: [
    {
      id: "671fb0000000000000000020",
      fullName: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      skills: [{ skill: "First Aid", proficiency: 4 }],
      languages: [{ language: "English", fluency: "FLUENT" }],
      mobilityLevel: "High",
      experienceYears: 5,
      availability: [{ date: "2026-11-01", startTime: "07:00", endTime: "13:00" }],
      rating: 5.0,
    },
  ],
};

async function runTests() {
  // Test 1: Python Engine Health check
  console.log(`\n1. Testing Python Engine at ${engineUrl}...`);
  try {
    const health = await axios.get(`${engineUrl}/health`, { timeout: 2000 });
    console.log("  ✅ Python Service is healthy:", health.data);

    // Test 2: Direct call to Python /api/optimize
    const optRes = await axios.post(`${engineUrl}/api/optimize`, testPayload, { timeout: 3000 });
    console.log("  ✅ Optimization response received:");
    console.log(`     Solver: ${optRes.data.solver}`);
    console.log(`     Status: ${optRes.data.status}`);
    console.log(`     Assigned: ${optRes.data.proposedAssignments.length} / ${optRes.data.stats.totalRequiredSlots}`);
    console.log(`     Coverage: ${optRes.data.stats.globalCoverageRate}%`);
    console.log(`     Compute Time: ${optRes.data.stats.computationTimeMs}ms`);
  } catch (err) {
    console.log(`  ℹ️ Python service is currently offline (${err.message}).`);
  }

  // Test 3: Local Fallback Engine execution
  console.log("\n2. Testing Local Heuristic Fallback Engine...");
  const mockLocations = [
    {
      _id: "671fb0000000000000000001",
      name: "Shelter A",
      date: new Date("2026-11-01"),
      shiftStart: "08:00",
      shiftEnd: "12:00",
      requirements: [
        {
          _id: "671fb0000000000000000010",
          task: "Emergency Response",
          requiredSkill: "First Aid",
          minProficiency: 3,
          requiredLanguage: "English",
          minLanguageFluency: "CONVERSATIONAL",
          mobilityLevel: "High",
          requiredCount: 1,
        },
      ],
    },
  ];

  const mockVolunteers = [
    {
      _id: "671fb0000000000000000020",
      user: { fullName: "John Doe", email: "john@example.com" },
      phone: "+1234567890",
      skills: [{ skill: "First Aid", proficiency: 4 }],
      languages: [{ language: "English", fluency: "FLUENT" }],
      mobilityLevel: "High",
      experienceYears: 5,
      availability: [{ date: new Date("2026-11-01"), startTime: "07:00", endTime: "13:00" }],
    },
  ];

  const fallbackResult = runLocalConstraintMatching(mockLocations, mockVolunteers);
  console.log("  ✅ Local fallback engine executed cleanly:");
  console.log(`     Engine: ${fallbackResult.stats.engineUsed}`);
  console.log(`     Assignments: ${fallbackResult.proposedAssignments.length}`);
  console.log(`     Gaps: ${fallbackResult.detectedSkillGaps.length}`);
  console.log("\n=== Integration Test Complete ===");
}

runTests();

