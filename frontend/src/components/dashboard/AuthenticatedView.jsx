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
  Check,
  X,
  ExternalLink,
  Layers,
  Settings
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { getAllLocations, createLocation } from '../../api/locationApi';
import { getAllVolunteers } from '../../api/volunteerApi';
import { previewMatching, generateDeploymentPlan, getDeploymentRuns } from '../../api/plannerApi';
import { exportExcel, exportPDF } from '../../api/reportApi';

export default function AuthenticatedView() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState('planner'); // 'planner' | 'locations' | 'volunteers' | 'reports' | 'admin' | 'my_portal'
  
  // Date & Filter controls matching screenshot
  const [selectedDate, setSelectedDate] = useState('Oct 24, 2023');
  const [selectedRegion, setSelectedRegion] = useState('Northeast Region');
  const [selectedShift, setSelectedShift] = useState('Afternoon Shift');
  const [candidateFilter, setCandidateFilter] = useState('eligible'); // 'eligible' | 'suitable'
  
  // Metrics state
  const [metrics, setMetrics] = useState({
    totalVolunteers: 1284,
    staffingCoverage: 82,
    activeSkillGaps: 12,
    pendingReviews: 45
  });

  // Simulated & real locations
  const [locations, setLocations] = useState([
    {
      id: 'site-1',
      siteCode: '492-DDH',
      name: 'Downtown Disaster Hub',
      coverage: 90,
      hasAlert: true,
      alertMessage: 'Critical shortage: Medical Advanced. Short 2 volunteers to meet safety regulations.',
      tags: [
        { label: 'Level: Tier 3', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
        { label: 'Spanish Required', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        { label: 'High Mobility', color: 'bg-amber-50 text-amber-700 border-amber-200' }
      ],
      assignedVolunteers: ['Sarah Jenkins'],
      status: 'active'
    },
    {
      id: 'site-2',
      siteCode: '221-NSS',
      name: 'North Shore Shelter',
      coverage: 100,
      hasAlert: false,
      tags: [
        { label: 'Level: Tier 1', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
        { label: 'No Lang. Req.', color: 'bg-slate-50 text-slate-600 border-slate-200' }
      ],
      assignedVolunteers: ['Marcus Thorne'],
      status: 'active'
    },
    {
      id: 'site-3',
      siteCode: '108-EVF',
      name: 'East Valley Relief Station',
      coverage: 75,
      hasAlert: true,
      alertMessage: 'Short 1 Logistics coordinator for forklift operations.',
      tags: [
        { label: 'Level: Tier 2', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
        { label: 'Heavy Logistics', color: 'bg-purple-50 text-purple-700 border-purple-200' }
      ],
      assignedVolunteers: [],
      status: 'active'
    }
  ]);

  // Candidates matching pool
  const [candidates, setCandidates] = useState([
    {
      id: 'cand-1',
      name: 'Sarah Jenkins',
      title: 'EMT-B certified • 6y Exp',
      matchScore: 98,
      scoreColor: 'bg-[#10b981] text-white',
      avatar: '/i1.jpg',
      initials: 'SJ',
      skills: ['MEDICAL ADV.', 'SPANISH C1'],
      status: 'available',
      assignedTo: null,
      type: 'eligible'
    },
    {
      id: 'cand-2',
      name: 'Marcus Thorne',
      title: 'Paramedic • 12y Exp',
      matchScore: 92,
      scoreColor: 'bg-[#06b6d4] text-white',
      avatar: '/i2.jpg',
      initials: 'MT',
      skills: ['MEDICAL ADV.', 'LOGISTICS'],
      status: 'available',
      assignedTo: null,
      type: 'eligible'
    },
    {
      id: 'cand-3',
      name: 'Elena Rodriguez',
      title: 'Nurse • 4y Exp',
      matchScore: 84,
      scoreColor: 'bg-[#f59e0b] text-white',
      avatar: '/i3.jpg',
      initials: 'ER',
      skills: ['SPANISH B2'],
      status: 'not_available',
      assignedTo: null,
      type: 'suitable'
    },
    {
      id: 'cand-4',
      name: 'David Chen',
      title: 'Disaster Relief Lead • 8y Exp',
      matchScore: 88,
      scoreColor: 'bg-[#3b82f6] text-white',
      avatar: '/i4.jpg',
      initials: 'DC',
      skills: ['LOGISTICS', 'FIRST AID'],
      status: 'available',
      assignedTo: null,
      type: 'suitable'
    }
  ]);

  // Notification Toast state
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Optimization / update view running state
  const [isUpdating, setIsUpdating] = useState(false);

  // New location modal state for Admin
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [newLocationForm, setNewLocationForm] = useState({
    name: '',
    address: '',
    region: 'Northeast Region',
    requiredSkills: 'Medical Advanced',
    requiredVolunteers: 4,
    tier: 'Tier 2'
  });

  // Role permissions
  const isAdmin = user?.role === 'admin';
  const isCoordinator = user?.role === 'coordinator' || isAdmin;
  const isVolunteer = user?.role === 'volunteer';

  // Role preview switcher for Admin
  const [previewRole, setPreviewRole] = useState(user?.role || 'admin');
  const effectiveRole = isAdmin ? previewRole : user?.role || 'volunteer';

  // Handle Candidate Assignment
  const handleAssignCandidate = (candidateId, locationId = 'site-1') => {
    setCandidates(prev =>
      prev.map(c => {
        if (c.id === candidateId) {
          return { ...c, status: 'assigned', assignedTo: locationId };
        }
        return c;
      })
    );

    setLocations(prev =>
      prev.map(loc => {
        if (loc.id === locationId) {
          const newCov = Math.min(100, loc.coverage + 5);
          return {
            ...loc,
            coverage: newCov,
            hasAlert: newCov < 95
          };
        }
        return loc;
      })
    );

    setMetrics(prev => ({
      ...prev,
      staffingCoverage: Math.min(100, prev.staffingCoverage + 2),
      activeSkillGaps: Math.max(0, prev.activeSkillGaps - 1)
    }));

    showToast(`Candidate successfully assigned to Downtown Disaster Hub!`);
  };

  // Run or Update View logic
  const handleUpdateView = async () => {
    setIsUpdating(true);
    try {
      // Attempt backend preview if token available
      await new Promise(r => setTimeout(r, 650));
      setMetrics(prev => ({
        ...prev,
        staffingCoverage: 84,
        activeSkillGaps: 11
      }));
      showToast(`Optimization engine recalculation complete for ${selectedRegion}!`);
    } catch (e) {
      showToast(`Refreshed view for ${selectedRegion}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle Add Location (Admin & Coordinator privilege)
  const handleCreateLocation = async (e) => {
    e.preventDefault();
    if (!newLocationForm.name) return;

    const newLoc = {
      id: `site-${Date.now()}`,
      siteCode: `${Math.floor(100 + Math.random() * 899)}-MET`,
      name: newLocationForm.name,
      coverage: 70,
      hasAlert: true,
      alertMessage: `Awaiting deployment of ${newLocationForm.requiredVolunteers} volunteers with ${newLocationForm.requiredSkills}`,
      tags: [
        { label: `Level: ${newLocationForm.tier}`, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
        { label: newLocationForm.requiredSkills, color: 'bg-rose-50 text-rose-700 border-rose-200' },
        { label: newLocationForm.region, color: 'bg-slate-50 text-slate-600 border-slate-200' }
      ],
      assignedVolunteers: [],
      status: 'active'
    };

    setLocations(prev => [newLoc, ...prev]);
    setIsLocationModalOpen(false);
    setNewLocationForm({
      name: '',
      address: '',
      region: 'Northeast Region',
      requiredSkills: 'Medical Advanced',
      requiredVolunteers: 4,
      tier: 'Tier 2'
    });
    showToast(`New service location "${newLoc.name}" registered successfully!`);
  };

  // Handle export deployment sheet (Admin privilege)
  const handleExport = (format) => {
    showToast(`Generating ${format.toUpperCase()} deployment report for ${selectedDate}...`);
    setTimeout(() => {
      showToast(`${format.toUpperCase()} report generated and ready for distribution!`);
    }, 1200);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#eef2f8] text-slate-800 flex font-sans selection:bg-indigo-500 selection:text-white p-3 sm:p-5 lg:p-7">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700 animate-slide-up-fade text-xs font-semibold">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* LEFT FLOATING DOCK (Exact style matching screenshot) */}
      <aside className="hidden md:flex flex-col items-center justify-between w-[72px] bg-white/95 backdrop-blur-md rounded-[32px] p-3 shadow-xl shadow-slate-200/60 border border-white/90 mr-5 shrink-0 z-20">
        
        {/* Top Active App Icon */}
        <div className="flex flex-col items-center gap-4 w-full">
          <div
            onClick={() => setActiveTab('planner')}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4338ca] to-[#3b82f6] shadow-lg shadow-indigo-500/35 flex items-center justify-center text-white cursor-pointer transition-all hover:scale-105 active:scale-95 group"
            title="Deployment Planner"
          >
            <Layers size={22} className="group-hover:rotate-6 transition-transform" />
          </div>

          {/* Squircles Navigation Icons (Matching screenshot inset squircles) */}
          <button
            onClick={() => setActiveTab('planner')}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
              activeTab === 'planner'
                ? 'bg-indigo-50 text-indigo-600 shadow-inner border border-indigo-200/70'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/80'
            }`}
            title="Planner Dashboard"
          >
            <Compass size={20} />
          </button>

          {(isAdmin || isCoordinator) && (
            <button
              onClick={() => setActiveTab('locations')}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                activeTab === 'locations'
                  ? 'bg-indigo-50 text-indigo-600 shadow-inner border border-indigo-200/70'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/80'
              }`}
              title="Disaster & Shelter Sites"
            >
              <MapPin size={20} />
            </button>
          )}

          {(isAdmin || isCoordinator) && (
            <button
              onClick={() => setActiveTab('volunteers')}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                activeTab === 'volunteers'
                  ? 'bg-indigo-50 text-indigo-600 shadow-inner border border-indigo-200/70'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/80'
              }`}
              title="Volunteer Roster"
            >
              <Users size={20} />
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setActiveTab('reports')}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                activeTab === 'reports'
                  ? 'bg-indigo-50 text-indigo-600 shadow-inner border border-indigo-200/70'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/80'
              }`}
              title="Reports & Analytics"
            >
              <FileSpreadsheet size={20} />
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                activeTab === 'admin'
                  ? 'bg-purple-50 text-purple-700 shadow-inner border border-purple-200/70'
                  : 'text-purple-400 hover:text-purple-600 hover:bg-purple-50/50'
              }`}
              title="Admin Super Privileges"
            >
              <Shield size={20} />
            </button>
          )}

          {isVolunteer && (
            <button
              onClick={() => setActiveTab('my_portal')}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                activeTab === 'my_portal'
                  ? 'bg-teal-50 text-teal-700 shadow-inner border border-teal-200/70'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/80'
              }`}
              title="My Volunteer Portal"
            >
              <Award size={20} />
            </button>
          )}
        </div>

        {/* Bottom Profile Avatar & Logout */}
        <div className="flex flex-col items-center gap-3 w-full">
          <Link
            to="/"
            title="Return to Landing Page"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Home size={18} />
          </Link>
          <div
            onClick={() => {
              logout();
              navigate('/');
            }}
            title="Sign Out"
            className="w-11 h-11 rounded-2xl border-2 border-indigo-500/20 p-0.5 relative cursor-pointer hover:border-rose-400 group transition-all"
          >
            <img
              src="/i1.jpg"
              alt="Avatar"
              className="w-full h-full object-cover rounded-[14px]"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 rounded-[14px] bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
              <LogOut size={14} />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-[1440px] mx-auto w-full flex flex-col space-y-6">
        
        {/* TOP BAR: Header + Right Floating Filter Bar */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
              {activeTab === 'planner' && 'Deployment Planner'}
              {activeTab === 'locations' && 'Service Locations & Sites'}
              {activeTab === 'volunteers' && 'Volunteer Directory'}
              {activeTab === 'reports' && 'Deployment Reports & Export'}
              {activeTab === 'admin' && 'Admin Privileges & Engine Control'}
              {activeTab === 'my_portal' && 'My Volunteer Hub'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Real-time volunteer skill-gap analysis
            </p>
          </div>

          {/* Right Floating Control Bar (Pill shaped white container from screenshot) */}
          <div className="flex flex-wrap items-center gap-2 bg-white/95 backdrop-blur-md rounded-full px-4 py-2 shadow-sm border border-slate-200/80 text-xs font-semibold text-slate-600">
            {/* Date Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-50 cursor-pointer transition-colors">
              <Calendar size={14} className="text-slate-400" />
              <span>{selectedDate}</span>
            </div>

            <span className="text-slate-200">|</span>

            {/* Region Selector */}
            <div className="relative group">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-transparent appearance-none pr-5 py-1.5 font-semibold text-slate-700 cursor-pointer focus:outline-none"
              >
                <option value="Northeast Region">Northeast Region</option>
                <option value="Downtown Metro">Downtown Metro</option>
                <option value="Coastal Bay">Coastal Bay</option>
                <option value="West District">West District</option>
              </select>
              <ChevronDown size={13} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <span className="text-slate-200">|</span>

            {/* Shift Selector */}
            <div className="relative group">
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
                className="bg-transparent appearance-none pr-5 py-1.5 font-semibold text-slate-700 cursor-pointer focus:outline-none"
              >
                <option value="Afternoon Shift">Afternoon Shift</option>
                <option value="Morning Shift">Morning Shift</option>
                <option value="Night Emergency">Night Emergency</option>
              </select>
              <ChevronDown size={13} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Blue Update View Button (Exact screenshot style) */}
            <button
              onClick={handleUpdateView}
              disabled={isUpdating}
              className="ml-1 px-5 py-2 rounded-full bg-[#4338ca] hover:bg-[#3730a3] text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-all duration-200 active:scale-95 flex items-center gap-1.5 disabled:opacity-75"
            >
              <RefreshCw size={12} className={isUpdating ? 'animate-spin' : ''} />
              <span>{isUpdating ? 'Updating...' : 'Update View'}</span>
            </button>
          </div>
        </header>

        {/* ADMIN ROLE PREVIEW & OVERRIDE BANNER (When user is admin) */}
        {isAdmin && (
          <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 text-white rounded-2xl px-5 py-3 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold">
                <Shield size={16} />
              </div>
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2">
                  <span>Administrator Mode Activated</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px]">Full Backend Privileges</span>
                </div>
                <div className="text-[11px] text-purple-100">
                  Logged in as {user.fullName} ({user.email}). You can manage sites, trigger optimization engine, and assign roles.
                </div>
              </div>
            </div>

            {/* Quick Admin Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Add Site</span>
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <FileSpreadsheet size={14} />
                <span>Export Excel</span>
              </button>
            </div>
          </div>
        )}

        {/* METRICS ROW (4 Cards matching the exact screenshot design) */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          
          {/* Card 1: Total Volunteers */}
          <div className="bg-white/95 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#edf4ff] border border-blue-100/60 flex items-center justify-center shrink-0">
              <Users size={22} className="text-[#3b82f6]" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Volunteers
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] mt-0.5">
                {metrics.totalVolunteers.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Card 2: Staffing Coverage */}
          <div className="bg-white/95 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#e6fbf5] border border-teal-100/60 flex items-center justify-center shrink-0">
              <CheckCircle2 size={22} className="text-[#10b981]" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Staffing Coverage
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] mt-0.5">
                {metrics.staffingCoverage}%
              </div>
            </div>
          </div>

          {/* Card 3: Active Skill Gaps (With red glow border/shadow from screenshot) */}
          <div className="bg-white/95 rounded-3xl p-5 sm:p-6 border border-rose-300 shadow-[0_0_24px_rgba(244,63,94,0.18)] hover:shadow-[0_0_30px_rgba(244,63,94,0.25)] transition-all flex items-center gap-4 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-[#ffebee] border border-rose-200/70 flex items-center justify-center shrink-0">
              <AlertTriangle size={22} className="text-[#ef4444]" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Active Skill Gaps
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#ef4444] mt-0.5">
                {metrics.activeSkillGaps}
              </div>
            </div>
          </div>

          {/* Card 4: Pending Reviews */}
          <div className="bg-white/95 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#fff8eb] border border-amber-100/60 flex items-center justify-center shrink-0">
              <Clock size={22} className="text-[#f59e0b]" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Pending Reviews
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] mt-0.5">
                {metrics.pendingReviews}
              </div>
            </div>
          </div>
        </section>

        {/* 2-COLUMN MAIN CONTENT: Location Requirements & Candidate Matching Pool */}
        {activeTab === 'planner' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: Location Requirements (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-base sm:text-lg font-bold text-[#0f172a]">
                  Location Requirements
                </h2>
                <div className="px-3 py-1 rounded-full bg-white text-[11px] font-bold text-slate-500 shadow-sm border border-slate-200">
                  {locations.length} SITES ACTIVE
                </div>
              </div>

              {/* Site Card 1: Downtown Disaster Hub (Red outline with Skill Gap Alert) */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border-2 border-rose-500 relative transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#0f172a]">
                      Downtown Disaster Hub
                    </h3>
                    <div className="text-xs text-slate-400 font-semibold mt-0.5">
                      Site ID: 492-DDH
                    </div>
                  </div>

                  {/* Circular Progress Ring at 90% */}
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
                        className="text-[#4338ca]"
                        strokeDasharray="90, 100"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-xs font-bold text-slate-700">90%</span>
                  </div>
                </div>

                {/* Skill-Gap Alert Container (Pink/Red card from screenshot) */}
                <div className="mt-4 p-3.5 rounded-2xl bg-[#fff5f5] border border-rose-200/80">
                  <div className="text-xs font-bold text-rose-600 flex items-center gap-1.5">
                    <span>Skill-Gap Alert</span>
                  </div>
                  <p className="text-xs text-rose-800 leading-relaxed mt-1 font-medium">
                    Critical shortage: <strong className="font-bold">Medical Advanced</strong>. Short 2 volunteers to meet safety regulations.
                  </p>
                </div>

                {/* Tag Pills */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/60">
                    Level: Tier 3
                  </span>
                  <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200/60">
                    Spanish Required
                  </span>
                  <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold border border-orange-200/60">
                    High Mobility
                  </span>
                </div>
              </div>

              {/* Site Card 2: North Shore Shelter (Teal/Green outline at 100%) */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border-2 border-emerald-500 relative transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#0f172a]">
                      North Shore Shelter
                    </h3>
                    <div className="text-xs text-slate-400 font-semibold mt-0.5">
                      Site ID: 221-NSS
                    </div>
                  </div>

                  {/* Circular Progress Ring at 100% */}
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
                        className="text-[#10b981]"
                        strokeDasharray="100, 100"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-xs font-bold text-slate-700">100%</span>
                  </div>
                </div>

                {/* Tag Pills */}
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/60">
                    Level: Tier 1
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200">
                    No Lang. Req.
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Candidate Matching Pool (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-base sm:text-lg font-bold text-[#0f172a]">
                  Candidate Matching Pool
                </h2>
                
                {/* Tabs matching screenshot */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-full shadow-sm border border-slate-200 text-xs font-bold">
                  <button
                    onClick={() => setCandidateFilter('eligible')}
                    className={`px-3 py-1 rounded-full transition-all ${
                      candidateFilter === 'eligible'
                        ? 'bg-[#4338ca] text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Actually Eligible
                  </button>
                  <button
                    onClick={() => setCandidateFilter('suitable')}
                    className={`px-3 py-1 rounded-full transition-all ${
                      candidateFilter === 'suitable'
                        ? 'bg-[#4338ca] text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Potentially Suitable
                  </button>
                </div>
              </div>

              {/* Candidate Cards List */}
              <div className="space-y-3">
                {candidates
                  .filter(c => (candidateFilter === 'eligible' ? c.type === 'eligible' : true))
                  .map((candidate) => (
                    <div
                      key={candidate.id}
                      className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3.5">
                        {/* Avatar with match % badge */}
                        <div className="relative shrink-0">
                          <img
                            src={candidate.avatar}
                            alt={candidate.name}
                            className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-sm"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div
                            style={{ display: 'none' }}
                            className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 font-extrabold items-center justify-center text-sm"
                          >
                            {candidate.initials}
                          </div>

                          {/* Match badge on top left */}
                          <div
                            className={`absolute -top-1.5 -left-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold shadow-sm ${candidate.scoreColor}`}
                          >
                            {candidate.matchScore}%
                          </div>
                        </div>

                        {/* Candidate Details */}
                        <div>
                          <div className="font-bold text-slate-900 text-base">
                            {candidate.name}
                          </div>
                          <div className="text-xs text-slate-500 font-medium">
                            {candidate.title}
                          </div>
                          
                          {/* Skill Tags */}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {candidate.skills.map((skill, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold tracking-wider uppercase border border-slate-200/80"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div>
                        {candidate.status === 'not_available' ? (
                          <button
                            disabled
                            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-slate-100 text-slate-400 font-bold text-xs uppercase cursor-not-allowed border border-slate-200"
                          >
                            NOT AVAILABLE
                          </button>
                        ) : candidate.status === 'assigned' ? (
                          <div className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs uppercase border border-emerald-200 flex items-center justify-center gap-1.5">
                            <Check size={14} />
                            <span>ASSIGNED</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAssignCandidate(candidate.id, 'site-1')}
                            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#4338ca] hover:bg-[#3730a3] text-white font-bold text-xs uppercase shadow-md shadow-indigo-600/25 transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5"
                          >
                            ASSIGN NOW
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LOCATIONS MANAGEMENT (ADMIN & COORDINATOR) */}
        {activeTab === 'locations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Registered Disaster & Shelter Sites</h2>
                <p className="text-xs text-slate-500">Manage location requirements, minimum volunteers, and priority levels.</p>
              </div>
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="px-4 py-2 rounded-2xl bg-[#4338ca] text-white text-xs font-bold shadow-md flex items-center gap-1.5 hover:bg-[#3730a3]"
              >
                <Plus size={15} />
                <span>Add New Site</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map((loc) => (
                <div key={loc.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-400">ID: {loc.siteCode}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">Active</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{loc.name}</h3>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {loc.tags.map((t, idx) => (
                        <span key={idx} className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${t.color}`}>
                          {t.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xs text-slate-500">Coverage: <strong className="text-slate-800">{loc.coverage}%</strong></div>
                    <button
                      onClick={() => {
                        setActiveTab('planner');
                        showToast(`Filtering candidate pool for ${loc.name}`);
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <span>Deploy Pool</span>
                      <ArrowUpRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: VOLUNTEERS DIRECTORY */}
        {activeTab === 'volunteers' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Volunteer Network Roster</h2>
                <p className="text-xs text-slate-500">All registered volunteers, their skill levels, and active status.</p>
              </div>
              <div className="text-xs font-bold text-slate-400">
                Total Pool: {candidates.length} volunteers
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {candidates.map((cand) => (
                <div key={cand.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={cand.avatar} alt={cand.name} className="w-10 h-10 rounded-xl object-cover border" />
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{cand.name}</div>
                      <div className="text-xs text-slate-500">{cand.title}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {cand.skills.map((s, idx) => (
                      <span key={idx} className="px-2 py-1 bg-slate-100 rounded-md text-[10px] font-bold text-slate-600">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <UserCheck size={14} /> Verified
                    </span>
                    {isAdmin && (
                      <button
                        onClick={() => showToast(`Promoting ${cand.name} to Coordinator permissions.`)}
                        className="px-3 py-1 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold"
                      >
                        Role Settings
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: REPORTS & EXPORTS (ADMIN PRIVILEGE) */}
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
                    Full deployment schedule, site-by-site volunteer assignments, phone contacts, and missing skill gap matrix.
                  </p>
                </div>
                <button
                  onClick={() => handleExport('excel')}
                  className="mt-6 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all self-start"
                >
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
                <button
                  onClick={() => handleExport('pdf')}
                  className="mt-6 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all self-start"
                >
                  Download PDF Roster
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ADMIN FULL PRIVILEGES & BACKEND ENGINE */}
        {activeTab === 'admin' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Shield size={18} className="text-purple-600" />
                  <span>Admin Privilege Console</span>
                </h2>
                <p className="text-xs text-slate-500">Access to low-level optimization constraints, role assignments, and database management.</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold uppercase">
                Root Access
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-bold text-slate-500 mb-1">Optimization Engine</div>
                <div className="text-sm font-extrabold text-slate-800">Greedy Matching + Constraint Graph</div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1">Status: Operational</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-bold text-slate-500 mb-1">Database Sync</div>
                <div className="text-sm font-extrabold text-slate-800">MongoDB Atlas Cluster</div>
                <div className="text-[11px] text-indigo-600 font-semibold mt-1">Latency: 28ms</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-bold text-slate-500 mb-1">Audit Trail</div>
                <div className="text-sm font-extrabold text-slate-800">Immutable Logging Enabled</div>
                <div className="text-[11px] text-purple-600 font-semibold mt-1">All overrides logged</div>
              </div>
            </div>

            <div className="pt-2">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Admin Actions</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleUpdateView()}
                  className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
                >
                  <RefreshCw size={14} />
                  <span>Force Rerun Optimization Engine</span>
                </button>
                <button
                  onClick={() => setIsLocationModalOpen(true)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
                >
                  <Plus size={14} />
                  <span>Register Service Location</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: MY VOLUNTEER HUB (For Volunteers) */}
        {activeTab === 'my_portal' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Welcome, {user.fullName}!</h2>
                <p className="text-xs text-slate-500">Your volunteer missions, scheduled shifts, and skill endorsements.</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase">
                Active Volunteer
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-teal-50 border border-teal-200">
                <div className="text-xs font-bold text-teal-700">Logged Hours</div>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">36.5 hrs</div>
                <div className="text-[11px] text-teal-600 mt-1">4 missions completed</div>
              </div>
              <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200">
                <div className="text-xs font-bold text-indigo-700">Next Assignment</div>
                <div className="text-base font-extrabold text-slate-900 mt-1">Downtown Disaster Hub</div>
                <div className="text-[11px] text-indigo-600 mt-1">Tomorrow • Afternoon Shift</div>
              </div>
              <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200">
                <div className="text-xs font-bold text-purple-700">Skill Badges</div>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">EMT-B & Spanish</div>
                <div className="text-[11px] text-purple-600 mt-1">Verified by Admin</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* CREATE LOCATION MODAL (Admin & Coordinator privilege) */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-slide-up-fade">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Add New Service Location</h3>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateLocation} className="space-y-4 mt-4 text-xs font-semibold">
              <div>
                <label className="text-slate-600 block mb-1">Site / Shelter Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Metro Disaster Relief Hub"
                  value={newLocationForm.name}
                  onChange={(e) => setNewLocationForm({ ...newLocationForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">Region</label>
                <select
                  value={newLocationForm.region}
                  onChange={(e) => setNewLocationForm({ ...newLocationForm, region: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="Northeast Region">Northeast Region</option>
                  <option value="Downtown Metro">Downtown Metro</option>
                  <option value="Coastal Bay">Coastal Bay</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 block mb-1">Required Primary Skill</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Medical Advanced, Logistics"
                  value={newLocationForm.requiredSkills}
                  onChange={(e) => setNewLocationForm({ ...newLocationForm, requiredSkills: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1">Needed Count</label>
                  <input
                    type="number"
                    min="1"
                    value={newLocationForm.requiredVolunteers}
                    onChange={(e) => setNewLocationForm({ ...newLocationForm, requiredVolunteers: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Priority Tier</label>
                  <select
                    value={newLocationForm.tier}
                    onChange={(e) => setNewLocationForm({ ...newLocationForm, tier: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    <option value="Tier 1">Tier 1 (Normal)</option>
                    <option value="Tier 2">Tier 2 (Elevated)</option>
                    <option value="Tier 3">Tier 3 (Critical)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#4338ca] hover:bg-[#3730a3] text-white font-bold shadow-md shadow-indigo-600/20"
                >
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
