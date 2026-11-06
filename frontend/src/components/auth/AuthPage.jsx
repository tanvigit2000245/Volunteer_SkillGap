import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordModal from './ForgotPasswordModal';
import AuthenticatedView from '../dashboard/AuthenticatedView';
import Toast from '../common/Toast';
import { 
  initializeMockDatabase, 
  mockLogout 
} from '../../utils/authStorage';
import { Heart, ArrowLeft } from 'lucide-react';

export default function AuthPage() {
  const [currentView, setCurrentView] = useState('login'); // 'login' | 'register'
  const [currentUser, setCurrentUser] = useState(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [toast, setToast] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Initialize mock database with sample users on startup
  // Ensures currentUser starts completely null so login inputs are blank
  useEffect(() => {
    initializeMockDatabase();
  }, []);

  const triggerToast = ({ type = 'info', message }) => {
    setToast({
      id: Date.now(),
      type,
      message
    });
  };

  const handleSwitchView = (newView) => {
    if (newView === currentView) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentView(newView);
      setIsTransitioning(false);
    }, 150);
  };

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
  };

  const handleRegisterSuccess = (newUser) => {
    handleSwitchView('login');
    triggerToast({
      type: 'success',
      message: `Account created for ${newUser.fullName}! Please sign in.`
    });
  };

  const handleLogout = () => {
    mockLogout();
    setCurrentUser(null);
    triggerToast({
      type: 'info',
      message: 'You have been signed out successfully.'
    });
  };

  const handleOpenForgotPassword = (email) => {
    setForgotEmail(email || '');
    setIsForgotModalOpen(true);
  };

  return (
    <div className="w-full min-h-screen relative overflow-x-hidden select-none selection:bg-[#0284c7] selection:text-white m-0 p-0 flex items-center justify-center bg-[#edf5fe]">
      {/* 
        User's Background Image (public/img1.png):
        Fits the entire screen (100vw x 100vh) and extends behind the login box.
        Rendered directly at native quality with zero compression or filters.
        object-left-top pins top-left so the top logo and volunteers are never cut off.
      */}
      <img
        src="/img1.png"
        alt="Volunteer Skill Gap Background"
        className="fixed inset-0 w-full h-full object-fill object-left-top pointer-events-none select-none z-0"
      />

      {/* Floating decorative heart icons matching reference */}
      <div className="fixed top-[20%] right-[42%] z-10 animate-float-slow hidden xl:block pointer-events-none text-teal-400 opacity-60">
        <Heart size={18} className="fill-teal-300/30 text-teal-400 stroke-[1.75]" />
      </div>
      <div className="fixed bottom-[28%] right-[44%] z-10 animate-float-reverse hidden xl:block pointer-events-none text-teal-400 opacity-55">
        <Heart size={16} className="fill-teal-300/30 text-teal-400 stroke-[1.75]" />
      </div>
      <div className="fixed top-[12%] right-[8%] z-10 animate-float-reverse hidden lg:block pointer-events-none text-sky-400 opacity-50">
        <Heart size={15} className="fill-sky-300/30 text-sky-400 stroke-[1.75]" />
      </div>

      {/* Global Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        initialEmail={forgotEmail}
        onNotify={triggerToast}
      />

      {currentUser ? (
        // Authenticated Dashboard View
        <main className="relative z-20 w-full min-h-screen overflow-y-auto p-4 sm:p-8 flex items-center justify-center animate-slide-up-fade bg-[#f0f7ff]/95 backdrop-blur-md">
          <AuthenticatedView user={currentUser} onLogout={handleLogout} />
        </main>
      ) : (
        // Full Viewport Layout with img1.png background spanning behind login box
        <main className="relative z-10 w-full min-h-screen flex flex-col lg:flex-row items-center justify-between">
          {/* Left section: transparent area revealing complete promotional artwork from img1.png */}
          <section className="w-full lg:w-[54%] xl:w-[56%] h-[35vh] sm:h-[45vh] lg:h-full pointer-events-none" />

          {/* Right section: Authentication Card floating over the continuous background */}
          <section className="w-full lg:w-[46%] xl:w-[44%] h-auto lg:h-full flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-20 animate-slide-up-fade">
            <div className="w-full max-w-[430px] bg-white rounded-[32px] card-elevation border border-white/90 p-6 sm:p-8 relative transition-all duration-300">
              {/* Back to Home link */}
              <div className="mb-3">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0284c7] transition-colors"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Home</span>
                </Link>
              </div>

              {/* Form Animated Transition Wrapper */}
              <div
                className={`transition-all duration-150 transform ${
                  isTransitioning
                    ? 'opacity-0 scale-[0.98] translate-y-1'
                    : 'opacity-100 scale-100 translate-y-0'
                }`}
              >
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
