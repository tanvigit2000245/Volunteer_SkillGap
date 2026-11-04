import { Box, Card, CardContent, Typography, Grid, useTheme, alpha } from '@mui/material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export const StatsCards = ({ locations, volunteers }) => {
  const theme = useTheme();

  // Compute live dynamic statistics
  const totalVolunteers = volunteers.length;
  const assignedVolunteers = volunteers.filter((v) => v.status === 'Assigned').length;
  const availableVolunteers = totalVolunteers - assignedVolunteers;

  const totalRequired = locations.reduce((acc, loc) => acc + loc.requiredHeadcount, 0);
  const totalAssigned = locations.reduce((acc, loc) => acc + loc.assignedCount, 0);
  const fillRate = Math.round((totalAssigned / totalRequired) * 100);

  const totalSkillGaps = locations.reduce((acc, loc) => acc + loc.skillGaps.length, 0);
  const activeLocationsCount = locations.length;

  const cardsData = [
    {
      title: 'Volunteers Registered',
      value: totalVolunteers,
      subtext: `${availableVolunteers} ready for deployment`,
      trend: '+12% this week',
      icon: <PeopleAltIcon sx={{ fontSize: 28 }} />,
      color: theme.palette.primary.main,
      bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`,
    },
    {
      title: 'Deployment Fill Rate',
      value: `${fillRate}%`,
      subtext: `${totalAssigned} of ${totalRequired} positions filled`,
      trend: 'Target: >90%',
      icon: <CheckCircleIcon sx={{ fontSize: 28 }} />,
      color: theme.palette.success.main,
      bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.15)} 0%, ${alpha(theme.palette.success.main, 0.03)} 100%)`,
    },
    {
      title: 'Skill-Gap Alerts',
      value: totalSkillGaps,
      subtext: 'Unresolved constraint conflicts',
      trend: totalSkillGaps > 0 ? 'Requires coordinator action' : 'All skills fulfilled',
      icon: <WarningAmberIcon sx={{ fontSize: 28 }} />,
      color: totalSkillGaps > 0 ? theme.palette.error.main : theme.palette.success.main,
      bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.15)} 0%, ${alpha(theme.palette.error.main, 0.03)} 100%)`,
      highlightPulse: totalSkillGaps > 0,
    },
    {
      title: 'Service Locations',
      value: activeLocationsCount,
      subtext: 'Active operational response sites',
      trend: '4 Active shifts',
      icon: <LocationCityIcon sx={{ fontSize: 28 }} />,
      color: theme.palette.secondary.main,
      bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.15)} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
    },
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={3}>
        {cardsData.map((stat, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              className="card-3d-hover"
              sx={{
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                background: stat.bgGradient,
                border: `1px solid ${alpha(stat.color, 0.25)}`,
                borderRadius: 4,
                boxShadow: `0 10px 24px -6px ${alpha(stat.color, 0.12)}`,
              }}
            >
              {/* Subtle top indicator bar */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  bgcolor: stat.color,
                }}
              />

              <CardContent sx={{ p: 2.5, position: 'relative' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    {stat.title}
                  </Typography>
                  <Box
                    sx={{
                      width: 46,
                      height: 46,
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(stat.color, 0.12),
                      color: stat.color,
                      boxShadow: `0 4px 10px ${alpha(stat.color, 0.2)}`,
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>

                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    color: 'text.primary',
                    lineHeight: 1.1,
                    mb: 0.8,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {stat.value}
                </Typography>

                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                  {stat.subtext}
                </Typography>

                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1.2,
                    py: 0.4,
                    borderRadius: 2,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    bgcolor: alpha(stat.color, 0.1),
                    color: stat.color,
                  }}
                >
                  <TrendingUpIcon sx={{ fontSize: 14 }} />
                  {stat.trend}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
