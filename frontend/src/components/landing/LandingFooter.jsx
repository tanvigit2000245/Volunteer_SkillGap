import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  IconButton,
  TextField,
  InputAdornment,
  Divider,
} from '@mui/material';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LanguageIcon from '@mui/icons-material/Language';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckIcon from '@mui/icons-material/Check';
import { VolunPlanLogo } from './LandingNavbar';

export const LandingFooter = ({ onPlatformClick, onNavigateSection }) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubscribed(true);
    setNewsletterEmail('');
    setTimeout(() => setSubscribed(false), 5000);
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#ffffff',
        borderTop: '1px solid #f1f3f9',
        pt: { xs: 8, md: 10 },
        pb: { xs: 4, md: 5 },
        position: 'relative',
      }}
    >
      <Container maxWidth="lg">
        {/* Main 4-Column Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1.4fr 1fr 1fr 1.3fr' },
            gap: { xs: 4, md: 5 },
            mb: { xs: 6, md: 8 },
          }}
        >
          {/* Column 1: Brand & Bio */}
          <Box>
            <Box mb={2}>
              <VolunPlanLogo size={32} />
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: '#64748b',
                lineHeight: 1.65,
                mb: 3,
                maxWidth: 290,
                fontSize: '0.88rem',
              }}
            >
              Empowering social impact through intelligent volunteer allocation and
              real-time dispatch planning.
            </Typography>

            {/* Social Icons */}
            <Stack direction="row" spacing={1}>
              <IconButton
                size="small"
                sx={{
                  color: '#64748b',
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  '&:hover': { color: '#6366f1', borderColor: '#6366f1' },
                }}
              >
                <TwitterIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                sx={{
                  color: '#64748b',
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  '&:hover': { color: '#6366f1', borderColor: '#6366f1' },
                }}
              >
                <LinkedInIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                sx={{
                  color: '#64748b',
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  '&:hover': { color: '#6366f1', borderColor: '#6366f1' },
                }}
              >
                <LanguageIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>

          {/* Column 2: PLATFORM */}
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: '#0f172a',
                fontSize: '0.82rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                mb: 2.2,
              }}
            >
              Platform
            </Typography>
            <Stack spacing={1.4}>
              {['Skill Matrix', 'AI Matching', 'Deployment Map', 'Reporting'].map((item) => (
                <Typography
                  key={item}
                  onClick={() => onPlatformClick && onPlatformClick(item)}
                  sx={{
                    fontSize: '0.88rem',
                    color: '#64748b',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { color: '#6366f1', transform: 'translateX(3px)' },
                  }}
                >
                  {item}
                </Typography>
              ))}
            </Stack>
          </Box>

          {/* Column 3: COMPANY */}
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: '#0f172a',
                fontSize: '0.82rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                mb: 2.2,
              }}
            >
              Company
            </Typography>
            <Stack spacing={1.4}>
              {[
                { label: 'About Us', id: 'about' },
                { label: 'Careers', id: 'contact' },
                { label: 'Success Stories', id: 'reviews' },
                { label: 'Contact', id: 'contact' },
              ].map((item) => (
                <Typography
                  key={item.label}
                  onClick={() => onNavigateSection && onNavigateSection(item.id)}
                  sx={{
                    fontSize: '0.88rem',
                    color: '#64748b',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { color: '#6366f1', transform: 'translateX(3px)' },
                  }}
                >
                  {item.label}
                </Typography>
              ))}
            </Stack>
          </Box>

          {/* Column 4: JOIN OUR NEWSLETTER */}
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: '#0f172a',
                fontSize: '0.82rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                mb: 2.2,
              }}
            >
              Join Our Newsletter
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#64748b',
                fontSize: '0.88rem',
                lineHeight: 1.6,
                mb: 2.5,
              }}
            >
              Stay updated with the latest in disaster relief technology.
            </Typography>

            <Box component="form" onSubmit={handleSubscribe}>
              <TextField
                fullWidth
                size="small"
                placeholder={subscribed ? 'Subscribed!' : 'Enter your email...'}
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                disabled={subscribed}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        type="submit"
                        edge="end"
                        disabled={subscribed}
                        sx={{
                          bgcolor: subscribed ? '#10b981' : '#6366f1',
                          color: '#ffffff',
                          width: 32,
                          height: 32,
                          borderRadius: '8px',
                          '&:hover': {
                            bgcolor: subscribed ? '#059669' : '#4f46e5',
                          },
                        }}
                      >
                        {subscribed ? (
                          <CheckIcon sx={{ fontSize: 18 }} />
                        ) : (
                          <ArrowForwardIcon sx={{ fontSize: 18 }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#f8fafc',
                    borderRadius: '12px',
                    fontSize: '0.88rem',
                    pr: 0.8,
                    '& fieldset': { borderColor: '#e2e8f0' },
                    '&:hover fieldset': { borderColor: '#cbd5e1' },
                    '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                  },
                }}
              />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderColor: '#f1f5f9', mb: 3.5 }} />

        {/* Bottom Bar: Copyright & Legal */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography sx={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            © 2026 VolunPlan Deployment System. All rights reserved.
          </Typography>

          <Stack direction="row" spacing={3}>
            {['Privacy Policy', 'Terms of Service', 'Cookies'].map((item) => (
              <Typography
                key={item}
                sx={{
                  fontSize: '0.82rem',
                  color: '#64748b',
                  cursor: 'pointer',
                  '&:hover': { color: '#6366f1' },
                }}
              >
                {item}
              </Typography>
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

