import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Stack,
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import { PlannerSidebarDock } from './PlannerSidebarDock';
import { PlannerHeader } from './PlannerHeader';
import { PlannerStatsRow } from './PlannerStatsRow';
import { LocationCard } from './LocationCard';
import { CandidateCard } from './CandidateCard';
import { DeploymentMatrix } from '../DeploymentMatrix';
import { VolunteerPool } from '../VolunteerPool';
import { OptimizerSimulator } from '../OptimizerSimulator';
import { AuditLogTable } from '../AuditLogTable';
import {
  INITIAL_LOCATIONS as MATRIX_LOCATIONS,
  INITIAL_VOLUNTEERS as ALL_VOLUNTEERS,
  INITIAL_AUDIT_LOGS as ALL_LOGS,
} from '../../data/mockData';

export const INITIAL_PLANNER_LOCATIONS = [
  {
    id: 'LOC-492',
    name: 'Downtown Disaster Hub',
    siteId: '492-DDH',
    percentage: 90,
    skillGapAlert:
      'Critical shortage: Medical Advanced. Short 2 volunteers to meet safety regulations.',
    tags: [
      { label: 'Level: Tier 3', bg: '#eff2fe', color: '#4338ca', border: '#c7d2fe' },
      { label: 'Spanish Required', bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
      { label: 'High Mobility', bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
    ],
  },
  {
    id: 'LOC-221',
    name: 'North Shore Shelter',
    siteId: '221-NSS',
    percentage: 100,
    skillGapAlert: null,
    tags: [
      { label: 'Level: Tier 1', bg: '#eff2fe', color: '#4338ca', border: '#c7d2fe' },
      { label: 'No Lang. Req.', bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' },
    ],
  },
];

export const INITIAL_PLANNER_CANDIDATES = [
  {
    id: 'CAND-01',
    name: 'Sarah Jenkins',
    credentials: 'EMT-B certified • 6y Exp',
    matchRate: 98,
    skills: ['MEDICAL ADV.', 'SPANISH C1'],
    status: 'Available',
    category: 'eligible',
    avatarUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 'CAND-02',
    name: 'Marcus Thorne',
    credentials: 'Paramedic • 12y Exp',
    matchRate: 92,
    skills: ['MEDICAL ADV.', 'LOGISTICS'],
    status: 'Available',
    category: 'eligible',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 'CAND-03',
    name: 'Elena Rodriguez',
    credentials: 'Nurse • 4y Exp',
    matchRate: 84,
    skills: ['SPANISH B2'],
    status: 'NotAvailable',
    category: 'eligible',
    avatarUrl:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 'CAND-04',
    name: 'David Kim',
    credentials: 'First Responder • 3y Exp',
    matchRate: 79,
    skills: ['FIRST AID', 'TRIAGE LEAD'],
    status: 'Available',
    category: 'suitable',
    avatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 'CAND-05',
    name: 'Amina Al-Mansoor',
    credentials: 'Trauma Coordinator • 5y Exp',
    matchRate: 75,
    skills: ['COMMUNICATIONS', 'ARABIC C2'],
    status: 'Available',
    category: 'suitable',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
  },
];

export const PlannerDashboard = () => {
  const navigate = useNavigate();
  const onBackToLanding = () => navigate('/');

  const [locations, setLocations] = useState(INITIAL_PLANNER_LOCATIONS);
  const [candidates, setCandidates] = useState(INITIAL_PLANNER_CANDIDATES);
  const [activeTab, setActiveTab] = useState('planner');
  const [filterMode, setFilterMode] = useState('Actually Eligible'); // 'Actually Eligible' | 'Potentially Suitable'
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Stats
  const [totalVolunteers, setTotalVolunteers] = useState(1284);
  const [staffingCoverage, setStaffingCoverage] = useState(82);
  const [activeGaps, setActiveGaps] = useState(12);
  const [pendingReviews, setPendingReviews] = useState(45);

  // Additional matrix data state
  const [matrixLocations, setMatrixLocations] = useState(MATRIX_LOCATIONS);
  const [allVolunteers, setAllVolunteers] = useState(ALL_VOLUNTEERS);
  const [auditLogs, setAuditLogs] = useState(ALL_LOGS);

  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const handleUpdateView = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Regional volunteer skill-gap metrics updated to latest shift data.', 'info');
    }, 600);
  };

  const handleAssignCandidate = (candidate) => {
    // Assign candidate to Downtown Disaster Hub
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidate.id ? { ...c, status: 'Assigned' } : c))
    );

    // Resolve Downtown Disaster Hub
    setLocations((prev) =>
      prev.map((loc) => {
        if (loc.id === 'LOC-492') {
          return {
            ...loc,
            percentage: 100,
            skillGapAlert: null,
          };
        }
        return loc;
      })
    );

    // Update KPI stats
    setActiveGaps((prev) => Math.max(0, prev - 2));
    setStaffingCoverage((prev) => Math.min(100, prev + 12));
    setPendingReviews((prev) => Math.max(0, prev - 1));

    showToast(
      `Successfully deployed ${candidate.name} to Downtown Disaster Hub (492-DDH)! Skill-gap resolved.`,
      'success'
    );
  };

  const handleSidebarTabSelect = (tabId) => {
    setActiveTab(tabId);
    if (tabId !== 'planner' && onNavigateSection) {
      onNavigateSection(tabId);
    }
  };

  const visibleCandidates = candidates.filter((c) => {
    if (filterMode === 'Actually Eligible') {
      return c.category === 'eligible';
    }
    return c.category === 'suitable' || c.matchRate >= 75;
  });

  return (
    <Box
      sx={{
        bgcolor: '#f1f4fb',
        minHeight: '100vh',
        py: { xs: 2.5, md: 4 },
        px: { xs: 2, md: 4, lg: 5 },
        position: 'relative',
      }}
    >
      {/* Background soft ambient radial gradient */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: '10%',
          width: '80%',
          height: '60%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <Box
        sx={{
          display: 'flex',
          gap: { xs: 2.5, md: 3.5 },
          position: 'relative',
          zIndex: 1,
          maxWidth: 1400,
          mx: 'auto',
        }}
      >
        {/* 1. Left Floating Sidebar Dock */}
        <PlannerSidebarDock
          activeTab={activeTab}
          onSelectTab={handleSidebarTabSelect}
          onBackToLanding={onBackToLanding}
        />

        {/* 2. Main Dashboard Area */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Top Header & Filter Pill Bar */}
          <PlannerHeader
            onUpdateView={handleUpdateView}
            isRefreshing={isRefreshing}
          />

          {/* Top 4 KPI Stat Cards */}
          <PlannerStatsRow
            totalVolunteers={totalVolunteers}
            staffingCoverage={staffingCoverage}
            activeGaps={activeGaps}
            pendingReviews={pendingReviews}
          />

          {/* Main Content: Planner View or Sub Tabs */}
          {activeTab === 'planner' && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '1fr 1.25fr' },
                gap: 3.5,
                alignItems: 'start',
              }}
            >
              {/* Left Column: Location Requirements */}
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2.5,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      fontSize: '1.18rem',
                      color: '#0f172a',
                    }}
                  >
                    Location Requirements
                  </Typography>

                  <Chip
                    label="3 SITES ACTIVE"
                    size="small"
                    sx={{
                      bgcolor: '#eff2fe',
                      color: '#4338ca',
                      fontWeight: 800,
                      fontSize: '0.68rem',
                      letterSpacing: '0.05em',
                      borderRadius: '9999px',
                      height: 24,
                      border: '1px solid #c7d2fe',
                    }}
                  />
                </Box>

                {/* Location Cards */}
                {locations.map((loc) => (
                  <LocationCard key={loc.id} location={loc} />
                ))}
              </Box>

              {/* Right Column: Candidate Matching Pool */}
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2.5,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      fontSize: '1.18rem',
                      color: '#0f172a',
                    }}
                  >
                    Candidate Matching Pool
                  </Typography>

                  {/* Segmented Toggle Pills: Actually Eligible vs Potentially Suitable */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      bgcolor: '#ffffff',
                      p: '4px',
                      borderRadius: '9999px',
                      border: '1px solid rgba(226, 232, 240, 0.8)',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                    }}
                  >
                    <Box
                      onClick={() => setFilterMode('Actually Eligible')}
                      sx={{
                        px: 1.8,
                        py: 0.5,
                        borderRadius: '9999px',
                        cursor: 'pointer',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        transition: 'all 0.2s',
                        bgcolor:
                          filterMode === 'Actually Eligible' ? '#4338ca' : 'transparent',
                        color:
                          filterMode === 'Actually Eligible' ? '#ffffff' : '#64748b',
                        boxShadow:
                          filterMode === 'Actually Eligible'
                            ? '0 2px 8px rgba(67, 56, 202, 0.35)'
                            : 'none',
                      }}
                    >
                      Actually Eligible
                    </Box>

                    <Box
                      onClick={() => setFilterMode('Potentially Suitable')}
                      sx={{
                        px: 1.8,
                        py: 0.5,
                        borderRadius: '9999px',
                        cursor: 'pointer',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        transition: 'all 0.2s',
                        bgcolor:
                          filterMode === 'Potentially Suitable' ? '#4338ca' : 'transparent',
                        color:
                          filterMode === 'Potentially Suitable' ? '#ffffff' : '#64748b',
                        boxShadow:
                          filterMode === 'Potentially Suitable'
                            ? '0 2px 8px rgba(67, 56, 202, 0.35)'
                            : 'none',
                      }}
                    >
                      Potentially Suitable
                    </Box>
                  </Box>
                </Box>

                {/* Candidate Cards */}
                {visibleCandidates.map((c) => (
                  <CandidateCard
                    key={c.id}
                    candidate={c}
                    onAssign={handleAssignCandidate}
                  />
                ))}
              </Box>
            </Box>
          )}

          {activeTab === 'matrix' && (
            <DeploymentMatrix
              locations={matrixLocations}
              onAssign={(locId, vol) => {
                showToast(`Assigned ${vol.name} to ${locId}`, 'success');
              }}
              onOverride={(locId, override) => {
                showToast(`Override applied to ${locId}: ${override.reason}`, 'warning');
              }}
            />
          )}

          {activeTab === 'volunteers' && (
            <VolunteerPool volunteers={allVolunteers} />
          )}

          {activeTab === 'optimizer' && (
            <OptimizerSimulator
              locations={matrixLocations}
              volunteers={allVolunteers}
              onApplyPlan={() => {
                showToast('AI Optimization plan deployed across all zones!', 'success');
              }}
            />
          )}

          {activeTab === 'audit' && (
            <AuditLogTable auditLogs={auditLogs} />
          )}
        </Box>
      </Box>

      {/* Toast Feedback */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4500}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity={toast.severity}
          sx={{ width: '100%', borderRadius: 3, fontWeight: 600 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
