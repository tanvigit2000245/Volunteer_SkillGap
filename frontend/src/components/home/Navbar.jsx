import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, Heart } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToSection = (id) => {
    setIsMobileOpen(false);
    setIsMoreOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const moreItems = [
    { label: 'Our Work', sectionId: 'hero' },
    { label: 'Testimonials', sectionId: 'testimonials' },
    { label: 'Our Mission', sectionId: 'mission' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-slate-200/40 border-b border-slate-100'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0284c7] to-[#00b4d8] flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Heart size={18} className="text-white fill-white/30" />
            </div>
            <div className="flex flex-col">
              <span className={`text-base font-extrabold tracking-tight leading-tight transition-colors ${isScrolled ? 'text-[#0c2340]' : 'text-[#0c2340]'}`}>
                Volunteer <span className="text-[#00b4d8]">Skill Gap</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => scrollToSection('hero')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-[#0284c7]/10 ${
                isScrolled ? 'text-slate-700 hover:text-[#0284c7]' : 'text-slate-700 hover:text-[#0284c7]'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-[#0284c7]/10 ${
                isScrolled ? 'text-slate-700 hover:text-[#0284c7]' : 'text-slate-700 hover:text-[#0284c7]'
              }`}
            >
              About Us
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-[#0284c7]/10 ${
                isScrolled ? 'text-slate-700 hover:text-[#0284c7]' : 'text-slate-700 hover:text-[#0284c7]'
              }`}
            >
              Contact Us
            </button>

            {/* More Dropdown */}
            <div ref={moreRef} className="relative">
              <button
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-[#0284c7]/10 flex items-center gap-1 ${
                  isScrolled ? 'text-slate-700 hover:text-[#0284c7]' : 'text-slate-700 hover:text-[#0284c7]'
                }`}
              >
                More
                <ChevronDown
                  size={15}
                  className={`transition-transform duration-200 ${isMoreOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isMoreOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 py-2 animate-slide-up-fade overflow-hidden">
                  {moreItems.map((item) => (
                    <button
                      key={item.sectionId}
                      onClick={() => scrollToSection(item.sectionId)}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-[#0284c7]/10 hover:text-[#0284c7] transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Login Button */}
            <button
              onClick={() => navigate('/login')}
              className="ml-3 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#145ac7] via-[#0d84d6] to-[#00b4d8] hover:from-[#114eb0] hover:to-[#00a2c3] text-white text-sm font-bold shadow-md shadow-sky-600/20 hover:shadow-sky-600/35 transition-all duration-200 active:scale-[0.97]"
            >
              Login
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur-lg border-t border-slate-100 shadow-lg animate-slide-up-fade">
          <div className="px-4 py-4 space-y-1">
            <button onClick={() => scrollToSection('hero')} className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-[#0284c7]/10 hover:text-[#0284c7] transition-colors">
              Home
            </button>
            <button onClick={() => scrollToSection('about')} className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-[#0284c7]/10 hover:text-[#0284c7] transition-colors">
              About Us
            </button>
            <button onClick={() => scrollToSection('contact')} className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-[#0284c7]/10 hover:text-[#0284c7] transition-colors">
              Contact Us
            </button>
            {moreItems.map((item) => (
              <button
                key={item.sectionId}
                onClick={() => scrollToSection(item.sectionId)}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-[#0284c7]/10 hover:text-[#0284c7] transition-colors pl-8"
              >
                {item.label}
              </button>
            ))}
            <div className="pt-2">
              <button
                onClick={() => { setIsMobileOpen(false); navigate('/login'); }}
                className="w-full px-6 py-3 rounded-2xl bg-gradient-to-r from-[#145ac7] via-[#0d84d6] to-[#00b4d8] text-white text-sm font-bold shadow-md transition-all"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

