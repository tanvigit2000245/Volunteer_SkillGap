import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Rating,
  Button,
  Stack,
  useTheme,
  alpha,
  LinearProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TranslateIcon from '@mui/icons-material/Translate';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';

export const VolunteerPool = ({ volunteers, onAssignVolunteer }) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredVolunteers = volunteers.filter((vol) => {
    const matchesSearch =
      vol.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vol.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vol.skills.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      vol.languages.some((l) => l.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter === 'AVAILABLE') return vol.status === 'Available';
    if (statusFilter === 'ASSIGNED') return vol.status === 'Assigned';
    return true;
  });

  return (
    <Box>
      {/* Header and Filter Row */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Volunteer Profiles & Suitability Pool
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Multi-dimensional skill proficiencies (1-5), languages, mobility ratings, and eligibility
          </Typography>
        </Box>

        {/* Filter Chips */}
        <Stack direction="row" spacing={1}>
          <Chip
            label={`All (${volunteers.length})`}
            color={statusFilter === 'ALL' ? 'primary' : 'default'}
            onClick={() => setStatusFilter('ALL')}
            sx={{ fontWeight: 600, cursor: 'pointer' }}
          />
          <Chip
            label={`Available (${volunteers.filter((v) => v.status === 'Available').length})`}
            color={statusFilter === 'AVAILABLE' ? 'primary' : 'default'}
            onClick={() => setStatusFilter('AVAILABLE')}
            sx={{ fontWeight: 600, cursor: 'pointer' }}
          />
          <Chip
            label={`Assigned (${volunteers.filter((v) => v.status === 'Assigned').length})`}
            color={statusFilter === 'ASSIGNED' ? 'primary' : 'default'}
            onClick={() => setStatusFilter('ASSIGNED')}
            sx={{ fontWeight: 600, cursor: 'pointer' }}
          />
        </Stack>
      </Box>

      {/* Search Input */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by volunteer name, skill (e.g. First Aid, Logistics, Translation) or language..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: theme.palette.background.paper,
            },
          }}
        />
      </Box>

      {/* Volunteers Grid */}
      <Grid container spacing={3}>
        {filteredVolunteers.map((vol) => {
          const isAssigned = vol.status === 'Assigned';

          return (
            <Grid key={vol.id} size={{ xs: 12, md: 6, lg: 4 }}>
              <Card
                className="card-3d-hover"
                sx={{
                  borderRadius: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: isAssigned
                    ? `1px solid ${alpha(theme.palette.text.primary, 0.08)}`
                    : `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                  boxShadow: isAssigned ? theme.shadows[1] : `0 8px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Top Profile Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar
                      src={vol.avatar}
                      alt={vol.name}
                      sx={{
                        width: 56,
                        height: 56,
                        boxShadow: `0 4px 12px ${alpha(theme.palette.text.primary, 0.15)}`,
                        border: `2px solid ${theme.palette.background.paper}`,
                      }}
                    />
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, noWrap: true }}>
                          {vol.name}
                        </Typography>
                        <Chip
                          label={vol.status}
                          size="small"
                          color={isAssigned ? 'default' : 'success'}
                          sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {vol.title} • {vol.experienceYears}y exp
                      </Typography>
                    </Box>
                  </Box>

                  {/* Match Suitability Score */}
                  <Box sx={{ mb: 2, p: 1.5, borderRadius: 2.5, bgcolor: alpha(theme.palette.primary.main, 0.06) }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                        Eligibility & Suitability Score:
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
                        {vol.matchScore}% Match
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={vol.matchScore}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.text.primary, 0.08),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: vol.matchScore > 90 ? theme.palette.primary.main : theme.palette.secondary.main,
                        },
                      }}
                    />
                    {vol.recommendationReason && (
                      <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600, display: 'block', mt: 0.8 }}>
                        💡 {vol.recommendationReason}
                      </Typography>
                    )}
                  </Box>

                  {/* Skills with Proficiencies */}
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                    Skills & Certified Proficiencies:
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, my: 1 }}>
                    {vol.skills.map((skill, sIdx) => (
                      <Box key={sIdx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {skill.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Rating
                            value={skill.level}
                            max={5}
                            readOnly
                            size="small"
                            sx={{
                              fontSize: '0.85rem',
                              color: theme.palette.primary.main,
                            }}
                          />
                          <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 20, textAlign: 'right' }}>
                            {skill.level}/5
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  {/* Languages, Mobility, Availability */}
                  <Box sx={{ mt: 'auto', pt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
                      <TranslateIcon sx={{ fontSize: 16, color: theme.palette.secondary.main }} />
                      {vol.languages.join(' • ')}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
                      <DirectionsRunIcon sx={{ fontSize: 16, color: theme.palette.info.main }} />
                      Mobility: <strong>{vol.mobility}</strong> | Slots: <strong>{vol.availability}</strong>
                    </Box>

                    {isAssigned ? (
                      <Box
                        sx={{
                          mt: 1,
                          p: 1,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.success.main, 0.08),
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          color: theme.palette.success.main,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        <CheckCircleOutlinedIcon sx={{ fontSize: 16 }} />
                        Deployed at {vol.assignedTo}
                      </Box>
                    ) : (
                      <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        onClick={() => onAssignVolunteer(vol.id)}
                        sx={{ mt: 1, borderRadius: 2 }}
                      >
                        Deploy to Bottleneck Site
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};
