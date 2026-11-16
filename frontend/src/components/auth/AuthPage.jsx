import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordModal from './ForgotPasswordModal';
import AuthenticatedView from '../dashboard/AuthenticatedView';
import Toast from '../common/Toast';
import { Heart, ArrowLeft } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export default function AuthPage() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('login'); // 'login' | 'register'
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [toast, setToast] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const { user, login, register, logout, setAuthSession } = useContext(AuthContext);

  const triggerToast = ({ type = 'info', message }) => {
    setToast({ id: Date.now(), type, message });
  };

  const handleSwitchView = (newView) => {
    if (newView === currentView) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentView(newView);
      setIsTransitioning(false);
    }, 150);
  };

  const handleLoginSuccess = (session) => {
    setAuthSession(session, session.accessToken);
    navigate('/dashboard');
  };

  const handleRegisterSuccess = async (newUser) => {
    // After registration, switch to login view
    handleSwitchView('login');
    triggerToast({ type: 'success', message: `Account created for ${newUser.fullName}! Please sign in.` });
  };

  const handleLogout = () => {
    logout();
    triggerToast({ type: 'info', message: 'You have been signed out successfully.' });
  };

  const handleOpenForgotPassword = (email) => {
    setForgotEmail(email || '');
    setIsForgotModalOpen(true);
  };

  return (
    <div className="w-full min-h-screen relative overflow-x-hidden select-none selection:bg-[#0284c7] selection:text-white m-0 p-0 flex items-center justify-center bg-[#edf5fe]">
      <img src="/img1.png" alt="Volunteer Skill Gap Background" className="fixed inset-0 w-full h-full object-fill object-left-top pointer-events-none select-none z-0" />
      {/* Decorative hearts omitted for brevity */}
      <Toast toast={toast} onClose={() => setToast(null)} />
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        initialEmail={forgotEmail}
        onNotify={triggerToast}
      />
      {user ? (
        <main className="relative z-20 w-full min-h-screen overflow-y-auto p-4 sm:p-8 flex items-center justify-center animate-slide-up-fade bg-[#f0f7ff]/95 backdrop-blur-md">
          <AuthenticatedView onLogout={handleLogout} />
        </main>
      ) : (
        <main className="relative z-10 w-full min-h-screen flex flex-col lg:flex-row items-center justify-between">
          <section className="w-full lg:w-[54%] xl:w-[56%] h-[35vh] sm:h-[45vh] lg:h-full pointer-events-none" />
          <section className="w-full lg:w-[46%] xl:w-[44%] h-auto lg:h-full flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-20 animate-slide-up-fade">
            <div className="w-full max-w-[430px] bg-white rounded-[32px] card-elevation border border-white/90 p-6 sm:p-8 relative transition-all duration-300">
              <div className="mb-3">
                <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0284c7] transition-colors">
                  <ArrowLeft size={14} />
                  <span>Back to Home</span>
                </Link>
              </div>
              <div className="transition-all duration-150 transform "
                style={{ opacity: isTransitioning ? 0 : 1, transform: isTransitioning ? 'scale(0.98) translateY(4px)' : 'scale(1) translateY(0)' }}>
                {currentView === 'login' ? (
                  <LoginForm
                    onSwitchToRegister={() => handleSwitchView('register')}
                    onLoginSuccess={handleLoginSuccess}
                    onOpenForgotPassword={handleOpenForgotPassword}
                    onNotify={triggerToast}
                  />
                ) : (
                  <RegisterForm
                    onSwitchToLogin={() => handleSwitchView('login')}
                    onRegisterSuccess={handleRegisterSuccess}
                    onNotify={triggerToast}
                  />
                )}
              </div>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}
