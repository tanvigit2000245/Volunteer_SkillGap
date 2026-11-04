import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Tabs,
  Tab,
  Button,
  Snackbar,
  Alert,
  Typography,
  Stack,
  useTheme,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PsychologyIcon from '@mui/icons-material/Psychology';
import HistoryIcon from '@mui/icons-material/History';
import DownloadIcon from '@mui/icons-material/Download';

import { AppThemeProvider } from './theme/ThemeContext';
import { Navbar } from './components/Navbar';
import { StatsCards } from './components/StatsCards';
import { SkillGapAlertBanner } from './components/SkillGapAlertBanner';
import { DeploymentMatrix } from './components/DeploymentMatrix';
import { VolunteerPool } from './components/VolunteerPool';
import { OptimizerSimulator } from './components/OptimizerSimulator';
import { AuditLogTable } from './components/AuditLogTable';
import { ThemeDrawer } from './components/ThemeDrawer';
import { VolunPlanLandingPage } from './components/landing/VolunPlanLandingPage';
import { PlannerDashboard } from './components/planner/PlannerDashboard';

import {
  INITIAL_LOCATIONS,
  INITIAL_VOLUNTEERS,
  INITIAL_AUDIT_LOGS,
} from './data/mockData';

function DashboardApp({ onBackToLanding, initialTab = 0 }) {
  const theme = useTheme();
  const [locations, setLocations] = useState(INITIAL_LOCATIONS);
  const [volunteers, setVolunteers] = useState(INITIAL_VOLUNTEERS);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [themeDrawerOpen, setThemeDrawerOpen] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Calculate current total gaps
  const totalGaps = locations.reduce((sum, loc) => sum + loc.skillGaps.length, 0);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Quick Resolve: Auto-assigns Mateo Hernandez to Metro Shelter to fulfill Spanish and First Aid
  const handleQuickResolve = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setVolunteers((prev) =>
        prev.map((v) => {
          if (v.id === 'VOL-008') {
            return {
              ...v,
              status: 'Assigned',
              assignedTo: 'Metro Emergency Shelter - Ward A',
            };
          }
          return v;
        })
      );

      setLocations((prev) =>
        prev.map((loc) => {
          if (loc.id === 'LOC-101') {
            return {
              ...loc,
              assignedCount: loc.assignedCount + 1,
              urgency: 'Optimal',
              skillGaps: [],
              assignedVolunteers: [
                ...loc.assignedVolunteers,
                {
                  id: 'VOL-008',
                  name: 'Mateo Hernandez',
                  role: 'Bilingual EMT Lead',
                  proficiency: 5,
                  language: 'Spanish, English',
                  mobility: 'High',
                },
              ],
            };
          }
          return loc;
        })
      );

      setAuditLogs((prev) => [
        {
          id: `AUD-${Date.now().toString().slice(-3)}`,
          timestamp: new Date().toLocaleString(),
          coordinator: 'Constraint-Matching Engine (Auto-Solver)',
          action: 'Automated Gap Remediation',
          location: 'Metro Emergency Shelter - Ward A',
          volunteer: 'Mateo Hernandez (VOL-008)',
          justification: 'Satisfied hard Spanish language and Level 4+ First Aid requirements.',
          safetyAuditApproved: true,
        },
        ...prev,
      ]);

      setIsOptimizing(false);
      showSnackbar('Optimization complete: 2 critical skill gaps resolved at Metro Shelter!', 'success');
    }, 1200);
  };

  // Run Optimizer Simulation
  const handleRunOptimizer = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      handleQuickResolve();
      setIsOptimizing(false);
      showSnackbar('Constraint engine evaluated 24 decision variables successfully!', 'info');
    }, 1500);
  };

  // Manual Override Handler with audit trail
  const handleManualOverride = (locationId, volunteerId, justificationText) => {
    const candidate = volunteers.find((v) => v.id === volunteerId);
    const targetLoc = locations.find((l) => l.id === locationId);

    if (!candidate || !targetLoc) return;

    // Update volunteer
    setVolunteers((prev) =>
      prev.map((v) =>
        v.id === volunteerId
          ? { ...v, status: 'Assigned', assignedTo: targetLoc.name }
          : v
      )
    );

    // Update location
    setLocations((prev) =>
      prev.map((loc) => {
        if (loc.id === locationId) {
          return {
            ...loc,
            assignedCount: loc.assignedCount + 1,
            assignedVolunteers: [
              ...loc.assignedVolunteers,
              {
                id: candidate.id,
                name: candidate.name,
                role: candidate.title,
                proficiency: candidate.skills[0]?.level || 4,
                language: candidate.languages.join(', '),
                mobility: candidate.mobility,
              },
            ],
          };
        }
        return loc;
      })
    );

    // Add audit entry
    setAuditLogs((prev) => [
      {
        id: `AUD-${Date.now().toString().slice(-3)}`,
        timestamp: new Date().toLocaleString(),
        coordinator: 'Rohit Kumar (Lead Planner)',
        action: 'Manual Coordinator Override',
        location: targetLoc.name,
        volunteer: `${candidate.name} (${candidate.id})`,
        justification: justificationText,
        safetyAuditApproved: true,
      },
      ...prev,
    ]);

    showSnackbar(`Assigned ${candidate.name} with logged coordinator justification.`, 'success');
  };

  // Export Deployment Sheet
  const handleExportDeployment = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(locations, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Deployment_Sheet_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showSnackbar('Deployment schedule exported successfully!', 'success');
  };

  return (
    <Box sx={{ minHeight: '100vh', pb: 10 }}>
      {/* Top Navigation */}
      <Navbar
        onOpenThemeDrawer={() => setThemeDrawerOpen(true)}
        onRunOptimizer={handleRunOptimizer}
        isOptimizing={isOptimizing}
        onBackToLanding={onBackToLanding}
      />

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        {/* Page Title & Operational Actions Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
              Volunteer Deployment Control Center
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Project MCA-SP-029: Constraint-Driven Matching, Skill Sufficiency & Audit Logging
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={handleExportDeployment}
              sx={{ borderRadius: 3 }}
            >
              Export Deployment Sheet
            </Button>
          </Stack>
        </Box>

        {/* Dynamic 3D KPI Stats */}
        <StatsCards locations={locations} volunteers={volunteers} />

        {/* Skill-Gap Diagnostic Banner */}
        <SkillGapAlertBanner
          totalGaps={totalGaps}
          onQuickResolve={handleQuickResolve}
        />

        {/* Navigation Tabs */}
        <Box
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            mb: 4,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 700,
                fontSize: '0.95rem',
                minHeight: 48,
                textTransform: 'none',
              },
            }}
          >
            <Tab icon={<DashboardIcon fontSize="small" />} iconPosition="start" label="Deployment Matrix" />
            <Tab icon={<PeopleAltIcon fontSize="small" />} iconPosition="start" label={`Volunteer Pool (${volunteers.length})`} />
            <Tab icon={<PsychologyIcon fontSize="small" />} iconPosition="start" label="Constraint Optimizer" />
            <Tab icon={<HistoryIcon fontSize="small" />} iconPosition="start" label={`Audit Log (${auditLogs.length})`} />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        {activeTab === 0 && (
          <DeploymentMatrix
            locations={locations}
            volunteers={volunteers}
            onManualOverride={handleManualOverride}
          />
        )}

        {activeTab === 1 && (
          <VolunteerPool
            volunteers={volunteers}
            onAssignVolunteer={(id) => handleManualOverride('LOC-101', id, 'Direct coordinator assignment from volunteer pool.')}
          />
        )}

        {activeTab === 2 && (
          <OptimizerSimulator
            onRunOptimization={handleRunOptimizer}
            isOptimizing={isOptimizing}
          />
        )}

        {activeTab === 3 && (
          <AuditLogTable auditLogs={auditLogs} />
        )}
      </Container>

      {/* Slide-out Theme Customizer Drawer */}
      <ThemeDrawer
        open={themeDrawerOpen}
        onClose={() => setThemeDrawerOpen(false)}
      />

      {/* Toast Feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', borderRadius: 3 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default function App() {
  const [view, setView] = useState(() => {
    return localStorage.getItem('volunplan_view') || 'dashboard';
  });
  const [initialTab, setInitialTab] = useState(0);

  useEffect(() => {
    localStorage.setItem('volunplan_view', view);
  }, [view]);

  const handleOpenDashboard = (section) => {
    setView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToLanding = () => {
    setView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AppThemeProvider>
      {view === 'landing' ? (
        <VolunPlanLandingPage onOpenDashboard={handleOpenDashboard} />
      ) : (
        <PlannerDashboard onBackToLanding={handleBackToLanding} />
      )}
    </AppThemeProvider>
  );
}
