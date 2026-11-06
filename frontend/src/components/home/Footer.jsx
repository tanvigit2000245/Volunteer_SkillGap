import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Camera, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const quickLinks = [
    { label: 'Home', sectionId: 'hero' },
    { label: 'About Us', sectionId: 'about' },
    { label: 'Our Mission', sectionId: 'mission' },
    { label: 'Testimonials', sectionId: 'testimonials' },
    { label: 'Contact Us', sectionId: 'contact' },
  ];

  return (
    <footer className="bg-[#0c2340] text-white relative overflow-hidden">
      {/* Top wave */}
      <div className="absolute top-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 60L60 52C120 44 240 28 360 24C480 20 600 28 720 32C840 36 960 36 1080 32C1200 28 1320 20 1380 16L1440 12V0H1380C1320 0 1200 0 1080 0C960 0 840 0 720 0C600 0 480 0 360 0C240 0 120 0 60 0H0V60Z" fill="#f0f7ff"/>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Column 1: About */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0284c7] to-[#00b4d8] flex items-center justify-center shadow-md">
                <Heart size={18} className="text-white fill-white/30" />
              </div>
              <span className="text-lg font-extrabold tracking-tight">
                Volunteer <span className="text-[#00b4d8]">Skill Gap</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Volunteer Skill Gap connects passionate individuals with organizations 
              that need their skills and support. Our goal is to make volunteering easier, 
              more meaningful, and more impactful.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.sectionId}>
                  <button
                    onClick={() => scrollToSection(link.sectionId)}
                    className="text-sm text-slate-400 hover:text-[#00b4d8] transition-colors font-medium"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-slate-400">
                <Mail size={16} className="text-[#00b4d8] shrink-0 mt-0.5" />
                <span>[email placeholder]</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-slate-400">
                <MapPin size={16} className="text-[#00b4d8] shrink-0 mt-0.5" />
                <span>[location placeholder]</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Follow Us */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">Follow Us</h4>
            <div className="flex items-center gap-3">
              <a
                href="#"
                aria-label="Instagram (placeholder)"
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-gradient-to-br hover:from-[#e1306c] hover:to-[#c13584] flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300"
              >
                <Camera size={18} />
              </a>
            </div>
            <p className="mt-3 text-xs text-slate-500 italic">
              Social media links are placeholders.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 font-medium">
              © {new Date().getFullYear()} Volunteer Skill Gap. All rights reserved.
            </p>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <span>Made with</span>
              <Heart size={12} className="text-rose-400 fill-rose-400" />
              <span>for the community</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

