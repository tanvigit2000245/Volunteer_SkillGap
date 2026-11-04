import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  IconButton,
  InputAdornment,
  Divider,
  Fade,
  CircularProgress,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../context/AuthContext';
import { VolunPlanLogo } from '../landing/LandingNavbar';

export const AuthPage = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
  });

  const { login, register, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Where should we go after auth?
  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!form.email.trim() || !form.password) {
      setError('Email and password are required.');
      return;
    }
    if (mode === 'register' && !form.fullName.trim()) {
      setError('Full name is required.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    let result;
    if (mode === 'register') {
      result = await register({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
    } else {
      result = await login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
    }

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message || 'Something went wrong. Please try again.');
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'register' : 'login'));
    setError('');
  };

  const isRegister = mode === 'register';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f6f5fa',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background ambient blobs */}
      <Box
        sx={{
          position: 'fixed',
          top: '-10%',
          right: '-5%',
          width: 600,
          height: 600,
          background:
            'radial-gradient(circle, rgba(139, 92, 246, 0.18) 0%, transparent 65%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'fixed',
          bottom: '-10%',
          left: '-5%',
          width: 500,
          height: 500,
          background:
            'radial-gradient(circle, rgba(99, 102, 241, 0.14) 0%, transparent 65%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Bar: Logo + Back */}
      <Box sx={{ px: { xs: 3, md: 6 }, pt: { xs: 3, md: 4 }, position: 'relative', zIndex: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box
            onClick={() => navigate('/')}
            sx={{ cursor: 'pointer' }}
          >
            <VolunPlanLogo />
          </Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{
              color: '#64748b',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.88rem',
              '&:hover': { color: '#4338ca' },
            }}
          >
            Back to Home
          </Button>
        </Stack>
      </Box>

      {/* Centered Card */}
      <Container
        maxWidth="sm"
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Fade in timeout={500}>
          <Box
            sx={{
              width: '100%',
              bgcolor: '#ffffff',
              borderRadius: '28px',
              border: '1px solid rgba(226, 232, 240, 0.85)',
              boxShadow:
                '0 25px 60px -12px rgba(99, 102, 241, 0.1), 0 8px 24px rgba(0, 0, 0, 0.03)',
              p: { xs: 4, sm: 5.5 },
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Decorative top-right accent */}
            <Box
              sx={{
                position: 'absolute',
                top: -40,
                right: -40,
                width: 130,
                height: 130,
                borderRadius: '50%',
                background: 'rgba(238, 242, 255, 0.6)',
                pointerEvents: 'none',
              }}
            />

            {/* Header */}
            <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', mb: 4 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '1.6rem', sm: '1.9rem' },
                  color: '#0f172a',
                  letterSpacing: '-0.02em',
                  mb: 1,
                }}
              >
                {isRegister ? 'Join VolunPlan' : 'Welcome Back'}
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: '#64748b', fontSize: '0.95rem' }}
              >
                {isRegister
                  ? 'Create your account and start volunteering today.'
                  : 'Sign in to access the Deployment Planner.'}
              </Typography>
            </Box>

            {/* Error Banner */}
            {error && (
              <Alert
                severity="error"
                sx={{ mb: 3, borderRadius: 3 }}
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            )}

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2.8}>
                {/* Full Name (register only) */}
                {isRegister && (
                  <Box>
                    <Typography
                      sx={{
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: '#334155',
                        mb: 0.8,
                      }}
                    >
                      Full Name
                    </Typography>
                    <TextField
                      fullWidth
                      name="fullName"
                      placeholder="Jane Doe"
                      value={form.fullName}
                      onChange={handleChange}
                      autoComplete="name"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: '#f8fafc',
                          borderRadius: '14px',
                          fontSize: '0.92rem',
                          '& fieldset': { borderColor: '#e2e8f0' },
                          '&:hover fieldset': { borderColor: '#cbd5e1' },
                          '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                        },
                      }}
                    />
                  </Box>
                )}

                {/* Email */}
                <Box>
                  <Typography
                    sx={{
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#334155',
                      mb: 0.8,
                    }}
                  >
                    Email Address
                  </Typography>
                  <TextField
                    fullWidth
                    name="email"
                    type="email"
                    placeholder="you@organization.org"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#f8fafc',
                        borderRadius: '14px',
                        fontSize: '0.92rem',
                        '& fieldset': { borderColor: '#e2e8f0' },
                        '&:hover fieldset': { borderColor: '#cbd5e1' },
                        '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                      },
                    }}
                  />
                </Box>

                {/* Password */}
                <Box>
                  <Typography
                    sx={{
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#334155',
                      mb: 0.8,
                    }}
                  >
                    Password
                  </Typography>
                  <TextField
                    fullWidth
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={isRegister ? 'Min 8 characters' : '••••••••'}
                    value={form.password}
                    onChange={handleChange}
                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            edge="end"
                            onClick={() => setShowPassword((p) => !p)}
                            sx={{ color: '#94a3b8' }}
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#f8fafc',
                        borderRadius: '14px',
                        fontSize: '0.92rem',
                        '& fieldset': { borderColor: '#e2e8f0' },
                        '&:hover fieldset': { borderColor: '#cbd5e1' },
                        '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                      },
                    }}
                  />
                </Box>

                {/* Submit */}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                    color: '#ffffff',
                    borderRadius: '14px',
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    boxShadow: '0 8px 22px -4px rgba(99, 102, 241, 0.45)',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4f46e5 0%, #6d28d9 100%)',
                      boxShadow: '0 12px 28px -4px rgba(99, 102, 241, 0.55)',
                      transform: 'translateY(-1px)',
                    },
                    '&:disabled': {
                      background: '#cbd5e1',
                      color: '#ffffff',
                      boxShadow: 'none',
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={22} sx={{ color: '#ffffff' }} />
                  ) : isRegister ? (
                    'Create Account & Start Volunteering'
                  ) : (
                    'Sign In to Dashboard'
                  )}
                </Button>
              </Stack>
            </Box>

            {/* Divider + Toggle */}
            <Divider sx={{ my: 3.5, borderColor: '#f1f5f9' }} />

            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.9rem', color: '#64748b' }}>
                {isRegister ? 'Already have an account?' : "Don't have an account?"}
                <Box
                  component="span"
                  onClick={toggleMode}
                  sx={{
                    ml: 0.8,
                    fontWeight: 700,
                    color: '#6366f1',
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                    '&:hover': { color: '#4338ca' },
                  }}
                >
                  {isRegister ? 'Sign In' : 'Register Now'}
                </Box>
              </Typography>
            </Box>
          </Box>
        </Fade>
      </Container>

      {/* Bottom copyright */}
      <Box
        sx={{
          textAlign: 'center',
          py: 3,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Typography sx={{ fontSize: '0.78rem', color: '#94a3b8' }}>
          © 2026 VolunPlan. Secure volunteer deployment platform.
        </Typography>
      </Box>
    </Box>
  );
};

