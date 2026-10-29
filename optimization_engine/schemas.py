from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class VolunteerSkill(BaseModel):
    skill: str
    proficiency: int = Field(ge=1, le=5)

class VolunteerLanguage(BaseModel):
    language: str
    fluency: str = "CONVERSATIONAL"

class AvailabilitySlot(BaseModel):
    date: str
    startTime: str
    endTime: str

class VolunteerData(BaseModel):
    id: str
    fullName: Optional[str] = "Anonymous Volunteer"
    email: Optional[str] = ""
    phone: Optional[str] = ""
    skills: List[VolunteerSkill] = []
    languages: List[VolunteerLanguage] = []
    mobilityLevel: str = "Medium"
    experienceYears: int = 0
    availability: List[AvailabilitySlot] = []
    rating: Optional[float] = 5.0

class RequirementData(BaseModel):
    id: str
    task: str
    requiredSkill: str
    minProficiency: int = 1
    requiredLanguage: Optional[str] = None
    minLanguageFluency: Optional[str] = "CONVERSATIONAL"
    mobilityLevel: str = "Low"
    requiredCount: int = 1
    isSafetyCritical: bool = False

class LocationData(BaseModel):
    id: str
    name: str
    address: Optional[str] = ""
    city: Optional[str] = ""
    date: str
    shiftStart: str
    shiftEnd: str
    requirements: List[RequirementData] = []

class OptimizationRequest(BaseModel):
    locations: List[LocationData]
    volunteers: List[VolunteerData]

class ProposedAssignment(BaseModel):
    locationId: str
    requirementId: str
    volunteerId: str
    task: str
    matchScore: float
    scoreBreakdown: Dict[str, Any] = {}
    volunteerDetails: Optional[Dict[str, Any]] = None

class GapMetrics(BaseModel):
    totalVolunteers: int = 0
    noSkillCount: int = 0
    belowProficiencyCount: int = 0
    missingLanguageCount: int = 0
    mobilityDeficitCount: int = 0
    shiftUnavailableCount: int = 0
    alreadyAssignedCount: int = 0

class GapExplanation(BaseModel):
    reasonCodes: List[str] = []
    description: str = ""
    metrics: GapMetrics = GapMetrics()

class DetectedSkillGap(BaseModel):
    locationId: str
    requirementId: str
    task: str
    requiredSkill: str
    requiredLanguage: Optional[str] = None
    required: int
    assigned: int
    shortage: int
    explanation: GapExplanation

class OptimizationStats(BaseModel):
    totalVolunteersPool: int
    totalRequiredSlots: int
    totalAssigned: int
    totalGaps: int
    globalCoverageRate: float
    averageMatchScore: float
    computationTimeMs: float

class OptimizationResponse(BaseModel):
    status: str
    solver: str
    objectiveValue: float
    proposedAssignments: List[ProposedAssignment]
    detectedSkillGaps: List[DetectedSkillGap]
    stats: OptimizationStats

