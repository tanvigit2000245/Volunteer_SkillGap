import unittest
from schemas import (
    OptimizationRequest,
    LocationData,
    RequirementData,
    VolunteerData,
    VolunteerSkill,
    VolunteerLanguage,
    AvailabilitySlot,
)
from solver import solve_global_assignment

class TestVolunteerOptimizationSolver(unittest.TestCase):
    def setUp(self):
        self.sample_date = "2026-11-01"
        self.sample_shift_start = "09:00"
        self.sample_shift_end = "13:00"

    def test_perfect_matching_scenario(self):
        """Test case where volunteers perfectly satisfy all requirements."""
        req = RequirementData(
            id="req-1",
            task="First-Aid Responder",
            requiredSkill="First Aid",
            minProficiency=3,
            requiredLanguage="English",
            minLanguageFluency="CONVERSATIONAL",
            mobilityLevel="Medium",
            requiredCount=1,
        )
        loc = LocationData(
            id="loc-1",
            name="Downtown Relief Center",
            date=self.sample_date,
            shiftStart=self.sample_shift_start,
            shiftEnd=self.sample_shift_end,
            requirements=[req],
        )
        vol = VolunteerData(
            id="vol-1",
            fullName="Alice Smith",
            skills=[VolunteerSkill(skill="First Aid", proficiency=4)],
            languages=[VolunteerLanguage(language="English", fluency="FLUENT")],
            mobilityLevel="High",
            experienceYears=3,
            availability=[
                AvailabilitySlot(
                    date=self.sample_date,
                    startTime="08:00",
                    endTime="14:00",
                )
            ],
        )

        request = OptimizationRequest(locations=[loc], volunteers=[vol])
        response = solve_global_assignment(request)

        self.assertEqual(len(response.proposedAssignments), 1)
        self.assertEqual(response.proposedAssignments[0].volunteerId, "vol-1")
        self.assertEqual(len(response.detectedSkillGaps), 0)
        self.assertEqual(response.stats.globalCoverageRate, 100.0)
        self.assertGreater(response.proposedAssignments[0].matchScore, 70.0)

    def test_global_milp_avoids_greedy_starvation(self):
        """
        Critical test:
        Volunteer A is qualified for BOTH Task 1 (score 95) and Task 2 (score 90).
        Volunteer B is ONLY qualified for Task 1 (score 80).
        A naive greedy algorithm might assign Volunteer A to Task 1 first, leaving Task 2 empty (50% coverage).
        A global MILP solver assigns B -> Task 1 and A -> Task 2 to achieve 100% coverage!
        """
        req1 = RequirementData(
            id="req-1",
            task="General Support",
            requiredSkill="Crowd Management",
            minProficiency=2,
            requiredCount=1,
        )
        req2 = RequirementData(
            id="req-2",
            task="Specialized Medical Triage",
            requiredSkill="Medical Triage",
            minProficiency=4,
            requiredCount=1,
        )
        loc = LocationData(
            id="loc-1",
            name="Emergency Field Station",
            date=self.sample_date,
            shiftStart="09:00",
            shiftEnd="13:00",
            requirements=[req1, req2],
        )

        # Vol A: holds both skills
        vol_a = VolunteerData(
            id="vol-A",
            fullName="Dr. Alicia",
            skills=[
                VolunteerSkill(skill="Crowd Management", proficiency=5),
                VolunteerSkill(skill="Medical Triage", proficiency=5),
            ],
            mobilityLevel="High",
            availability=[AvailabilitySlot(date=self.sample_date, startTime="08:00", endTime="14:00")],
        )

        # Vol B: holds only Crowd Management
        vol_b = VolunteerData(
            id="vol-B",
            fullName="Bob Supporter",
            skills=[
                VolunteerSkill(skill="Crowd Management", proficiency=3),
            ],
            mobilityLevel="Medium",
            availability=[AvailabilitySlot(date=self.sample_date, startTime="08:00", endTime="14:00")],
        )

        request = OptimizationRequest(locations=[loc], volunteers=[vol_a, vol_b])
        response = solve_global_assignment(request)

        # Verify that BOTH requirements are fulfilled (100% coverage)
        self.assertEqual(len(response.proposedAssignments), 2)
        self.assertEqual(len(response.detectedSkillGaps), 0)
        self.assertEqual(response.stats.globalCoverageRate, 100.0)

        # Check exact assignments: Vol A must be on Medical Triage, Vol B on Crowd Management
        assigned_map = {a.task: a.volunteerId for a in response.proposedAssignments}
        self.assertEqual(assigned_map["Specialized Medical Triage"], "vol-A")
        self.assertEqual(assigned_map["General Support"], "vol-B")

    def test_skill_gap_explainability_attribution(self):
        """Test detection and attribution of missing skills and bottlenecks."""
        req = RequirementData(
            id="req-hard",
            task="Pediatric Care",
            requiredSkill="Pediatrics",
            minProficiency=4,
            requiredLanguage="Spanish",
            minLanguageFluency="FLUENT",
            mobilityLevel="High",
            requiredCount=2,
        )
        loc = LocationData(
            id="loc-2",
            name="Shelter Zone B",
            date=self.sample_date,
            shiftStart="10:00",
            shiftEnd="14:00",
            requirements=[req],
        )

        # Vol 1: has Pediatrics but proficiency 2 (< 4)
        vol_underqualified = VolunteerData(
            id="vol-under",
            fullName="Underqualified Nurse",
            skills=[VolunteerSkill(skill="Pediatrics", proficiency=2)],
            languages=[VolunteerLanguage(language="Spanish", fluency="FLUENT")],
            mobilityLevel="High",
            availability=[AvailabilitySlot(date=self.sample_date, startTime="09:00", endTime="15:00")],
        )

        # Vol 2: has Pediatrics level 4, but unavailable time
        vol_conflicted = VolunteerData(
            id="vol-busy",
            fullName="Busy Doctor",
            skills=[VolunteerSkill(skill="Pediatrics", proficiency=5)],
            languages=[VolunteerLanguage(language="Spanish", fluency="FLUENT")],
            mobilityLevel="High",
            availability=[AvailabilitySlot(date=self.sample_date, startTime="15:00", endTime="20:00")],
        )

        request = OptimizationRequest(locations=[loc], volunteers=[vol_underqualified, vol_conflicted])
        response = solve_global_assignment(request)

        # Both slots should result in gaps
        self.assertEqual(len(response.proposedAssignments), 0)
        self.assertEqual(len(response.detectedSkillGaps), 1)

        gap = response.detectedSkillGaps[0]
        self.assertEqual(gap.shortage, 2)
        self.assertIn("BELOW_MINIMUM_PROFICIENCY", gap.explanation.reasonCodes)
        self.assertIn("AVAILABILITY_SHIFT_CONFLICT", gap.explanation.reasonCodes)
        self.assertEqual(gap.explanation.metrics.belowProficiencyCount, 1)
        self.assertEqual(gap.explanation.metrics.shiftUnavailableCount, 1)

    def test_fastapi_endpoints(self):
        """Test FastAPI endpoint handlers directly."""
        from main import root, health_check, optimize_deployment
        from schemas import OptimizationRequest, LocationData, RequirementData, VolunteerData, VolunteerSkill, AvailabilitySlot

        res_root = root()
        self.assertEqual(res_root["status"], "online")

        res_health = health_check()
        self.assertEqual(res_health["status"], "healthy")

        req = OptimizationRequest(
            locations=[
                LocationData(
                    id="loc-test",
                    name="Test Site",
                    date="2026-11-01",
                    shiftStart="09:00",
                    shiftEnd="12:00",
                    requirements=[
                        RequirementData(
                            id="req-t",
                            task="Test Task",
                            requiredSkill="Logistics",
                            minProficiency=2,
                            mobilityLevel="Low",
                            requiredCount=1,
                        )
                    ],
                )
            ],
            volunteers=[
                VolunteerData(
                    id="vol-t",
                    fullName="Tester",
                    skills=[VolunteerSkill(skill="Logistics", proficiency=3)],
                    mobilityLevel="Low",
                    availability=[
                        AvailabilitySlot(date="2026-11-01", startTime="08:00", endTime="13:00")
                    ],
                )
            ],
        )

        res_opt = optimize_deployment(req)
        self.assertEqual(len(res_opt.proposedAssignments), 1)
        self.assertEqual(res_opt.status, "OPTIMAL")
        self.assertEqual(res_opt.solver, "HIGHS_MILP")


if __name__ == "__main__":
    unittest.main()

