import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  Fade,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';

export const ContactSection = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ firstName: '', email: '', message: '' });
      setTimeout(() => setSubmitted(false), 6000);
    }, 600);
  };

  return (
    <Box id="contact" sx={{ py: { xs: 8, md: 12 }, position: 'relative' }}>
      <Container maxWidth="md">
        {/* Main Card with Corner Abstract Accents */}
        <Box
          sx={{
            position: 'relative',
            bgcolor: '#ffffff',
            borderRadius: '28px',
            border: '1px solid #f0f2f8',
            boxShadow: '0 20px 50px -12px rgba(99, 102, 241, 0.08), 0 4px 16px rgba(0,0,0,0.02)',
            p: { xs: 4, sm: 6, md: 7 },
            overflow: 'hidden',
          }}
        >
          {/* Top-Right Decorative Pastel Lilac Wave Accent */}
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 170,
              height: 170,
              borderRadius: '50%',
              bgcolor: 'rgba(238, 242, 255, 0.7)',
              zIndex: 0,
              pointerEvents: 'none',
            }}
          />

          {/* Bottom-Left Decorative Pastel Lilac Accent */}
          <Box
            sx={{
              position: 'absolute',
              bottom: -40,
              left: -40,
              width: 140,
              height: 140,
              borderRadius: '50%',
              bgcolor: 'rgba(245, 243, 255, 0.8)',
              zIndex: 0,
              pointerEvents: 'none',
            }}
          />

          {/* Form Content */}
          <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', sm: '2.5rem' },
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.02em',
                mb: 1.5,
              }}
            >
              Ready to Optimize?
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.95rem', sm: '1.02rem' },
                color: '#64748b',
                mb: 4.5,
                maxWidth: 480,
                mx: 'auto',
              }}
            >
              Connect with our team to get a personalized demo of the dispatch system.
            </Typography>

            {submitted && (
              <Fade in={submitted}>
                <Alert
                  icon={<CheckCircleOutlineIcon fontSize="inherit" />}
                  severity="success"
                  sx={{
                    mb: 3,
                    borderRadius: 3,
                    maxWidth: 520,
                    mx: 'auto',
                    textAlign: 'left',
                  }}
                >
                  Thank you! Your demo request has been received. Our dispatch specialist
                  will reach out within 24 hours.
                </Alert>
              </Fade>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 580, mx: 'auto' }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2.5,
                  mb: 2.5,
                }}
              >
                <Box sx={{ textAlign: 'left' }}>
                  <Typography
                    sx={{
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#334155',
                      mb: 0.8,
                    }}
                  >
                    First Name
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Jane Doe"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#f8fafc',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        '& fieldset': { borderColor: '#e2e8f0' },
                        '&:hover fieldset': { borderColor: '#cbd5e1' },
                        '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                      },
                    }}
                  />
                </Box>

                <Box sx={{ textAlign: 'left' }}>
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
                    required
                    type="email"
                    placeholder="jane@organization.org"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#f8fafc',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        '& fieldset': { borderColor: '#e2e8f0' },
                        '&:hover fieldset': { borderColor: '#cbd5e1' },
                        '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                      },
                    }}
                  />
                </Box>
              </Box>

              <Box sx={{ textAlign: 'left', mb: 3.5 }}>
                <Typography
                  sx={{
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#334155',
                    mb: 0.8,
                  }}
                >
                  Message
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Tell us about your organization and dispatch needs..."
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#f8fafc',
                      borderRadius: '14px',
                      fontSize: '0.9rem',
                      '& fieldset': { borderColor: '#e2e8f0' },
                      '&:hover fieldset': { borderColor: '#cbd5e1' },
                      '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                    },
                  }}
                />
              </Box>

              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                endIcon={<SendIcon sx={{ fontSize: '16px !important' }} />}
                sx={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                  color: '#ffffff',
                  borderRadius: '9999px',
                  px: 4.5,
                  py: 1.35,
                  fontSize: '0.94rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0 8px 22px -4px rgba(99, 102, 241, 0.45)',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #6d28d9 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 26px -4px rgba(99, 102, 241, 0.55)',
                  },
                }}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
