
import React from 'react';
import { Loader2, MapPin, AlertTriangle, CheckCircle2 } from 'lucide-react';
import CircularRing from '../overview/CircularRing';

const LocationRequirements = ({
  locations,
  loadingLocations,
  isCoordinator,
  setIsLocationModalOpen,
  selectedLocationId,
  loadCandidatesForLocation,
}) => {
  return (
    <div className="lg:col-span-5 space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base sm:text-lg font-bold text-[#0f172a]">
          Location Requirements
        </h2>

        <div className="px-3 py-1 rounded-full bg-white text-[11px] font-bold text-slate-500 shadow-sm border border-slate-200">
          {locations.length} SITES
        </div>
      </div>

      {loadingLocations ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="text-indigo-400 animate-spin" />
          <span className="ml-3 text-sm text-slate-400 font-medium">
            Loading locations from database…
          </span>
        </div>
      ) : locations.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-slate-100">
          <MapPin size={36} className="text-slate-300 mx-auto mb-3" />

          <p className="text-slate-500 font-semibold text-sm">
            No locations in database.
          </p>

          {isCoordinator && (
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
            >
              Add First Location
            </button>
          )}
        </div>
      ) : (
        locations.map((loc) => (
          <div
            key={loc.id}
            onClick={() => loadCandidatesForLocation && loadCandidatesForLocation(loc.id)}
            className={`bg-white rounded-3xl p-5 sm:p-6 shadow-sm border-2 transition-all cursor-pointer hover:shadow-md ${selectedLocationId === loc.id
                ? 'border-[#4338ca] ring-2 ring-indigo-200'
                : loc.hasAlert ? 'border-rose-500' : 'border-emerald-500'
              }`}
          >
            {selectedLocationId === loc.id && (
              <div className="mb-2 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider border border-indigo-200 inline-block">
                ● Selected — Showing matched candidates
              </div>
            )}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#0f172a]">
                  {loc.name}
                </h3>

                <div className="text-xs text-slate-400 font-semibold mt-0.5">
                  {loc.city && `${loc.city} · `}

                  <span className="font-mono">{loc.siteCode}</span>

                  <span className="ml-2 px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px]">
                    {loc.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-600 font-semibold">
                  {loc.date && (
                    <span className="flex items-center gap-1">
                      📅 {new Date(loc.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                  {loc.shiftStart && loc.shiftEnd && (
                    <span className="flex items-center gap-1">
                      ⏰ {loc.shiftStart} – {loc.shiftEnd}
                    </span>
                  )}
                </div>
              </div>

              <CircularRing
                coverage={loc.coverage}
                assignedCount={loc.assignedCount || 0}
                totalRequired={loc.totalRequired || 1}
              />
            </div>

            {loc.status === 'COMPLETED' ? (
              <div className="mt-4 p-3.5 rounded-2xl bg-slate-100 border border-slate-200">
                <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-slate-500" />
                    <span>Mission Concluded • Volunteers Released</span>
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Shift Ended
                  </span>
                </div>
              </div>
            ) : loc.assignedCount > 0 ? (
              loc.coverage >= 100 ? (
                <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 size={13} />
                    <span>Fully Staffed! ({loc.assignedCount}/{loc.totalRequired || 1})</span>
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200">
                  <div className="text-xs font-bold text-indigo-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} />
                      <span>{loc.assignedCount} of {loc.totalRequired || 1} Assigned</span>
                    </span>
                    <span className="text-indigo-600 font-semibold">{loc.coverage}% Coverage</span>
                  </div>
                </div>
              )
            ) : (
              <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-bold text-slate-600 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle size={13} className="text-amber-500" />
                    <span>No Candidates Assigned Yet</span>
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Needs {loc.totalRequired || 1} volunteer{(loc.totalRequired || 1) > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {loc.tags.map((tag, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${tag.color}`}
                >
                  {tag.label}
                </span>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default LocationRequirements;
