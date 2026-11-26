import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import PlannerTab from './planner/PlannerTab.jsx';
import LocationsTab from './locations/LocationsTab.jsx';
import VolunteersTab from './volunteers/VolunteersTab.jsx';
import ReportsTab from './reports/ReportsTab.jsx';
import AdminTab from './admin/AdminTab.jsx';
import VolunteerProfileTab from './volunteers/VolunteerProfileTab.jsx';
import DashboardLayout from './layout/DashboardLayout.jsx';
import MetricsCards from './overview/MetricsCards.jsx';
import OptimizationResults from './planner/OptimizationResults.jsx';
import CreateLocationModal from './locations/CreateLocationModal.jsx';
import { AuthContext } from '../../context/AuthContext';
import { getAllLocations, createLocation } from '../../api/locationApi';
import { getAllVolunteers, getMyProfile, updateMyProfile, createVolunteerProfile } from '../../api/volunteerApi';
import { previewMatching, generateDeploymentPlan, getDeploymentRuns, getLocationCandidates, assignVolunteer, assignBestCandidates } from '../../api/plannerApi';
import { exportExcel, exportPDF } from '../../api/reportApi';
import { getAllUsers, updateUserRole } from '../../api/authApi';




// ─── Helper: build tag pills from location DB data ────────────────────────────
function buildTags(loc) {
  const tags = [];
  const hasCritical = loc.requirements?.some((r) => r.isSafetyCritical);
  const tier = hasCritical ? 3 : loc.requirements?.length > 1 ? 2 : 1;
  tags.push({
    label: `Level: Tier ${tier}`,
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  });
  const langReq = loc.requirements?.find((r) => r.requiredLanguage)?.requiredLanguage;
  if (langReq) {
    tags.push({ label: `${langReq} Required`, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' });
  } else {
    tags.push({ label: 'No Lang. Req.', color: 'bg-slate-50 text-slate-600 border-slate-200' });
  }
  if (loc.requirements?.some((r) => r.minMobilityLevel === 'High' || r.minMobilityLevel === 'FULL')) {
    tags.push({ label: 'High Mobility', color: 'bg-amber-50 text-amber-700 border-amber-200' });
  }
  return tags;
}

// ─── Helper: map raw DB location → UI location object ────────────────────────
function mapDbLocation(l, coveragePct, hasAlert, alertMessage) {
  const initials = (l.name || '')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
  const totalRequired = l.totalRequired || (l.requirements || []).reduce((s, r) => s + (r.requiredCount || 1), 0) || 1;
  const assignedCount = l.assignedCount || 0;
  const actualCoverage = coveragePct !== undefined ? coveragePct : (l.coverage !== undefined ? l.coverage : (assignedCount > 0 ? Math.min(100, Math.round((assignedCount / totalRequired) * 100)) : 0));
  const isSiteFull = l.isSiteFull !== undefined ? l.isSiteFull : (assignedCount >= totalRequired);

  return {
    id: l._id || l.id,
    siteCode: l.siteCode || `${initials}-${String(l._id || '').slice(-3).toUpperCase()}`,
    name: l.name,
    city: l.city || l.address || '',
    date: l.date,
    shiftStart: l.shiftStart || '09:00',
    shiftEnd: l.shiftEnd || '17:00',
    assignedCount,
    totalRequired,
    coverage: actualCoverage,
    isSiteFull,
    hasAlert: hasAlert !== undefined ? hasAlert : (assignedCount < totalRequired),
    alertMessage: alertMessage || (assignedCount < totalRequired ? `Staffing needed: ${assignedCount}/${totalRequired} assigned.` : ''),
    tags: buildTags(l),
    requirements: l.requirements || [],
    status: l.status || 'UPCOMING',
    rawData: l,
  };
}

// ─── Helper: map backend-matched candidate → UI candidate object ──────────────
function mapMatchedCandidate(candidate, type) {
  const name = candidate.volunteerName || 'Unknown Volunteer';
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const matchPct = candidate.matchPercentage || 0;
  const matchScore = candidate.matchScore || matchPct;
  const scoreColor =
    matchScore >= 85 ? 'bg-[#10b981] text-white' :
      matchScore >= 70 ? 'bg-[#06b6d4] text-white' :
        matchScore >= 50 ? 'bg-[#3b82f6] text-white' :
          matchScore >= 35 ? 'bg-[#f59e0b] text-white' :
            'bg-[#ef4444] text-white';
  const matchedSkillNames = (candidate.matchingSkills || []).map((s) => s.skill.toUpperCase());
  const allSkillNames = (candidate.allSkills || []).map((s) => (s.skill || '').toUpperCase()).filter(Boolean);
  const exp = candidate.experienceYears || 0;
  return {
    id: candidate.volunteerId,
    name,
    title: `${matchedSkillNames[0] || allSkillNames[0] || 'Volunteer'} • ${exp}y Exp`,
    matchScore,
    matchPercentage: matchPct,
    scoreColor,
    initials,
    skills: matchedSkillNames.length > 0 ? matchedSkillNames : allSkillNames.slice(0, 3),
    status: candidate.isAlreadyAssigned ? 'assigned' : candidate.isDoubleBooked ? 'double_booked' : candidate.isAvailable ? 'available' : 'not_available',
    isAvailable: candidate.isAvailable,
    isAlreadyAssigned: candidate.isAlreadyAssigned,
    isDoubleBooked: candidate.isDoubleBooked,
    doubleBookedDetails: candidate.doubleBookedDetails,
    assignedTo: null,
    type,
    matchingSkills: candidate.matchingSkills || [],
    missingSkills: candidate.missingSkills || [],
    totalRequiredSkills: candidate.totalRequiredSkills || 0,
    scoreBreakdown: candidate.scoreBreakdown || {},
    experienceYears: exp,
    mobilityLevel: candidate.mobilityLevel || 'Medium',
    homeAddress: candidate.homeAddress || '',
    locationMatches: candidate.locationMatches !== false,
    timeMatches: candidate.timeMatches !== false,
    locationMismatchReason: candidate.locationMismatchReason || '',
    timeMismatchReason: candidate.timeMismatchReason || '',
    recommendationReason: candidate.recommendationReason || '',
    rawData: candidate,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function AuthenticatedView() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // ── Tab state — volunteers default to their portal ─────────────────────────
  const isVolunteerRole = user?.role === 'volunteer';
  const [activeTab, setActiveTab] = useState(isVolunteerRole ? 'my_portal' : 'planner');

  // ── Filter bar ────────────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState(() => new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }));
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [selectedShift, setSelectedShift] = useState('All Shifts');
  const [candidateFilter, setCandidateFilter] = useState('eligible');
  const [selectedLocationId, setSelectedLocationId] = useState(null);

  // ── Metrics ───────────────────────────────────────────────────────────────
  const [metrics, setMetrics] = useState({
    totalVolunteers: 0,
    staffingCoverage: 0,
    activeSkillGaps: 0,
    pendingReviews: 0,
  });

  // ── Data ──────────────────────────────────────────────────────────────────
  const [locations, setLocations] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [allVolunteers, setAllVolunteers] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [deploymentRuns, setDeploymentRuns] = useState([]);
  const [selectedReportRunId, setSelectedReportRunId] = useState('');
  const [exportingFormat, setExportingFormat] = useState('');
  const [loadingReportRuns, setLoadingReportRuns] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(true);

  // ── Volunteer profile ─────────────────────────────────────────────────────
  const [volunteerProfile, setVolunteerProfile] = useState({
    skills: [],
    languages: [],
    availability: [],
    mobilityLevel: 'Medium',
    experienceYears: 0,
    phone: '',
    homeAddress: '',
    deploymentStatus: 'AVAILABLE',
    assignments: [],
    matchedLocations: [],
  });
  const [newSkillInput, setNewSkillInput] = useState({ skill: '', proficiency: 3 });
  const [savingSkills, setSavingSkills] = useState(false);

  // ── Optimization engine ───────────────────────────────────────────────────
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // ── UI helpers ─────────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [newLocationForm, setNewLocationForm] = useState({
    name: '',
    address: '',
    city: '',
    date: new Date().toISOString().split('T')[0],
    shiftStart: '09:00',
    shiftEnd: '17:00',
    requiredSkills: 'Medical Advanced',
    requiredVolunteers: 4,
    tier: 'Tier 2',
  });

  // ── Role helpers ──────────────────────────────────────────────────────────
  const isAdmin = user?.role === 'admin';
  const isCoordinator = user?.role === 'coordinator' || isAdmin;
  const isVolunteer = user?.role === 'volunteer';

  // ── Main data-fetch effect ─────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      // 1 ── Locations
      try {
        setLoadingLocations(true);
        const locRes = await getAllLocations();
        const dbLocations = locRes?.data || [];
        if (isMounted) {
          const mapped = dbLocations.map((l) => mapDbLocation(l));
          setLocations(mapped);
        }
      } catch (err) {
        console.error('Failed to load locations:', err);
      } finally {
        if (isMounted) setLoadingLocations(false);
      }

      // 2 ── Volunteers: fetch ALL for Volunteers tab + count for metrics
      if (isAdmin || isCoordinator) {
        try {
          const volRes = await getAllVolunteers();
          const dbVols = volRes?.data || [];
          if (isMounted) {
            // Map all volunteers for the Volunteers tab display
            const mappedAll = dbVols.map((v, i) => {
              const volName = v.user?.fullName || `Volunteer ${i + 1}`;
              const volSkills = (v.skills || []).map((s) => (s.skill || s.skillName || '').toUpperCase()).filter(Boolean);
              const volLangs = (v.languages || []).map((l) => l.language || '').filter(Boolean);
              const exp = v.experienceYears || 0;
              const allTags = [...volSkills, ...volLangs].slice(0, 6);
              const score = Math.min(99, Math.max(60, 70 + (v.skills?.length || 0) * 5 + exp));
              const scoreColor = score >= 95 ? 'bg-[#10b981] text-white' : score >= 88 ? 'bg-[#06b6d4] text-white' : score >= 80 ? 'bg-[#3b82f6] text-white' : 'bg-[#f59e0b] text-white';
              return {
                id: v._id,
                name: volName,
                title: `${volSkills[0] || 'Trained Volunteer'} • ${exp}y Exp`,
                matchScore: score,
                scoreColor,
                initials: volName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
                skills: allTags.length > 0 ? allTags : ['VOLUNTEER'],
                status: 'available',
                rawData: v,
              };
            });
            setAllVolunteers(mappedAll);
            setMetrics((prev) => ({
              ...prev,
              totalVolunteers: dbVols.length,
              pendingReviews: dbVols.length,
            }));
          }
        } catch (err) {
          console.error('Failed to load volunteers:', err);
        }
        // Candidates are loaded per-location via loadCandidatesForLocation
        if (isMounted) setLoadingCandidates(false);
      } else {
        setLoadingCandidates(false);
      }

      // 3 ── Admin: users + deployment runs
      if (isAdmin) {
        try {
          setLoadingUsers(true);
          const usersRes = await getAllUsers();
          if (isMounted && usersRes?.data) setUsersList(usersRes.data);
        } catch (err) {
          console.error('Failed to load users:', err);
        } finally {
          if (isMounted) setLoadingUsers(false);
        }

        try {
          if (isMounted) setLoadingReportRuns(true);
          const runsRes = await getDeploymentRuns();
          if (isMounted && runsRes?.data) {
            setDeploymentRuns(runsRes.data);
            setSelectedReportRunId((current) => current || (runsRes.data[0]?._id || runsRes.data[0]?.id || ''));
          }
        } catch (err) {
          console.error('Failed to load deployment runs:', err);
        } finally {
          if (isMounted) setLoadingReportRuns(false);
        }
      }

      // 4 ── Volunteer: own profile
      if (isVolunteer) {
        try {
          const profRes = await getMyProfile();
          if (isMounted && profRes?.data) {
            // Map ALL profile fields including deploymentStatus, assignments, matchedLocations
            setVolunteerProfile({
              skills: profRes.data.skills || [],
              languages: profRes.data.languages || [],
              availability: profRes.data.availability || [],
              mobilityLevel: profRes.data.mobilityLevel || 'Medium',
              experienceYears: profRes.data.experienceYears || 0,
              phone: profRes.data.phone || '',
              homeAddress: profRes.data.homeAddress || '',
              deploymentStatus: profRes.data.deploymentStatus || 'AVAILABLE',
              assignments: profRes.data.assignments || [],
              matchedLocations: profRes.data.matchedLocations || [],
            });
          }
        } catch (_) { /* Ignore optional profile fetch failures. */ }
      }
    };

    load();

    return () => { isMounted = false; };
  }, [isAdmin, isCoordinator, isVolunteer]);

  // ── Load skill-matched candidates for a specific location ──────────────────
  const loadCandidatesForLocation = async (locationId) => {
    if (!locationId) {
      setCandidates([]);
      setSelectedLocationId(null);
      return;
    }
    setSelectedLocationId(locationId);
    setLoadingCandidates(true);
    try {
      const res = await getLocationCandidates(locationId);
      const data = res?.data;
      if (data) {
        const eligibleMapped = (data.eligible || []).map((c) => mapMatchedCandidate(c, 'eligible'));
        const suitableMapped = (data.potentiallySuitable || []).map((c) => mapMatchedCandidate(c, 'suitable'));
        const ineligibleMapped = (data.ineligible || []).map((c) => mapMatchedCandidate(c, 'ineligible'));
        setCandidates([...eligibleMapped, ...suitableMapped, ...ineligibleMapped]);

        // Sync location staffing metrics from backend
        if (data.assignedCount !== undefined) {
          setLocations((prev) =>
            prev.map((loc) =>
              loc.id === locationId
                ? {
                    ...loc,
                    assignedCount: data.assignedCount,
                    totalRequired: data.totalRequired || loc.totalRequired,
                    isSiteFull: data.isSiteFull,
                    coverage: data.assignedCount > 0 ? Math.min(100, Math.round((data.assignedCount / (data.totalRequired || 1)) * 100)) : 0,
                    hasAlert: !data.isSiteFull,
                  }
                : loc
            )
          );
        }
      } else {
        setCandidates([]);
      }
    } catch (err) {
      console.error('Failed to load candidates for location:', err);
      setCandidates([]);
    } finally {
      setLoadingCandidates(false);
    }
  };

  // ── Auto-select first upcoming location and load its candidates ────────────
  useEffect(() => {
    if (locations.length > 0 && !selectedLocationId) {
      const firstRealLoc =
        locations.find((l) => l.id && String(l.id).length === 24 && l.status !== 'COMPLETED') ||
        locations.find((l) => l.id && String(l.id).length === 24);
      if (firstRealLoc) {
        loadCandidatesForLocation(firstRealLoc.id);
      }
    }
  }, [locations.length]);

  // ── Auto-run optimization once locations are loaded ───────────────────────
  useEffect(() => {
    if (locations.length === 0 || !isCoordinator) return;
    const realIds = locations.map((l) => l.id).filter((id) => id && String(id).length === 24);
    if (realIds.length === 0) return;

    previewMatching(realIds)
      .then((res) => {
        const data = res?.data;
        if (!data) return;
        setOptimizationResult(data);
      })
      .catch(() => { });
  }, [locations.length, isCoordinator]);

  // ── Admin: Toggle coordinator ──────────────────────────────────────────────
  const handleToggleCoordinator = async (targetUser) => {
    const newRole = targetUser.role === 'coordinator' ? 'volunteer' : 'coordinator';
    try {
      await updateUserRole(targetUser._id, newRole);
      setUsersList((prev) => prev.map((u) => (u._id === targetUser._id ? { ...u, role: newRole } : u)));
      showToast(
        newRole === 'coordinator'
          ? `Promoted ${targetUser.fullName} to Coordinator!`
          : `Removed Coordinator role from ${targetUser.fullName}.`
      );
    } catch (e) {
      showToast(`Error updating role: ${e?.response?.data?.message || e.message}`, 'error');
    }
  };

  // ── Volunteer: skill management ───────────────────────────────────────────
  const handleAddSkill = () => {
    if (!newSkillInput.skill.trim()) return;
    setVolunteerProfile((prev) => ({
      ...prev,
      skills: [...prev.skills, { skill: newSkillInput.skill.trim(), proficiency: Number(newSkillInput.proficiency) }],
    }));
    setNewSkillInput({ skill: '', proficiency: 3 });
  };

  const handleRemoveSkill = (index) => {
    setVolunteerProfile((prev) => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));
  };

  const handleSaveVolunteerProfile = async () => {
    setSavingSkills(true);
    try {
      await updateMyProfile(volunteerProfile);
      showToast('Skills and profile saved to backend!');
      // Re-fetch enriched profile so deploymentStatus/assignments stay accurate
      try {
        const profRes = await getMyProfile();
        if (profRes?.data) {
          setVolunteerProfile({
            skills: profRes.data.skills || [],
            languages: profRes.data.languages || [],
            availability: profRes.data.availability || [],
            mobilityLevel: profRes.data.mobilityLevel || 'Medium',
            experienceYears: profRes.data.experienceYears || 0,
            phone: profRes.data.phone || '',
            homeAddress: profRes.data.homeAddress || '',
            deploymentStatus: profRes.data.deploymentStatus || 'AVAILABLE',
            assignments: profRes.data.assignments || [],
            matchedLocations: profRes.data.matchedLocations || [],
          });
        }
      } catch (_) {}
    } catch {
      try {
        await createVolunteerProfile(volunteerProfile);
        showToast('Volunteer profile created!');
      } catch (err2) {
        showToast(`Save failed: ${err2?.response?.data?.message || err2.message}`, 'error');
      }
    } finally {
      setSavingSkills(false);
    }
  };

  // ── Optimization: Update View ─────────────────────────────────────────────
  const handleUpdateView = async () => {
    setIsUpdating(true);
    setShowRecommendations(false);
    try {
      const locIds = locations.map((l) => l.id).filter((id) => id && String(id).length === 24);
      if (locIds.length === 0) {
        showToast('No valid locations to analyze. Please add locations first.');
        return;
      }

      const res = await previewMatching(locIds);
      const data = res?.data;

      if (data?.proposedAssignments) {
        // Update location coverage & alerts from real engine output
        setLocations((prev) =>
          prev.map((loc) => {
            const assigned = data.proposedAssignments.filter((a) => a.locationId === loc.id).length;
            const required = loc.requirements.reduce((s, r) => s + (r.requiredCount || 1), 0) || 1;
            const pct = Math.min(100, Math.round((assigned / required) * 100));
            const gaps = data.detectedSkillGaps?.filter((g) => g.locationId === loc.id) || [];
            const hasAlert = gaps.length > 0;
            const alertMsg = gaps.map((g) => `Critical shortage: ${g.requiredSkill}. Short ${g.shortage} volunteer(s).`).join(' ');
            return { ...loc, coverage: pct, hasAlert, alertMessage: alertMsg };
          })
        );

        // Update candidate statuses from real assignments
        setCandidates((prev) =>
          prev.map((c) => {
            const a = data.proposedAssignments.find((x) => x.volunteerId === c.id);
            if (a) return { ...c, status: 'assigned', assignedTo: a.locationId, matchScore: Math.round((a.matchScore || 0.8) * 100) };
            return { ...c, status: 'available', assignedTo: null };
          })
        );

        setOptimizationResult(data);
      }

      if (data?.stats) {
        setMetrics((prev) => ({
          ...prev,
          staffingCoverage: Math.round(data.stats.globalCoverageRate || prev.staffingCoverage),
          activeSkillGaps: data.stats.totalGaps ?? prev.activeSkillGaps,
          totalVolunteers: Math.max(prev.totalVolunteers, data.stats.totalAssigned || 0),
        }));
      }

      setShowRecommendations(true);
      showToast(`Optimization engine ran across ${locIds.length} site(s). Skill-gap analysis updated.`);

      // Refresh candidates if a location is selected
      if (selectedLocationId) {
        loadCandidatesForLocation(selectedLocationId);
      }
    } catch (e) {
      showToast(`Optimization error: ${e?.response?.data?.message || e.message}`, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // ── Manual assign candidate ────────────────────────────────────────────────
  const handleAssignCandidate = async (candidateId, locationId) => {
    const candidate = candidates.find((c) => c.id === candidateId);
    if (!candidate) return;

    // Verify candidate is eligible
    if (candidate.type !== 'eligible') {
      showToast('Cannot assign: volunteer does not meet all mandatory skill requirements.', 'error');
      return;
    }
    if (candidate.isDoubleBooked) {
      showToast(`Cannot assign: ${candidate.doubleBookedDetails || 'Volunteer has a conflicting deployment at another site.'}`, 'error');
      return;
    }
    if (candidate.isAlreadyAssigned) {
      showToast('Cannot assign: volunteer is already assigned to this location.', 'error');
      return;
    }

    // Check capacity
    const targetLoc = locations.find((l) => l.id === locationId);
    if (targetLoc && targetLoc.isSiteFull) {
      showToast(`Cannot assign: site is already at full capacity (${targetLoc.assignedCount}/${targetLoc.totalRequired} volunteers).`, 'error');
      return;
    }

    try {
      // 1. Call backend to persist assignment in MongoDB
      const res = await assignVolunteer({
        volunteerId: candidateId,
        locationId,
        requirementId: candidate.matchingSkills?.[0]?.requirementId || null,
        task: candidate.matchingSkills?.[0]?.skill || 'Disaster Response Support',
      });

      // 2. Update local UI state
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidateId
            ? { ...c, status: 'assigned', isAlreadyAssigned: true, assignedTo: locationId }
            : c
        )
      );

      setLocations((prev) =>
        prev.map((loc) => {
          if (loc.id !== locationId) return loc;
          const newAssigned = (loc.assignedCount || 0) + 1;
          const totalReq = loc.totalRequired || loc.requirements.reduce((s, r) => s + (r.requiredCount || 1), 0) || 1;
          const newCov = Math.min(100, Math.round((newAssigned / totalReq) * 100));
          const isFull = newAssigned >= totalReq;
          return {
            ...loc,
            assignedCount: newAssigned,
            coverage: newCov,
            isSiteFull: isFull,
            hasAlert: !isFull,
            alertMessage: isFull ? '' : `Staffing needed: ${newAssigned}/${totalReq} assigned.`,
          };
        })
      );

      setMetrics((prev) => ({
        ...prev,
        staffingCoverage: Math.min(100, prev.staffingCoverage + 5),
        activeSkillGaps: Math.max(0, prev.activeSkillGaps - 1),
      }));

      showToast(`Volunteer ${candidate.name} successfully assigned and saved to MongoDB!`);

      // 3. Refresh candidates from backend so updated DB state is reflected
      await loadCandidatesForLocation(locationId);

      // 4. Re-run optimization engine so skill gaps & stats reflect the new assignment
      try {
        const allLocIds = locations.map((l) => l.id).filter((id) => id && String(id).length === 24);
        if (allLocIds.length > 0) {
          const optRes = await previewMatching(allLocIds);
          const optData = optRes?.data;
          if (optData) {
            setOptimizationResult(optData);
            setShowRecommendations(true);
            // Also sync location coverage from real engine output
            if (optData.proposedAssignments) {
              setLocations((prev) =>
                prev.map((loc) => {
                  const assigned = optData.proposedAssignments.filter((a) => a.locationId === loc.id).length;
                  const required = loc.requirements.reduce((s, r) => s + (r.requiredCount || 1), 0) || 1;
                  const pct = Math.min(100, Math.round((assigned / required) * 100));
                  const gaps = (optData.detectedSkillGaps || []).filter((g) => g.locationId === loc.id);
                  return { ...loc, coverage: pct, hasAlert: gaps.length > 0 };
                })
              );
            }
            if (optData.stats) {
              setMetrics((prev) => ({
                ...prev,
                staffingCoverage: Math.round(optData.stats.globalCoverageRate || prev.staffingCoverage),
                activeSkillGaps: optData.stats.totalGaps ?? prev.activeSkillGaps,
              }));
            }
          }
        }
      } catch (_) { /* Non-fatal: optimization refresh failed silently */ }
    } catch (err) {
      console.error('Assignment error:', err);
      showToast(err?.response?.data?.message || 'Failed to assign candidate.', 'error');
    }
  };

  // ── Auto-assign candidate(s) with best matching percentage ─────────────────
  const handleAssignBestMatches = async (locationId) => {
    const locId = locationId || selectedLocationId || locations[0]?.id;
    if (!locId) return;

    try {
      const res = await assignBestCandidates(locId);
      showToast(res.message || 'Assigned candidate(s) with best matching percentage!');
      await loadCandidatesForLocation(locId);

      // Refresh locations from backend to get updated counts
      const locRes = await getAllLocations();
      if (locRes?.data) {
        setLocations(locRes.data.map((l) => mapDbLocation(l)));
      }

      // Re-run optimization engine so skill gaps & stats stay fresh
      try {
        const allLocIds = locations.map((l) => l.id).filter((id) => id && String(id).length === 24);
        if (allLocIds.length > 0) {
          const optRes = await previewMatching(allLocIds);
          const optData = optRes?.data;
          if (optData) {
            setOptimizationResult(optData);
            setShowRecommendations(true);
            if (optData.stats) {
              setMetrics((prev) => ({
                ...prev,
                staffingCoverage: Math.round(optData.stats.globalCoverageRate || prev.staffingCoverage),
                activeSkillGaps: optData.stats.totalGaps ?? prev.activeSkillGaps,
              }));
            }
          }
        }
      } catch (_) { /* Non-fatal */ }
    } catch (err) {
      console.error('Assign best matches error:', err);
      showToast(err?.response?.data?.message || 'Failed to auto-assign best candidates.', 'error');
    }
  };

  // ── Auto-resolve all skill gaps via backend deployment plan ───────────────
  const handleAutoFillSkillGap = async () => {
    try {
      const locIds = locations.map((l) => l.id).filter((id) => id && String(id).length === 24);
      if (locIds.length === 0) { showToast('No locations to generate plan for.'); return; }

      const res = await generateDeploymentPlan({
        locationIds: locIds,
        title: `Auto-Resolve Plan ${new Date().toLocaleDateString()}`,
        targetDate: new Date().toISOString(),
      });
      const run = res?.data;
      if (run) {
        setDeploymentRuns((prev) => [run, ...prev]);
        showToast('Deployment plan generated and saved to MongoDB!');
      }

      // Set all locations to fully staffed after confirmed plan
      setLocations((prev) => prev.map((loc) => ({ ...loc, coverage: 100, hasAlert: false, alertMessage: '' })));
      setMetrics((prev) => ({ ...prev, activeSkillGaps: 0, staffingCoverage: 100 }));
    } catch (e) {
      showToast(`Plan generation error: ${e?.response?.data?.message || e.message}`, 'error');
    }
  };

  // ── Create location ────────────────────────────────────────────────────────
  const handleCreateLocation = async (e) => {
    e.preventDefault();
    if (!newLocationForm.name) return;
    try {
      const created = await createLocation({
        name: newLocationForm.name,
        address: newLocationForm.address || newLocationForm.city || 'Community Center',
        city: newLocationForm.city || 'Unknown City',
        date: newLocationForm.date ? new Date(newLocationForm.date).toISOString() : new Date().toISOString(),
        shiftStart: newLocationForm.shiftStart || '09:00',
        shiftEnd: newLocationForm.shiftEnd || '17:00',
        requirements: [{
          task: 'Emergency Support',
          requiredSkill: newLocationForm.requiredSkills,
          requiredCount: newLocationForm.requiredVolunteers,
          isSafetyCritical: newLocationForm.tier === 'Tier 3',
          minProficiency: 3,
        }],
      });
      const newLoc = mapDbLocation(
        created?.data || { _id: Date.now().toString(), ...newLocationForm },
        0,
        true,
        `Need ${newLocationForm.requiredVolunteers} ${newLocationForm.requiredSkills} volunteer(s).`
      );
      setLocations((prev) => [newLoc, ...prev]);
      setIsLocationModalOpen(false);
      setNewLocationForm({
        name: '',
        address: '',
        city: '',
        date: new Date().toISOString().split('T')[0],
        shiftStart: '09:00',
        shiftEnd: '17:00',
        requiredSkills: 'Medical Advanced',
        requiredVolunteers: 4,
        tier: 'Tier 2',
      });
      showToast(`Location "${newLoc.name}" added!`);
    } catch (err) {
      showToast(`Failed to create location: ${err?.response?.data?.message || err.message}`, 'error');
    }
  };

  const handleExport = async (format) => {
    if (!selectedReportRunId) { showToast('Please select a saved deployment run first.', 'error'); return; }
    setExportingFormat(format);
    try {
      const blob = format === 'excel' ? await exportExcel(selectedReportRunId) : await exportPDF(selectedReportRunId);
      const fileUrl = window.URL.createObjectURL(blob instanceof Blob ? blob : new Blob([blob]));
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = `deployment-report-${selectedReportRunId}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(fileUrl);
      showToast(`${format.toUpperCase()} report downloaded successfully.`);
    } catch (err) {
      showToast(`Report export failed: ${err?.response?.data?.message || err.message}`, 'error');
    } finally { setExportingFormat(''); }
  };

  if (!user) return null;


  const dashboardProps = {
    allVolunteers, candidateFilter, candidates, deploymentRuns, handleAddSkill, handleAssignCandidate,
    handleRemoveSkill, handleSaveVolunteerProfile, handleToggleCoordinator, isCoordinator,
    loadingCandidates, loadingLocations, loadingUsers, locations, newSkillInput, savingSkills,
    setActiveTab, setCandidateFilter, setIsLocationModalOpen, setNewSkillInput, showToast,
    usersList, volunteerProfile, isAdmin, isVolunteer,
    selectedLocationId, setSelectedLocationId, loadCandidatesForLocation,
    handleAssignBestMatches,
  };
  const sidebarProps = { activeTab, setActiveTab, isAdmin, isCoordinator, isVolunteer, user, logout, navigate };
  const headerProps = { activeTab, user, isAdmin, isCoordinator, selectedDate, selectedRegion, setSelectedRegion, selectedShift, setSelectedShift, handleUpdateView, isUpdating };

  const selectedLocation = selectedLocationId
    ? locations.find((l) => l.id === selectedLocationId)
    : null;

  const activeMetrics = selectedLocation
    ? {
        totalVolunteers: candidates.filter((c) => c.type === 'eligible' || c.isAlreadyAssigned).length,
        staffingCoverage: selectedLocation.coverage ?? 0,
        activeSkillGaps: Math.max(0, (selectedLocation.totalRequired || 0) - (selectedLocation.assignedCount || 0)),
        pendingReviews: candidates.filter((c) => c.type === 'suitable').length,
      }
    : metrics;

  return (
    <DashboardLayout sidebarProps={sidebarProps} headerProps={headerProps} toast={toast}>
      <MetricsCards metrics={activeMetrics} />
      <OptimizationResults showRecommendations={showRecommendations} optimizationResult={optimizationResult} locations={locations} candidates={candidates} handleAutoFillSkillGap={handleAutoFillSkillGap} selectedLocationId={selectedLocationId} handleUpdateView={handleUpdateView} isUpdating={isUpdating} />
      {activeTab === 'planner' && <PlannerTab {...dashboardProps} />}
      {activeTab === 'admin' && <AdminTab {...dashboardProps} />}
      {activeTab === 'my_portal' && <VolunteerProfileTab {...dashboardProps} />}
      {activeTab === 'locations' && <LocationsTab {...dashboardProps} />}
      {activeTab === 'volunteers' && <VolunteersTab {...dashboardProps} />}
      {activeTab === 'reports' && <ReportsTab deploymentRuns={deploymentRuns} selectedRunId={selectedReportRunId} onRunChange={setSelectedReportRunId} onExport={handleExport} exportingFormat={exportingFormat} loadingRuns={loadingReportRuns} />}
      <CreateLocationModal isOpen={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} newLocationForm={newLocationForm} setNewLocationForm={setNewLocationForm} handleCreateLocation={handleCreateLocation} />
    </DashboardLayout>
  );
}
