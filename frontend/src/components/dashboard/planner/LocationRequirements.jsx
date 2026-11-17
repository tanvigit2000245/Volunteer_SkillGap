
import React from 'react';
import { Loader2, MapPin, AlertTriangle, CheckCircle2 } from 'lucide-react';
import CircularRing from '../overview/CircularRing';

const LocationRequirements = ({
  locations,
  loadingLocations,
  isCoordinator,
  setIsLocationModalOpen,
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
            className={`bg-white rounded-3xl p-5 sm:p-6 shadow-sm border-2 transition-all ${
              loc.hasAlert ? 'border-rose-500' : 'border-emerald-500'
            }`}
          >
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
              </div>

              <CircularRing coverage={loc.coverage} />
            </div>

            {loc.hasAlert ? (
              <div className="mt-4 p-3.5 rounded-2xl bg-[#fff5f5] border border-rose-200/80">
                <div className="text-xs font-bold text-rose-600 flex items-center gap-1.5">
                  <AlertTriangle size={13} />
                  <span>Skill-Gap Alert</span>
                </div>

                <p className="text-xs text-rose-800 leading-relaxed mt-1 font-medium">
                  {loc.alertMessage || 'Shortage detected.'}
                </p>
              </div>
            ) : (
              <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 size={13} />
                  <span>
                    {loc.coverage >= 100
                      ? 'Fully Staffed!'
                      : `${loc.coverage}% Coverage`}
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
