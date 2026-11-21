
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  LogOut,
  Award,
  Compass,
  Home,
  Users,
  MapPin,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';

const Sidebar = ({
  activeTab,
  setActiveTab,
  isAdmin,
  isCoordinator,
  isVolunteer,
  user,
  logout,
  navigate,
}) => {
  if (!user) return null;

  return (
    <aside className="hidden md:flex flex-col items-center justify-between w-[72px] bg-white/95 backdrop-blur-md rounded-[32px] p-3 shadow-xl shadow-slate-200/60 border border-white/90 mr-5 shrink-0 z-20">

      {/* Navigation Menu */}
      <div className="flex flex-col items-center gap-4 w-full">

        {/* Dashboard Logo */}
        <div
          onClick={() => setActiveTab('planner')}
          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4338ca] to-[#3b82f6] shadow-lg shadow-indigo-500/35 flex items-center justify-center text-white cursor-pointer transition-all hover:scale-105 active:scale-95 group"
          title="Deployment Planner"
        >
          <Layers size={22} className="group-hover:rotate-6 transition-transform" />
        </div>

        {/* Deployment Planner */}
        <button
          onClick={() => setActiveTab('planner')}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
            activeTab === 'planner'
              ? 'bg-indigo-50 text-indigo-600 shadow-inner border border-indigo-200/70'
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/80'
          }`}
          title="Deployment Planner"
        >
          <Compass size={20} />
        </button>

        {/* Locations */}
        {(isCoordinator || isVolunteer) && (
          <button
            onClick={() => setActiveTab('locations')}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
              activeTab === 'locations'
                ? 'bg-indigo-50 text-indigo-600 shadow-inner border border-indigo-200/70'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/80'
            }`}
            title="Locations"
          >
            <MapPin size={20} />
          </button>
        )}

        {/* Volunteers */}
        {isCoordinator && (
          <button
            onClick={() => setActiveTab('volunteers')}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
              activeTab === 'volunteers'
                ? 'bg-indigo-50 text-indigo-600 shadow-inner border border-indigo-200/70'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/80'
            }`}
            title="Volunteers"
          >
            <Users size={20} />
          </button>
        )}

        {/* Reports */}
        {isAdmin && (
          <button
            onClick={() => setActiveTab('reports')}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
              activeTab === 'reports'
                ? 'bg-indigo-50 text-indigo-600 shadow-inner border border-indigo-200/70'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/80'
            }`}
            title="Reports"
          >
            <FileSpreadsheet size={20} />
          </button>
        )}

        {/* Admin */}
        {isAdmin && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
              activeTab === 'admin'
                ? 'bg-purple-50 text-purple-700 shadow-inner border border-purple-200/70'
                : 'text-purple-400 hover:text-purple-600 hover:bg-purple-50/50'
            }`}
            title="Admin Role Manager"
          >
            <Shield size={20} />
          </button>
        )}

        {/* Volunteer Portal */}
        {isVolunteer && (
          <button
            onClick={() => setActiveTab('my_portal')}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
              activeTab === 'my_portal'
                ? 'bg-teal-50 text-teal-700 shadow-inner border border-teal-200/70'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/80'
            }`}
            title="My Skills"
          >
            <Award size={20} />
          </button>
        )}

      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col items-center gap-3 w-full">

        {/* Home */}
        <Link
          to="/"
          title="Home"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <Home size={18} />
        </Link>

        {/* User Profile / Logout */}
        <div
          onClick={() => {
            logout();
            navigate('/');
          }}
          title="Sign Out"
          className="w-11 h-11 rounded-2xl border-2 border-indigo-500/20 p-0.5 relative cursor-pointer hover:border-rose-400 group transition-all"
        >
          <div className="w-full h-full rounded-[14px] bg-indigo-100 flex items-center justify-center text-indigo-700 font-extrabold text-sm">
            {(user.fullName || user.email || 'U')[0].toUpperCase()}
          </div>

          <div className="absolute inset-0 rounded-[14px] bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
            <LogOut size={14} />
          </div>

          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
        </div>

      </div>
    </aside>
  );
};

export default Sidebar;
