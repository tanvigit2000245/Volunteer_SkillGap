import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  LogOut, 
  Mail, 
  Sparkles, 
  Award, 
  Calendar, 
  CheckCircle2, 
  Clock,
  Compass,
  GraduationCap,
  Heart,
  Home
} from 'lucide-react';

export default function AuthenticatedView({ user, onLogout }) {
  if (!user) return null;

  const roleConfigs = {
    admin: {
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      tagline: 'System Administrator',
      description: 'Full administrative rights to manage skill taxonomies, assign coordinators, and view network analytics.',
      avatarBg: 'bg-purple-600',
      icon: Shield
    },
    coordinator: {
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
      tagline: 'Program Coordinator',
      description: 'Coordinates community projects, verifies partner needs, and schedules skill workshops.',
      avatarBg: 'bg-[#0d84d6]',
      icon: Compass
    },
    volunteer: {
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
      tagline: 'Community Volunteer',
      description: 'Offers skills to grassroots community projects and logs volunteer contribution hours.',
      avatarBg: 'bg-[#00a884]',
      icon: Award
    }
  };

  const currentRoleConfig = roleConfigs[user.role] || roleConfigs.volunteer;
  const RoleIcon = currentRoleConfig.icon;

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 animate-fadeIn">
      {/* Top Navbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-slate-200/80 shadow-md mb-8">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0284c7] to-[#00b4d8] flex items-center justify-center shadow-md">
            <Heart size={20} className="text-white fill-white/30" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0c2340] flex items-center gap-1.5">
              Volunteer <span className="text-[#00a884]">Skill Gap</span>
            </h1>
            <span className="text-xs text-slate-500 font-medium">Community Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all duration-200"
          >
            <Home size={15} />
            <span>Home</span>
          </Link>
          <button
            onClick={onLogout}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 text-slate-700 text-xs font-bold transition-all duration-200 active:scale-95 group"
          >
            <LogOut size={15} className="transition-transform group-hover:-translate-x-0.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Profile & Role Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="lg:col-span-1 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-md flex flex-col items-center text-center">
          {/* Avatar */}
          <div className={`w-24 h-24 rounded-full ${currentRoleConfig.avatarBg} text-white flex items-center justify-center text-3xl font-extrabold shadow-md mb-4`}>
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </div>

          <h2 className="text-xl font-bold text-[#0c2340] mb-1">
            {user.fullName}
          </h2>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4 break-all">
            <Mail size={13} className="shrink-0" />
            <span>{user.email}</span>
          </div>

          {/* Role Badge */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${currentRoleConfig.badgeColor} mb-4`}>
            <RoleIcon size={14} />
            <span>Role: {user.role}</span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed mb-6">
            {currentRoleConfig.description}
          </p>

          <div className="w-full pt-4 border-t border-slate-100 text-left text-xs text-slate-600 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 size={13} /> Active & Verified
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Security Mode:</span>
              <span className="text-[#0284c7] font-semibold">Web Crypto SHA-256</span>
            </div>
          </div>
        </div>

        {/* Workspace & Stats Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Welcome Banner */}
          <div className="p-7 rounded-3xl bg-gradient-to-r from-[#0c4389] via-[#0d61a8] to-[#01a396] text-white shadow-lg relative overflow-hidden">
            <div className="flex items-center gap-2 text-teal-200 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles size={14} />
              <span>Skill Match Dashboard</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">
              Welcome back, {user.fullName.split(' ')[0]}!
            </h3>
            <p className="text-sm text-sky-100 leading-relaxed max-w-xl">
              You are signed in as a <span className="font-bold underline capitalize">{user.role}</span>. You can now match your skills with non-profits and contribute to community causes.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <div className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                <GraduationCap size={16} className="text-[#0284c7]" />
                <span>Skill Matches</span>
              </div>
              <div className="text-2xl font-extrabold text-[#0c2340]">14</div>
              <div className="text-[11px] text-[#00a884] font-semibold mt-1">3 new opportunities</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <div className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                <Clock size={16} className="text-teal-600" />
                <span>Impact Hours</span>
              </div>
              <div className="text-2xl font-extrabold text-[#0c2340]">36.5 hrs</div>
              <div className="text-[11px] text-sky-600 font-semibold mt-1">This quarter</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <div className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                <Calendar size={16} className="text-purple-600" />
                <span>Upcoming Projects</span>
              </div>
              <div className="text-2xl font-extrabold text-[#0c2340]">2</div>
              <div className="text-[11px] text-purple-600 font-semibold mt-1">Scheduled for this weekend</div>
            </div>
          </div>

          {/* Schema Verification */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 text-xs shadow-sm">
            <h4 className="font-bold text-[#0c2340] mb-2 flex items-center gap-2">
              <Shield size={14} className="text-[#0284c7]" />
              <span>Conformant User Schema Data</span>
            </h4>
            <div className="bg-slate-50 p-3 rounded-xl font-mono text-[11px] text-slate-700 overflow-x-auto border border-slate-200">
              {JSON.stringify(
                {
                  email: user.email,
                  fullName: user.fullName,
                  role: user.role,
                  sessionToken: user.token ? `${user.token.substring(0, 16)}...` : undefined
                },
                null,
                2
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
