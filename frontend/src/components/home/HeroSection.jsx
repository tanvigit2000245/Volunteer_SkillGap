import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Heart, Users } from 'lucide-react';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-[#f0f7ff] via-[#e8f4fd] to-[#f4fbfa]">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#0284c7]/8 to-[#00b4d8]/8 blur-3xl animate-float-slow" />
        <div className="absolute -bottom-60 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#00b4d8]/6 to-[#14b8a6]/6 blur-3xl animate-float-reverse" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-[#0284c7]/5 blur-2xl animate-pulse-glow" />
      </div>

      {/* Floating decorative elements */}
      <div className="absolute top-24 left-[10%] animate-float-slow opacity-40 hidden lg:block">
        <Heart size={24} className="text-[#00b4d8] fill-[#00b4d8]/20" />
      </div>
      <div className="absolute top-40 right-[15%] animate-float-reverse opacity-30 hidden lg:block">
        <Sparkles size={20} className="text-[#0284c7]" />
      </div>
      <div className="absolute bottom-32 left-[20%] animate-float-reverse opacity-35 hidden lg:block">
        <Users size={22} className="text-[#14b8a6]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0284c7]/10 text-[#0284c7] text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles size={14} />
              <span>Empowering Communities</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-[#0c2340] leading-tight tracking-tight mb-6">
              Empowering Communities Through the Power of{' '}
              <span className="bg-gradient-to-r from-[#0284c7] via-[#0d84d6] to-[#00b4d8] bg-clip-text text-transparent">
                Volunteering.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
              Connecting passionate volunteers with organizations that need their skills, 
              dedication, and support. Together, we can create meaningful opportunities 
              and build stronger communities.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button
                onClick={() => {
                  const el = document.getElementById('about');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#145ac7] via-[#0d84d6] to-[#00b4d8] hover:from-[#114eb0] hover:to-[#00a2c3] text-white font-bold text-sm shadow-lg shadow-sky-600/25 hover:shadow-sky-600/40 transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-2"
              >
                Explore Our Work
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl border-2 border-[#0284c7] text-[#0284c7] hover:bg-[#0284c7] hover:text-white font-bold text-sm transition-all duration-200 active:scale-[0.97]"
              >
                Become a Volunteer
              </button>
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex justify-center"
          >
            <div className="relative w-full max-w-lg">
              {/* Glow behind image */}
              <div className="absolute inset-4 bg-gradient-to-br from-[#0284c7]/20 to-[#00b4d8]/20 rounded-3xl blur-2xl" />
              <img
                src="/United in Volunteer Spirit.png"
                alt="Volunteers working together"
                className="relative w-full h-auto rounded-3xl shadow-2xl shadow-slate-300/40 object-cover"
              />
              {/* Floating stat card */}
              <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 bg-white rounded-2xl shadow-xl p-4 border border-slate-100 animate-float-slow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00b4d8] to-[#14b8a6] flex items-center justify-center">
                    <Users size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-extrabold text-[#0c2340]">500+</div>
                    <div className="text-xs text-slate-500 font-medium">Active Volunteers</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom wave separator */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 40L48 36C96 32 192 24 288 28C384 32 480 48 576 52C672 56 768 48 864 40C960 32 1056 24 1152 28C1248 32 1344 48 1392 56L1440 64V80H1392C1344 80 1248 80 1152 80C1056 80 960 80 864 80C768 80 672 80 576 80C480 80 384 80 288 80C192 80 96 80 48 80H0V40Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
}

