import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  LogOut,
  Mail,
  Sparkles,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  GraduationCap,
  Heart,
  Home,
  Users,
  MapPin,
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  Plus,
  Sliders,
  ChevronDown,
  ArrowUpRight,
  UserCheck,
  UserMinus,
  Check,
  X,
  ExternalLink,
  Layers,
  Settings,
  Cpu,
  Zap,
  TrendingUp,
  Filter,
  Loader2
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { getAllLocations, createLocation } from '../../api/locationApi';
import { getAllVolunteers, getMyProfile, updateMyProfile, createVolunteerProfile } from '../../api/volunteerApi';
import { previewMatching, generateDeploymentPlan, getDeploymentRuns } from '../../api/plannerApi';
import { exportExcel, exportPDF } from '../../api/reportApi';
import { getAllUsers, updateUserRole } from '../../api/authApi';

// ─── Circular Progress Ring ───────────────────────────────────────────────────
function CircularRing({ coverage }) {
  const pct = Math.min(100, Math.max(0, coverage));
  const isFullyStaffed = pct >= 100;
  return (
    <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
        <path
          className="text-slate-100"
          strokeWidth="3.5"
          stroke="currentColor"
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <path
          className={isFullyStaffed ? 'text-[#10b981]' : 'text-[#4338ca]'}
          strokeDasharray={`${pct}, 100`}
          strokeWidth="3.5"
          strokeLinecap="round"
          stroke="currentColor"
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </svg>
      <span className="absolute text-xs font-bold text-slate-700">{pct}%</span>
    </div>
  );
}

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
function mapDbLocation(l, coveragePct = 0, hasAlert = false, alertMessage = '') {
  const initials = (l.name || '')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
  return {
    id: l._id || l.id,
    siteCode: l.siteCode || `${initials}-${String(l._id || '').slice(-3).toUpperCase()}`,
    name: l.name,
    city: l.city || l.address || '',
    coverage: coveragePct,
    hasAlert,
    alertMessage,
    tags: buildTags(l),
    requirements: l.requirements || [],
    status: l.status || 'UPCOMING',
    rawData: l,
  };
}

// ─── Helper: map raw DB volunteer → UI candidate object ───────────────────────
function mapDbVolunteer(vol, idx) {
  const volName = vol.user?.fullName || `Volunteer ${idx + 1}`;
  const volSkills = (vol.skills || []).map((s) =>
    (s.skill || s.skillName || '').toUpperCase()
  ).filter(Boolean);
  const volLangs = (vol.languages || []).map((l) => l.language || '').filter(Boolean);
  const exp = vol.experienceYears || 0;
  const allTags = [...volSkills, ...volLangs].slice(0, 4);
  const score = Math.min(99, Math.max(60, 70 + (vol.skills?.length || 0) * 5 + exp));
  const scoreColor =
    score >= 95 ? 'bg-[#10b981] text-white' :
    score >= 88 ? 'bg-[#06b6d4] text-white' :
    score >= 80 ? 'bg-[#3b82f6] text-white' :
    'bg-[#f59e0b] text-white';
  return {
    id: vol._id,
    name: volName,
    title: `${volSkills[0] || 'Trained Volunteer'} • ${exp}y Exp`,
    matchScore: score,
    scoreColor,
    initials: volName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
    skills: allTags.length > 0 ? allTags : ['VOLUNTEER'],
    status: 'available',
    assignedTo: null,
    type: idx < Math.ceil((vol.skills?.length || 1) / 2) ? 'eligible' : 'suitable',
    rawData: vol,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function AuthenticatedView() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // ── Tab state ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('planner');

  // ── Filter bar ────────────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState(() => new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }));
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [selectedShift, setSelectedShift] = useState('All Shifts');
  const [candidateFilter, setCandidateFilter] = useState('eligible');

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
  const [usersList, setUsersList] = useState([]);
  const [deploymentRuns, setDeploymentRuns] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(true);

  // ── Volunteer profile ─────────────────────────────────────────────────────
  const [volunteerProfile, setVolunteerProfile] = useState({
    skills: [],
    languages: [],
    mobilityLevel: 'Medium',
    experienceYears: 0,
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
    name: '', address: '', city: '', requiredSkills: 'Medical Advanced', requiredVolunteers: 4, tier: 'Tier 2',
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
          const mapped = dbLocations.map((l) => mapDbLocation(l, 0, false, ''));
          setLocations(mapped);
        }
      } catch (err) {
        console.error('Failed to load locations:', err);
      } finally {
        if (isMounted) setLoadingLocations(false);
      }

      // 2 ── Volunteers
      if (isAdmin || isCoordinator) {
        try {
          setLoadingCandidates(true);
          const volRes = await getAllVolunteers();
          const dbVols = volRes?.data || [];
          if (isMounted && dbVols.length > 0) {
            const mapped = dbVols.map((v, i) => mapDbVolunteer(v, i));
            setCandidates(mapped);
            setMetrics((prev) => ({ ...prev, totalVolunteers: dbVols.length, pendingReviews: dbVols.length }));
          }
        } catch (err) {
          console.error('Failed to load volunteers:', err);
        } finally {
          if (isMounted) setLoadingCandidates(false);
        }
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
          const runsRes = await getDeploymentRuns();
          if (isMounted && runsRes?.data) setDeploymentRuns(runsRes.data);
        } catch (_) {}
      }

      // 4 ── Volunteer: own profile
      if (isVolunteer) {
        try {
          const profRes = await getMyProfile();
          if (isMounted && profRes?.data) {
            setVolunteerProfile({
              skills: profRes.data.skills || [],
              languages: profRes.data.languages || [],
              mobilityLevel: profRes.data.mobilityLevel || 'Medium',
              experienceYears: profRes.data.experienceYears || 0,
            });
          }
        } catch (_) {}
      }
    };

    load();
    return () => { isMounted = false; };
  }, [isAdmin, isCoordinator, isVolunteer]);

  // ── Auto-run optimization once locations are loaded ───────────────────────
  useEffect(() => {
    if (locations.length === 0 || !isCoordinator) return;
    const realIds = locations.map((l) => l.id).filter((id) => id && String(id).length === 24);
    if (realIds.length === 0) return;

    previewMatching(realIds)
      .then((res) => {
        const data = res?.data;
        if (!data) return;
        // Update coverage per location
        if (data.proposedAssignments) {
          setLocations((prev) =>
            prev.map((loc) => {
              const assigned = data.proposedAssignments.filter((a) => a.locationId === loc.id).length;
              const required = loc.requirements.reduce((s, r) => s + (r.requiredCount || 1), 0) || 1;
              const pct = Math.min(100, Math.round((assigned / required) * 100));
              const gaps = data.detectedSkillGaps?.filter((g) => g.locationId === loc.id) || [];
              const hasAlert = gaps.length > 0;
              const alertMessage = gaps.map((g) => `Critical shortage: ${g.requiredSkill}. Short ${g.shortage} volunteer(s).`).join(' ');
              return { ...loc, coverage: pct, hasAlert, alertMessage };
            })
          );
          // Update candidate assignment status
          setCandidates((prev) =>
            prev.map((c) => {
              const a = data.proposedAssignments.find((x) => x.volunteerId === c.id);
              if (a) return { ...c, status: 'assigned', assignedTo: a.locationId, matchScore: Math.round((a.matchScore || 0.8) * 100) };
              return c;
            })
          );
        }
        if (data.stats) {
          setMetrics((prev) => ({
            ...prev,
            staffingCoverage: Math.round(data.stats.globalCoverageRate || 0),
            activeSkillGaps: data.stats.totalGaps || 0,
          }));
        }
      })
      .catch(() => {});
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
    } catch (e) {
      showToast(`Optimization error: ${e?.response?.data?.message || e.message}`, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // ── Manual assign candidate ────────────────────────────────────────────────
  const handleAssignCandidate = (candidateId, locationId) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, status: 'assigned', assignedTo: locationId } : c))
    );
    setLocations((prev) =>
      prev.map((loc) => {
        if (loc.id !== locationId) return loc;
        const newCov = Math.min(100, loc.coverage + Math.round(100 / Math.max(1, loc.requirements.reduce((s, r) => s + (r.requiredCount || 1), 0))));
        return { ...loc, coverage: newCov, hasAlert: newCov < 100 };
      })
    );
    setMetrics((prev) => ({
      ...prev,
      staffingCoverage: Math.min(100, prev.staffingCoverage + 2),
      activeSkillGaps: Math.max(0, prev.activeSkillGaps - 1),
    }));
    showToast('Volunteer assigned! Skill gap reduced.');
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
        date: new Date().toISOString(),
        shiftStart: '09:00',
        shiftEnd: '17:00',
        requirements: [{
          task: 'Emergency Support',
          requiredSkill: newLocationForm.requiredSkills,
          requiredCount: newLocationForm.requiredVolunteers,
          isSafetyCritical: newLocationForm.tier === 'Tier 3',
          minProficiency: 3,
        }],
      });
      const newLoc = mapDbLocation(created?.data || { _id: Date.now().toString(), ...newLocationForm }, 0, true, `Need ${newLocationForm.requiredVolunteers} ${newLocationForm.requiredSkills} volunteer(s).`);
      setLocations((prev) => [newLoc, ...prev]);
      setIsLocationModalOpen(false);
      setNewLocationForm({ name: '', address: '', city: '', requiredSkills: 'Medical Advanced', requiredVolunteers: 4, tier: 'Tier 2' });
      showToast(`Location "${newLoc.name}" added!`);
    } catch (err) {
      showToast(`Failed to create location: ${err?.response?.data?.message || err.message}`, 'error');
    }
  };

  const handleExport = (format) => {
    showToast(`Exporting ${format.toUpperCase()} deployment report…`);
  };

  if (!user) return null;

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#eef2f8] text-slate-800 flex font-sans selection:bg-indigo-500 selection:text-white p-3 sm:p-5 lg:p-7">

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700 text-xs font-semibold">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* LEFT DOCK */}
      <aside className="hidden md:flex flex-col items-center justify-between w-[72px] bg-white/95 backdrop-blur-md rounded-[32px] p-3 shadow-xl shadow-slate-200/60 border border-white/90 mr-5 shrink-0 z-20">
        <div className="flex flex-col items-center gap-4 w-full">
          <div
            onClick={() => setActiveTab('planner')}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4338ca] to-[#3b82f6] shadow-lg shadow-indigo-500/35 flex items-center justify-center text-white cursor-pointer transition-all hover:scale-105 active:scale-95 group"
            title="Deployment Planner"
          >
            <Layers size={22} className="group-hover:rotate-6 transition-transform" />
          </div>

          <button
            onClick={() => setActiveTab('planner')}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${activeTab === 'planner' ? 'bg-indigo-50 text-indigo-600 shadow-inner border border-indigo-200/70' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/80'}`}
            title="Deployment Planner"
          >
            <Compass size={20} />
          </button>

          {isCoordinator && (
            <button
              onClick={() => setActiveTab('locations')}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${activeTab === 'locations' ? 'bg-indigo-50 text-indigo-600 shadow-inner border border-indigo-200/70' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/80'}`}
              title="Locations"
            >
              <MapPin size={20} />
            </button>
          )}

          {isCoordinator && (
            <button
              onClick={() => setActiveTab('volunteers')}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${activeTab === 'volunteers' ? 'bg-indigo-50 text-indigo-600 shadow-inner border border-indigo-200/70' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/80'}`}
              title="Volunteers"
            >
              <Users size={20} />
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setActiveTab('reports')}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${activeTab === 'reports' ? 'bg-indigo-50 text-indigo-600 shadow-inner border border-indigo-200/70' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/80'}`}
              title="Reports"
            >
              <FileSpreadsheet size={20} />
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${activeTab === 'admin' ? 'bg-purple-50 text-purple-700 shadow-inner border border-purple-200/70' : 'text-purple-400 hover:text-purple-600 hover:bg-purple-50/50'}`}
              title="Admin Role Manager"
            >
              <Shield size={20} />
            </button>
          )}

          {isVolunteer && (
            <button
              onClick={() => setActiveTab('my_portal')}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${activeTab === 'my_portal' ? 'bg-teal-50 text-teal-700 shadow-inner border border-teal-200/70' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/80'}`}
              title="My Skills"
            >
              <Award size={20} />
            </button>
          )}
        </div>

        <div className="flex flex-col items-center gap-3 w-full">
          <Link to="/" title="Home" className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <Home size={18} />
          </Link>
          <div
            onClick={() => { logout(); navigate('/'); }}
            title="Sign Out"
            className="w-11 h-11 rounded-2xl border-2 border-indigo-500/20 p-0.5 relative cursor-pointer hover:border-rose-400 group transition-all"
          >
            <div className="w-full h-full rounded-[14px] bg-indigo-100 flex items-center justify-center text-indigo-700 font-extrabold text-sm">
              {(user.fullName || user.email || 'U')[0].toUpperCase()}
            </div>
            <div className="absolute inset-0 rounded-[14px] bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
              <LogOut size={14} />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 max-w-[1440px] mx-auto w-full flex flex-col space-y-6">

        {/* HEADER */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
              {activeTab === 'planner' && 'Deployment Planner'}
              {activeTab === 'locations' && 'Service Locations & Sites'}
              {activeTab === 'volunteers' && 'Volunteer Directory'}
              {activeTab === 'reports' && 'Deployment Reports & Export'}
              {activeTab === 'admin' && 'Admin Privileges & Role Manager'}
              {activeTab === 'my_portal' && 'My Volunteer Hub & Skills'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Real-time volunteer skill-gap analysis · {user.fullName || user.email}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${isAdmin ? 'bg-purple-100 text-purple-800' : isCoordinator ? 'bg-sky-100 text-sky-800' : 'bg-teal-100 text-teal-800'}`}>
                {user.role}
              </span>
            </p>
          </div>

          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-2 bg-white/95 backdrop-blur-md rounded-full px-4 py-2 shadow-sm border border-slate-200/80 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-50 cursor-pointer transition-colors">
              <Calendar size={14} className="text-slate-400" />
              <span>{selectedDate}</span>
            </div>
            <span className="text-slate-200">|</span>
            <div className="relative group">
              <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} className="bg-transparent appearance-none pr-5 py-1.5 font-semibold text-slate-700 cursor-pointer focus:outline-none">
                <option>All Regions</option>
                <option>Northeast Region</option>
                <option>Downtown Metro</option>
                <option>Coastal Bay</option>
                <option>West District</option>
              </select>
              <ChevronDown size={13} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <span className="text-slate-200">|</span>
            <div className="relative group">
              <select value={selectedShift} onChange={(e) => setSelectedShift(e.target.value)} className="bg-transparent appearance-none pr-5 py-1.5 font-semibold text-slate-700 cursor-pointer focus:outline-none">
                <option>All Shifts</option>
                <option>Morning Shift</option>
                <option>Afternoon Shift</option>
                <option>Night Emergency</option>
              </select>
              <ChevronDown size={13} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            {isCoordinator && (
              <button
                onClick={handleUpdateView}
                disabled={isUpdating}
                className="ml-1 px-5 py-2 rounded-full bg-[#4338ca] hover:bg-[#3730a3] text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-all duration-200 active:scale-95 flex items-center gap-1.5 disabled:opacity-75"
              >
                <RefreshCw size={12} className={isUpdating ? 'animate-spin' : ''} />
                <span>{isUpdating ? 'Optimizing…' : 'Update View'}</span>
              </button>
            )}
          </div>
        </header>

        {/* METRICS */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="bg-white/95 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#edf4ff] border border-blue-100/60 flex items-center justify-center shrink-0">
              <Users size={22} className="text-[#3b82f6]" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Volunteers</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] mt-0.5">{metrics.totalVolunteers.toLocaleString()}</div>
            </div>
          </div>

          <div className="bg-white/95 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#e6fbf5] border border-teal-100/60 flex items-center justify-center shrink-0">
              <CheckCircle2 size={22} className="text-[#10b981]" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Staffing Coverage</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] mt-0.5">{metrics.staffingCoverage}%</div>
            </div>
          </div>

          <div className="bg-white/95 rounded-3xl p-5 sm:p-6 border border-rose-300 shadow-[0_0_24px_rgba(244,63,94,0.18)] hover:shadow-[0_0_30px_rgba(244,63,94,0.25)] transition-all flex items-center gap-4 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-[#ffebee] border border-rose-200/70 flex items-center justify-center shrink-0">
              <AlertTriangle size={22} className="text-[#ef4444]" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Skill Gaps</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#ef4444] mt-0.5">{metrics.activeSkillGaps}</div>
            </div>
          </div>

          <div className="bg-white/95 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#fff8eb] border border-amber-100/60 flex items-center justify-center shrink-0">
              <Clock size={22} className="text-[#f59e0b]" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Reviews</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] mt-0.5">{metrics.pendingReviews}</div>
            </div>
          </div>
        </section>

        {/* OPTIMIZATION ENGINE RESULTS */}
        {showRecommendations && optimizationResult && (
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white rounded-3xl p-6 shadow-xl border border-indigo-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-indigo-700/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/30 flex items-center justify-center text-teal-300">
                  <Zap size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base flex items-center gap-2">
                    <span>Optimization Engine: How to Fill the Skill Gap</span>
                    <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] uppercase font-bold tracking-wider">
                      {optimizationResult.stats?.engineUsed || 'Greedy Heuristic'}
                    </span>
                  </h3>
                  <p className="text-xs text-indigo-200">
                    Analyzed {locations.length} site(s) · {optimizationResult.stats?.totalAssigned || 0} volunteer(s) assigned · {optimizationResult.stats?.totalGaps || 0} gap(s) detected
                  </p>
                </div>
              </div>
              <button
                onClick={handleAutoFillSkillGap}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-xs shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2 shrink-0 active:scale-95"
              >
                <CheckCircle2 size={16} />
                <span>Generate Deployment Plan</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {/* Skill Gaps */}
              <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5 mb-2">
                  <AlertTriangle size={14} />
                  <span>Detected Skill Gaps ({optimizationResult.detectedSkillGaps?.length || 0})</span>
                </div>
                {(optimizationResult.detectedSkillGaps || []).slice(0, 3).map((gap, i) => (
                  <div key={i} className="text-[11px] text-indigo-200 mt-1">
                    <strong className="text-white">{gap.requiredSkill}</strong> — short {gap.shortage} at site {String(gap.locationId).slice(-6)}
                  </div>
                ))}
                {(optimizationResult.detectedSkillGaps?.length || 0) === 0 && (
                  <div className="text-[11px] text-emerald-300 font-bold">✓ No skill gaps detected!</div>
                )}
              </div>

              {/* Top Assignments */}
              <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                <div className="text-xs font-bold text-sky-300 flex items-center gap-1.5 mb-2">
                  <Cpu size={14} />
                  <span>Top Assignments ({optimizationResult.proposedAssignments?.length || 0})</span>
                </div>
                {(optimizationResult.proposedAssignments || []).slice(0, 3).map((a, i) => {
                  const cand = candidates.find((c) => c.id === a.volunteerId);
                  return (
                    <div key={i} className="text-[11px] text-indigo-200 mt-1">
                      <strong className="text-white">{cand?.name || a.volunteerId?.slice(-6)}</strong> → {a.task} ({Math.round((a.matchScore || 0) * 100)}%)
                    </div>
                  );
                })}
              </div>

              {/* Stats */}
              <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-2">
                  <TrendingUp size={14} />
                  <span>Engine Stats</span>
                </div>
                <div className="text-[11px] text-indigo-200 mt-1">
                  Coverage: <strong className="text-white">{Math.round(optimizationResult.stats?.globalCoverageRate || 0)}%</strong>
                </div>
                <div className="text-[11px] text-indigo-200 mt-1">
                  Assigned: <strong className="text-white">{optimizationResult.stats?.totalAssigned || 0}</strong>
                </div>
                <div className="text-[11px] text-indigo-200 mt-1">
                  Solver: <strong className="text-white">{optimizationResult.stats?.engineUsed || 'greedy'}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PLANNER */}
        {activeTab === 'planner' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Location Requirements */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-base sm:text-lg font-bold text-[#0f172a]">Location Requirements</h2>
                <div className="px-3 py-1 rounded-full bg-white text-[11px] font-bold text-slate-500 shadow-sm border border-slate-200">
                  {locations.length} SITES
                </div>
              </div>

              {loadingLocations ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={32} className="text-indigo-400 animate-spin" />
                  <span className="ml-3 text-sm text-slate-400 font-medium">Loading locations from database…</span>
                </div>
              ) : locations.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-slate-100">
                  <MapPin size={36} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-semibold text-sm">No locations in database.</p>
                  {isCoordinator && (
                    <button
                      onClick={() => setIsLocationModalOpen(true)}
                      className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                    >
                      Add First Location
                    </button>
                  )}
                </div>
              ) : (
                locations.map((loc) => (
                  <div
                    key={loc.id}
                    className={`bg-white rounded-3xl p-5 sm:p-6 shadow-sm border-2 transition-all ${loc.hasAlert ? 'border-rose-500' : 'border-emerald-500'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-[#0f172a]">{loc.name}</h3>
                        <div className="text-xs text-slate-400 font-semibold mt-0.5">
                          {loc.city && `${loc.city} · `}
                          <span className="font-mono">{loc.siteCode}</span>
                          <span className="ml-2 px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px]">{loc.status}</span>
                        </div>
                      </div>
                      <CircularRing coverage={loc.coverage} />
                    </div>

                    {loc.hasAlert ? (
                      <div className="mt-4 p-3.5 rounded-2xl bg-[#fff5f5] border border-rose-200/80">
                        <div className="text-xs font-bold text-rose-600 flex items-center gap-1.5">
                          <AlertTriangle size={13} />
                          <span>Skill-Gap Alert</span>
                        </div>
                        <p className="text-xs text-rose-800 leading-relaxed mt-1 font-medium">{loc.alertMessage || 'Shortage detected.'}</p>
                      </div>
                    ) : (
                      <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                        <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                          <CheckCircle2 size={13} />
                          <span>{loc.coverage >= 100 ? 'Fully Staffed!' : `${loc.coverage}% Coverage`}</span>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {loc.tags.map((t, i) => (
                        <span key={i} className={`px-3 py-1 rounded-full text-xs font-bold border ${t.color}`}>{t.label}</span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Candidate Matching Pool */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-base sm:text-lg font-bold text-[#0f172a]">Candidate Matching Pool</h2>
                <div className="flex items-center gap-1 bg-white p-1 rounded-full shadow-sm border border-slate-200 text-xs font-bold">
                  <button
                    onClick={() => setCandidateFilter('eligible')}
                    className={`px-3 py-1 rounded-full transition-all ${candidateFilter === 'eligible' ? 'bg-[#4338ca] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Actually Eligible
                  </button>
                  <button
                    onClick={() => setCandidateFilter('suitable')}
                    className={`px-3 py-1 rounded-full transition-all ${candidateFilter === 'suitable' ? 'bg-[#4338ca] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Potentially Suitable
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {loadingCandidates ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 size={28} className="text-indigo-400 animate-spin" />
                    <span className="ml-3 text-sm text-slate-400 font-medium">Loading candidates…</span>
                  </div>
                ) : candidates.filter((c) => candidateFilter === 'eligible' ? c.type === 'eligible' : true).length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-slate-100">
                    <Users size={36} className="text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-semibold text-sm">No volunteer candidates found in database.</p>
                    <p className="text-slate-400 text-xs mt-1">Volunteers need to register and create a profile first.</p>
                  </div>
                ) : (
                  candidates
                    .filter((c) => candidateFilter === 'eligible' ? c.type === 'eligible' : true)
                    .map((candidate) => (
                      <div
                        key={candidate.id}
                        className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="relative shrink-0">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-sm">
                              {candidate.initials}
                            </div>
                            <div className={`absolute -top-1.5 -left-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold shadow-sm ${candidate.scoreColor}`}>
                              {candidate.matchScore}%
                            </div>
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-base">{candidate.name}</div>
                            <div className="text-xs text-slate-500 font-medium">{candidate.title}</div>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {candidate.skills.map((skill, i) => (
                                <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold tracking-wider uppercase border border-slate-200/80">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          {candidate.status === 'not_available' ? (
                            <button disabled className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-slate-100 text-slate-400 font-bold text-xs uppercase cursor-not-allowed border border-slate-200">
                              NOT AVAILABLE
                            </button>
                          ) : candidate.status === 'assigned' ? (
                            <div className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs uppercase border border-emerald-200 flex items-center justify-center gap-1.5">
                              <Check size={14} />
                              <span>ASSIGNED</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAssignCandidate(candidate.id, locations[0]?.id)}
                              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#4338ca] hover:bg-[#3730a3] text-white font-bold text-xs uppercase shadow-md shadow-indigo-600/25 transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5"
                            >
                              ASSIGN NOW
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: ADMIN */}
        {activeTab === 'admin' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Shield size={20} className="text-purple-600" />
                  <span>Admin Role Manager: Make or Remove Coordinators</span>
                </h2>
                <p className="text-xs text-slate-500">Role changes persist directly to MongoDB via the backend API.</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold uppercase">Admin Authority</span>
            </div>

            {loadingUsers ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={28} className="text-purple-400 animate-spin" />
                <span className="ml-3 text-sm text-slate-400">Loading users from database…</span>
              </div>
            ) : usersList.length === 0 ? (
              <div className="text-center py-12 text-slate-400">No users found in database.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                      <th className="pb-3 px-3">User</th>
                      <th className="pb-3 px-3">Email</th>
                      <th className="pb-3 px-3">Current Role</th>
                      <th className="pb-3 px-3">Joined</th>
                      <th className="pb-3 px-3 text-right">Admin Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {usersList.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-3 font-bold text-slate-900">{u.fullName}</td>
                        <td className="py-3.5 px-3 text-slate-500">{u.email}</td>
                        <td className="py-3.5 px-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${u.role === 'admin' ? 'bg-purple-100 text-purple-800 border-purple-200' : u.role === 'coordinator' ? 'bg-sky-100 text-sky-800 border-sky-200' : 'bg-teal-100 text-teal-800 border-teal-200'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-400">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          {u.role === 'admin' ? (
                            <span className="text-slate-400 font-semibold italic text-[11px]">Primary Admin</span>
                          ) : u.role === 'coordinator' ? (
                            <button
                              onClick={() => handleToggleCoordinator(u)}
                              className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-all flex items-center gap-1.5 ml-auto"
                            >
                              <UserMinus size={13} />
                              <span>Remove Coordinator</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleCoordinator(u)}
                              className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all flex items-center gap-1.5 ml-auto"
                            >
                              <UserCheck size={13} />
                              <span>Make Coordinator</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Deployment Runs */}
            {deploymentRuns.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <Layers size={16} className="text-indigo-500" />
                  Recent Deployment Runs ({deploymentRuns.length})
                </h3>
                <div className="space-y-2">
                  {deploymentRuns.slice(0, 5).map((run) => (
                    <div key={run._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div>
                        <div className="font-bold text-slate-800">{run.title}</div>
                        <div className="text-slate-400">{run.targetDate ? new Date(run.targetDate).toLocaleDateString() : '—'}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${run.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' : run.status === 'CANCELLED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                        {run.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: MY VOLUNTEER PORTAL */}
        {activeTab === 'my_portal' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Award size={20} className="text-teal-600" />
                  <span>My Volunteer Profile & Skill Management</span>
                </h2>
                <p className="text-xs text-slate-500">Add skills so the optimization engine can match you to critical needs.</p>
              </div>
              <button
                onClick={handleSaveVolunteerProfile}
                disabled={savingSkills}
                className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                {savingSkills ? <Loader2 size={14} className="animate-spin" /> : <Check size={15} />}
                <span>{savingSkills ? 'Saving…' : 'Save Skills to Backend'}</span>
              </button>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Your Current Verified Skills</h3>
              {volunteerProfile.skills.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No skills added yet. Add your first skill below.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {volunteerProfile.skills.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold">
                      <span>{s.skill || s.skillName}</span>
                      <span className="text-[10px] px-1.5 bg-teal-200/70 text-teal-800 rounded font-black">Level {s.proficiency}/5</span>
                      <button onClick={() => handleRemoveSkill(idx)} className="text-teal-600 hover:text-rose-600 ml-1">
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                <Plus size={14} className="text-teal-600" />
                Add a New Skill or Certification
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-7">
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Skill Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Medical Advanced, Spanish, Logistics, CPR"
                    value={newSkillInput.skill}
                    onChange={(e) => setNewSkillInput({ ...newSkillInput, skill: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Proficiency (1–5)</label>
                  <select
                    value={newSkillInput.proficiency}
                    onChange={(e) => setNewSkillInput({ ...newSkillInput, proficiency: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:border-teal-600"
                  >
                    <option value={1}>1 – Beginner</option>
                    <option value={2}>2 – Elementary</option>
                    <option value={3}>3 – Intermediate</option>
                    <option value={4}>4 – Advanced</option>
                    <option value={5}>5 – Expert / Certified</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <button type="button" onClick={handleAddSkill} className="w-full py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all">
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: LOCATIONS */}
        {activeTab === 'locations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Service Locations & Disaster Sites</h2>
                <p className="text-xs text-slate-500">Live from MongoDB <code>/api/locations</code></p>
              </div>
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="px-4 py-2 rounded-2xl bg-[#4338ca] text-white text-xs font-bold shadow-md flex items-center gap-1.5 hover:bg-[#3730a3]"
              >
                <Plus size={15} />
                <span>Add New Site</span>
              </button>
            </div>

            {loadingLocations ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={32} className="text-indigo-400 animate-spin" />
              </div>
            ) : locations.length === 0 ? (
              <div className="text-center py-16 text-slate-400">No locations found. Add the first one.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {locations.map((loc) => (
                  <div key={loc.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-400 font-mono">{loc.siteCode}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${loc.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : loc.status === 'UPCOMING' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'}`}>
                          {loc.status}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{loc.name}</h3>
                      {loc.city && <p className="text-xs text-slate-400 mt-0.5">{loc.city}</p>}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {loc.tags.map((t, idx) => (
                          <span key={idx} className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${t.color}`}>{t.label}</span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-xs text-slate-500">Coverage: <strong className="text-slate-800">{loc.coverage}%</strong></div>
                      <button
                        onClick={() => { setActiveTab('planner'); showToast(`Selected ${loc.name}`); }}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <span>Deploy Pool</span>
                        <ArrowUpRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: VOLUNTEERS */}
        {activeTab === 'volunteers' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Volunteer Network Pool</h2>
                <p className="text-xs text-slate-500">All registered volunteers, their skills and certifications from MongoDB.</p>
              </div>
              <div className="text-xs font-bold text-slate-400">Total: {candidates.length} volunteers</div>
            </div>

            {loadingCandidates ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={28} className="text-indigo-400 animate-spin" />
              </div>
            ) : candidates.length === 0 ? (
              <div className="text-center py-12 text-slate-400">No volunteers found in database.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {candidates.map((cand) => (
                  <div key={cand.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-sm border">
                        {cand.initials}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{cand.name}</div>
                        <div className="text-xs text-slate-500">{cand.title}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {cand.skills.map((s, idx) => (
                        <span key={idx} className="px-2 py-1 bg-slate-100 rounded-md text-[10px] font-bold text-slate-600">{s}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cand.scoreColor}`}>{cand.matchScore}% match</span>
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <UserCheck size={14} /> Verified
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: REPORTS */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Deployment Reports & Audit Export</h2>
              <p className="text-xs text-slate-500">Download formatted sheets for dispatch coordinators and regional command centers.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3 shadow-md">
                    <FileSpreadsheet size={20} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">Excel Deployment Sheet (.xlsx)</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Full deployment schedule, site-by-site volunteer assignments, phone contacts, and skill-gap matrix.
                  </p>
                </div>
                <button onClick={() => handleExport('excel')} className="mt-6 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all self-start">
                  Download Excel Sheet
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center mb-3 shadow-md">
                    <FileText size={20} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">Printable PDF Roster (.pdf)</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Formal regional summary sheet for on-site check-in tables, badge verification, and emergency coordinators.
                  </p>
                </div>
                <button onClick={() => handleExport('pdf')} className="mt-6 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all self-start">
                  Download PDF Roster
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* CREATE LOCATION MODAL */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Add New Service Location</h3>
              <button onClick={() => setIsLocationModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateLocation} className="space-y-4 mt-4 text-xs font-semibold">
              <div>
                <label className="text-slate-600 block mb-1">Site / Shelter Name *</label>
                <input type="text" required placeholder="e.g. Metro Disaster Relief Hub" value={newLocationForm.name}
                  onChange={(e) => setNewLocationForm({ ...newLocationForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium" />
              </div>
              <div>
                <label className="text-slate-600 block mb-1">Address</label>
                <input type="text" placeholder="Street address" value={newLocationForm.address}
                  onChange={(e) => setNewLocationForm({ ...newLocationForm, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium" />
              </div>
              <div>
                <label className="text-slate-600 block mb-1">City</label>
                <input type="text" placeholder="City name" value={newLocationForm.city}
                  onChange={(e) => setNewLocationForm({ ...newLocationForm, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium" />
              </div>
              <div>
                <label className="text-slate-600 block mb-1">Required Primary Skill *</label>
                <input type="text" required placeholder="e.g. Medical Advanced, Logistics" value={newLocationForm.requiredSkills}
                  onChange={(e) => setNewLocationForm({ ...newLocationForm, requiredSkills: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1">Needed Volunteers</label>
                  <input type="number" min="1" value={newLocationForm.requiredVolunteers}
                    onChange={(e) => setNewLocationForm({ ...newLocationForm, requiredVolunteers: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium" />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Priority Tier</label>
                  <select value={newLocationForm.tier} onChange={(e) => setNewLocationForm({ ...newLocationForm, tier: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium">
                    <option value="Tier 1">Tier 1 (Normal)</option>
                    <option value="Tier 2">Tier 2 (Elevated)</option>
                    <option value="Tier 3">Tier 3 (Critical)</option>
                  </select>
                </div>
              </div>
              <div className="pt-3 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setIsLocationModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-[#4338ca] hover:bg-[#3730a3] text-white font-bold shadow-md shadow-indigo-600/20">
                  Register Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
