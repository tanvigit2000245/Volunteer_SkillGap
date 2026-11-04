import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
  useTheme,
  alpha,
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import BlockIcon from '@mui/icons-material/Block';

export const AuditLogTable = ({ auditLogs }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        borderRadius: 4,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.shadows[2],
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2.5,
              bgcolor: alpha(theme.palette.secondary.main, 0.12),
              color: theme.palette.secondary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HistoryIcon />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Coordinator Review & Manual Override Audit Log
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Immutable audit trail satisfying Project Spec MCA-SP-029 governance rules
            </Typography>
          </Box>
        </Box>

        <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: alpha(theme.palette.text.primary, 0.04) }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Log ID / Timestamp</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Coordinator</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Target Location & Volunteer</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Override Action & Justification</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Safety Audit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {log.id}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      {log.timestamp}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {log.coordinator}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {log.location}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'primary.main', display: 'block' }}>
                      {log.volunteer}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 350 }}>
                    <Chip
                      label={log.action}
                      size="small"
                      sx={{ fontWeight: 700, mb: 0.5, fontSize: '0.7rem' }}
                    />
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                      {log.justification}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {log.safetyAuditApproved ? (
                      <Chip
                        icon={<VerifiedUserIcon fontSize="small" />}
                        label="Approved"
                        size="small"
                        color="success"
                        sx={{ fontWeight: 700 }}
                      />
                    ) : (
                      <Chip
                        icon={<BlockIcon fontSize="small" />}
                        label="Denied"
                        size="small"
                        color="error"
                        sx={{ fontWeight: 700 }}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};
