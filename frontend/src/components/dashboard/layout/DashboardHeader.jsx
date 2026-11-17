
import React from 'react';
import { Calendar, ChevronDown, RefreshCw } from 'lucide-react';

const DashboardHeader = ({
  activeTab,
  user,
  isAdmin,
  isCoordinator,
  selectedDate,
  selectedRegion,
  setSelectedRegion,
  selectedShift,
  setSelectedShift,
  handleUpdateView,
  isUpdating,
}) => {

  const pageTitles = {
    planner: 'Deployment Planner',
    locations: 'Service Locations & Sites',
    volunteers: 'Volunteer Directory',
    reports: 'Deployment Reports & Export',
    admin: 'Admin Privileges & Role Manager',
    my_portal: 'My Volunteer Hub & Skills',
  };

  return (
    <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

      {/* Page Title and User Information */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
          {pageTitles[activeTab] || 'Dashboard'}
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
          Real-time volunteer skill-gap analysis · {user?.fullName || user?.email}

          <span
            className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
              isAdmin
                ? 'bg-purple-100 text-purple-800'
                : isCoordinator
                  ? 'bg-sky-100 text-sky-800'
                  : 'bg-teal-100 text-teal-800'
            }`}
          >
            {user?.role}
          </span>
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-white/95 backdrop-blur-md rounded-full px-4 py-2 shadow-sm border border-slate-200/80 text-xs font-semibold text-slate-600">

        {/* Selected Date */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-50 cursor-pointer transition-colors">
          <Calendar size={14} className="text-slate-400" />
          <span>{selectedDate}</span>
        </div>

        <span className="text-slate-200">|</span>

        {/* Region Filter */}
        <div className="relative group">
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-transparent appearance-none pr-5 py-1.5 font-semibold text-slate-700 cursor-pointer focus:outline-none"
          >
            <option>All Regions</option>
            <option>Northeast Region</option>
            <option>Downtown Metro</option>
            <option>Coastal Bay</option>
            <option>West District</option>
          </select>

          <ChevronDown
            size={13}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        <span className="text-slate-200">|</span>

        {/* Shift Filter */}
        <div className="relative group">
          <select
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            className="bg-transparent appearance-none pr-5 py-1.5 font-semibold text-slate-700 cursor-pointer focus:outline-none"
          >
            <option>All Shifts</option>
            <option>Morning Shift</option>
            <option>Afternoon Shift</option>
            <option>Night Emergency</option>
          </select>

          <ChevronDown
            size={13}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {/* Update View Button */}
        {isCoordinator && (
          <button
            onClick={handleUpdateView}
            disabled={isUpdating}
            className="ml-1 px-5 py-2 rounded-full bg-[#4338ca] hover:bg-[#3730a3] text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-all duration-200 active:scale-95 flex items-center gap-1.5 disabled:opacity-75"
          >
            <RefreshCw
              size={12}
              className={isUpdating ? 'animate-spin' : ''}
            />

            <span>
              {isUpdating ? 'Optimizing…' : 'Update View'}
            </span>
          </button>
        )}

      </div>
    </header>
  );
};

export default DashboardHeader;
