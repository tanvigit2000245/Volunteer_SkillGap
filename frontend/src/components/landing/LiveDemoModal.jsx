import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  IconButton,
  LinearProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export const LiveDemoModal = ({ open, onClose, onLaunchFullApp }) => {
  const [step, setStep] = useState(0);
  const [matchScore, setMatchScore] = useState(72);
  const [status, setStatus] = useState('Critical Gaps Identified');

  const handleSimulate = () => {
    setStep(1);
    setStatus('AI Matching In Progress...');
    setTimeout(() => {
      setStep(2);
      setMatchScore(98.4);
      setStatus('Optimal Deployment Resolved!');
    }, 1200);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          p: 1.5,
          bgcolor: '#ffffff',
          boxShadow: '0 25px 60px -10px rgba(15, 23, 42, 0.3)',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              bgcolor: 'rgba(99, 102, 241, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6366f1',
            }}
          >
            <AutoAwesomeIcon />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
              VolunPlan AI Optimizer Demo
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Watch automated skill-matching solve urgent shelter shortages
            </Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 2 }}>
        {/* Progress simulation state */}
        <Box
          sx={{
            p: 3,
            bgcolor: '#f8fafc',
            borderRadius: '18px',
            border: '1px solid #e2e8f0',
            mb: 3,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
              Emergency Ward: Metro Shelter - Ward A
            </Typography>
            <Chip
              label={status}
              size="small"
              sx={{
                bgcolor: step === 2 ? '#dcfce7' : '#fee2e2',
                color: step === 2 ? '#15803d' : '#b91c1c',
                fontWeight: 700,
                fontSize: '0.75rem',
              }}
            />
          </Box>

          <Typography sx={{ fontSize: '0.84rem', color: '#64748b', mb: 2 }}>
            Missing Critical Skills:{' '}
            <strong style={{ color: step === 2 ? '#059669' : '#dc2626' }}>
              {step === 2 ? 'All Fulfillments Complete' : 'Bilingual (Spanish) & First Aid Lead'}
            </strong>
          </Typography>

          {/* Match Rate Bar */}
          <Box sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
                Platform Match Fulfillment
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: '#6366f1', fontWeight: 800 }}>
                {matchScore}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={matchScore}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: '#e2e8f0',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #6366f1 0%, #10b981 100%)',
                },
              }}
            />
          </Box>

          {step === 2 && (
            <Box
              sx={{
                mt: 2.5,
                p: 2,
                bgcolor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #bbf7d0',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 28 }} />
              <Box>
                <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                  Auto-Dispatched: Mateo Hernandez (VOL-008)
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: '#475569' }}>
                  Role: Bilingual EMT Lead · Proficiency 5/5 · Proximity: 2.1 miles
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        <Stack direction="row" spacing={2} justifyContent="center">
          {step !== 2 ? (
            <Button
              variant="contained"
              onClick={handleSimulate}
              disabled={step === 1}
              startIcon={<AutoAwesomeIcon />}
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                color: '#ffffff',
                borderRadius: '9999px',
                px: 3.5,
                py: 1.2,
                fontWeight: 700,
                textTransform: 'none',
              }}
            >
              {step === 1 ? 'Matching Candidates...' : 'Run 1-Click Auto Dispatch'}
            </Button>
          ) : (
            <Button
              variant="outlined"
              onClick={() => {
                setStep(0);
                setMatchScore(72);
                setStatus('Critical Gaps Identified');
              }}
              sx={{
                borderRadius: '9999px',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Reset Simulation
            </Button>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, pt: 1, justifyContent: 'space-between' }}>
        <Button onClick={onClose} sx={{ color: '#64748b', textTransform: 'none' }}>
          Close Preview
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            onClose();
            onLaunchFullApp();
          }}
          endIcon={<ArrowForwardIcon />}
          sx={{
            bgcolor: '#0f172a',
            color: '#ffffff',
            borderRadius: '9999px',
            px: 3,
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': { bgcolor: '#1e293b' },
          }}
        >
          Open Full Dispatch Engine
        </Button>
      </DialogActions>
    </Dialog>
  );
};

