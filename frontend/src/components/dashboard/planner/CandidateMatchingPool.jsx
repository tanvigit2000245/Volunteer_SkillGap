
import React from 'react';
import { Users, Loader2, Check } from 'lucide-react';

const CandidateMatchingPool = ({
  candidates,
  loadingCandidates,
  candidateFilter,
  setCandidateFilter,
  handleAssignCandidate,
  locations,
}) => {
  const filteredCandidates = candidates.filter((candidate) =>
    candidateFilter === 'eligible'
      ? candidate.type === 'eligible'
      : true
  );

  return (
    <div className="lg:col-span-7 space-y-4">

      {/* Header and Filters */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base sm:text-lg font-bold text-[#0f172a]">
          Candidate Matching Pool
        </h2>

        <div className="flex items-center gap-1 bg-white p-1 rounded-full shadow-sm border border-slate-200 text-xs font-bold">

          <button
            onClick={() => setCandidateFilter('eligible')}
            className={`px-3 py-1 rounded-full transition-all ${
              candidateFilter === 'eligible'
                ? 'bg-[#4338ca] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Actually Eligible
          </button>

          <button
            onClick={() => setCandidateFilter('suitable')}
            className={`px-3 py-1 rounded-full transition-all ${
              candidateFilter === 'suitable'
                ? 'bg-[#4338ca] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Potentially Suitable
          </button>

        </div>
      </div>

      {/* Candidate List */}
      <div className="space-y-3">

        {/* Loading State */}
        {loadingCandidates ? (
          <div className="flex items-center justify-center py-16">
            <Loader2
              size={28}
              className="text-indigo-400 animate-spin"
            />

            <span className="ml-3 text-sm text-slate-400 font-medium">
              Loading candidates…
            </span>
          </div>

        ) : filteredCandidates.length === 0 ? (

          /* Empty State */
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-slate-100">
            <Users
              size={36}
              className="text-slate-300 mx-auto mb-3"
            />

            <p className="text-slate-500 font-semibold text-sm">
              No volunteer candidates found in database.
            </p>

            <p className="text-slate-400 text-xs mt-1">
              Volunteers need to register and create a profile first.
            </p>
          </div>

        ) : (

          /* Candidate Cards */
          filteredCandidates.map((candidate) => (
            <div
              key={candidate.id}
              className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all"
            >

              {/* Candidate Information */}
              <div className="flex items-center gap-3.5">

                {/* Avatar and Match Score */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-sm">
                    {candidate.initials}
                  </div>

                  <div
                    className={`absolute -top-1.5 -left-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold shadow-sm ${candidate.scoreColor}`}
                  >
                    {candidate.matchScore}%
                  </div>
                </div>

                {/* Name and Skills */}
                <div>
                  <div className="font-bold text-slate-900 text-base">
                    {candidate.name}
                  </div>

                  <div className="text-xs text-slate-500 font-medium">
                    {candidate.title}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {candidate.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold tracking-wider uppercase border border-slate-200/80"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Assignment Action */}
              <div>
                {candidate.status === 'not_available' ? (

                  <button
                    disabled
                    className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-slate-100 text-slate-400 font-bold text-xs uppercase cursor-not-allowed border border-slate-200"
                  >
                    NOT AVAILABLE
                  </button>

                ) : candidate.status === 'assigned' ? (

                  <div className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs uppercase border border-emerald-200 flex items-center justify-center gap-1.5">
                    <Check size={14} />
                    <span>ASSIGNED</span>
                  </div>

                ) : (

                  <button
                    onClick={() =>
                      handleAssignCandidate(
                        candidate.id,
                        locations[0]?.id
                      )
                    }
                    className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#4338ca] hover:bg-[#3730a3] text-white font-bold text-xs uppercase shadow-md shadow-indigo-600/25 transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    ASSIGN NOW
                  </button>

                )}
              </div>

            </div>
          ))

        )}

      </div>
    </div>
  );
};

export default CandidateMatchingPool;
