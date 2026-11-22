import React from 'react';
import { Plus, Loader2, ArrowUpRight, CheckCircle2 } from 'lucide-react';

/** Extracted from AuthenticatedView. Shared state remains owned by the parent. */
export default function LocationsTab(props) {
  const {
    setIsLocationModalOpen,
    loadingLocations,
    locations,
    setActiveTab,
    showToast,
    isVolunteer,
    volunteerProfile,
  } = props;

  const mySkills = (volunteerProfile?.skills || []).map((s) =>
    (s.skillName || s.skill || '').toLowerCase().trim()
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Service Locations & Disaster Sites</h2>
          <p className="text-xs text-slate-500">Live from MongoDB <code>/api/locations</code></p>
        </div>
        {!isVolunteer && (
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="px-4 py-2 rounded-2xl bg-[#4338ca] text-white text-xs font-bold shadow-md flex items-center gap-1.5 hover:bg-[#3730a3]"
          >
            <Plus size={15} />
            <span>Add New Site</span>
          </button>
        )}
      </div>

      {loadingLocations ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="text-indigo-400 animate-spin" />
        </div>
      ) : locations.length === 0 ? (
        <div className="text-center py-16 text-slate-400">No locations found. Add the first one.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map((loc) => {
            const matchingReq = (loc.requirements || []).find((r) => {
              const reqSkill = (r.requiredSkill || '').toLowerCase().trim();
              return mySkills.some((ms) => ms.includes(reqSkill) || reqSkill.includes(ms));
            });
            const matchesVolunteer = isVolunteer && Boolean(matchingReq);

            return (
              <div
                key={loc.id}
                className={`bg-white rounded-3xl p-5 shadow-sm border-2 flex flex-col justify-between transition-all ${
                  matchesVolunteer ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 font-mono">{loc.siteCode}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        loc.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : loc.status === 'UPCOMING'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {loc.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{loc.name}</h3>
                  {loc.city && <p className="text-xs text-slate-400 mt-0.5">{loc.city}</p>}

                  {matchesVolunteer && (
                    <div className="mt-2.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 size={13} />
                      <span>Matches Your Skill: {matchingReq.requiredSkill}</span>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {loc.tags.map((t, idx) => (
                      <span key={idx} className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${t.color}`}>
                        {t.label}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Coverage: <strong className="text-slate-800">{loc.coverage}%</strong>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('planner');
                      showToast(`Selected ${loc.name}`);
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <span>{isVolunteer ? 'View Site' : 'Deploy Pool'}</span>
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
