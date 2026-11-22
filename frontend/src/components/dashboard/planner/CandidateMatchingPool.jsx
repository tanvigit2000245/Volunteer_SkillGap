
import React, { useState } from 'react';
import { Users, Loader2, Check, ChevronDown, ChevronUp, CheckCircle2, XCircle, Info, AlertTriangle, MapPin, Clock } from 'lucide-react';

const CandidateMatchingPool = ({
  candidates,
  loadingCandidates,
  candidateFilter,
  setCandidateFilter,
  handleAssignCandidate,
  locations,
  selectedLocationId,
  handleAssignBestMatches,
}) => {
  const [expandedCards, setExpandedCards] = useState({});

  const toggleExpand = (id) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectedLocation = (locations || []).find((l) => l.id === selectedLocationId) || locations?.[0];
  const isShiftOver = Boolean(
    selectedLocation?.status === 'COMPLETED' ||
    selectedLocation?.isDeploymentOver
  );
  const isSiteFull = Boolean(
    selectedLocation?.isSiteFull ||
    (selectedLocation?.assignedCount !== undefined && selectedLocation?.totalRequired !== undefined && selectedLocation.assignedCount >= selectedLocation.totalRequired)
  );

  const totalRequired = selectedLocation?.totalRequired || 1;
  const assignedCount = selectedLocation?.assignedCount || 0;
  const remainingSlots = Math.max(0, totalRequired - assignedCount);

  // Filter by tab: eligible vs potentially suitable vs ineligible
  const eligibleCandidates = (candidates || []).filter((c) => c.type === 'eligible');
  const suitableCandidates = (candidates || []).filter((c) => c.type === 'suitable');
  const ineligibleCandidates = (candidates || []).filter((c) => c.type === 'ineligible');
  const displayedCandidates =
    candidateFilter === 'eligible'
      ? eligibleCandidates
      : candidateFilter === 'suitable'
        ? suitableCandidates
        : ineligibleCandidates;

  const unassignedEligible = eligibleCandidates.filter((c) => !c.isAlreadyAssigned && !c.isDoubleBooked);
  const hasSurplusCandidates = unassignedEligible.length > remainingSlots && remainingSlots > 0;

  // Score color helper
  const getScoreColor = (pct) => {
    if (pct >= 85) return 'bg-[#10b981] text-white';
    if (pct >= 70) return 'bg-[#06b6d4] text-white';
    if (pct >= 50) return 'bg-[#3b82f6] text-white';
    if (pct >= 35) return 'bg-[#f59e0b] text-white';
    return 'bg-[#ef4444] text-white';
  };

  return (
    <div className="lg:col-span-7 space-y-4">

      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <h2 className="text-base sm:text-lg font-bold text-[#0f172a]">
          Candidate Matching Pool
        </h2>

        <div className="flex items-center gap-1 bg-white p-1 rounded-full shadow-sm border border-slate-200 text-xs font-bold flex-wrap">
          <button
            onClick={() => setCandidateFilter('eligible')}
            className={`px-3 py-1 rounded-full transition-all ${candidateFilter === 'eligible'
                ? 'bg-[#4338ca] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            Actually Eligible ({eligibleCandidates.length})
          </button>

          <button
            onClick={() => setCandidateFilter('suitable')}
            className={`px-3 py-1 rounded-full transition-all ${candidateFilter === 'suitable'
                ? 'bg-[#4338ca] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            Potentially Suitable ({suitableCandidates.length})
          </button>

          <button
            onClick={() => setCandidateFilter('ineligible')}
            className={`px-3 py-1 rounded-full transition-all ${candidateFilter === 'ineligible'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            Ineligible ({ineligibleCandidates.length})
          </button>
        </div>
      </div>

      {/* Surplus Candidates Banner: Highlight and auto-add best matching candidate(s) */}
      {candidateFilter === 'eligible' && hasSurplusCandidates && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 border border-indigo-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shrink-0 text-sm shadow-sm">
              ★
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-indigo-950 flex items-center gap-1.5">
                <span>{unassignedEligible.length} Candidates Available for {remainingSlots} Open Position{remainingSlots > 1 ? 's' : ''}</span>
              </p>
              <p className="text-[11px] text-indigo-700 font-medium mt-0.5">
                Ranked by highest matching percentage. Top recommendation: <strong>{unassignedEligible[0]?.name}</strong> ({unassignedEligible[0]?.matchPercentage ?? unassignedEligible[0]?.matchScore}% score).
              </p>
            </div>
          </div>
          {handleAssignBestMatches && !isShiftOver && !isSiteFull && (
            <button
              onClick={() => handleAssignBestMatches(selectedLocationId)}
              className="px-4 py-2 rounded-xl bg-[#4338ca] hover:bg-[#3730a3] text-white font-bold text-xs uppercase shadow-sm transition-all shrink-0 flex items-center gap-1.5 active:scale-95"
            >
              <span>★ ADD BEST MATCH{remainingSlots > 1 ? ` (TOP ${Math.min(remainingSlots, unassignedEligible.length)})` : ''}</span>
            </button>
          )}
        </div>
      )}

      {/* Candidate List */}
      <div className="space-y-3">

        {/* Loading State */}
        {loadingCandidates ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="text-indigo-400 animate-spin" />
            <span className="ml-3 text-sm text-slate-400 font-medium">
              Matching candidates by skill requirements…
            </span>
          </div>

        ) : !selectedLocationId ? (
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-slate-100">
            <Users size={36} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold text-sm">
              Select a service location to view matched candidates.
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Candidates are filtered based on the skills required by each location.
            </p>
          </div>

        ) : displayedCandidates.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-slate-100">
            <Users size={36} className="text-slate-300 mx-auto mb-3" />
            {candidateFilter === 'eligible' ? (
              <>
                <p className="text-slate-500 font-semibold text-sm">
                  No eligible volunteers found for this location.
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  The required primary skills are currently unavailable among registered volunteers.
                </p>
                {suitableCandidates.length > 0 && (
                  <button
                    onClick={() => setCandidateFilter('suitable')}
                    className="mt-4 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 hover:bg-indigo-100 transition-all"
                  >
                    View {suitableCandidates.length} Potentially Suitable Candidate{suitableCandidates.length > 1 ? 's' : ''}
                  </button>
                )}
              </>
            ) : candidateFilter === 'suitable' ? (
              <>
                <p className="text-slate-500 font-semibold text-sm">
                  No potentially suitable volunteers found.
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  No volunteers have partial matches for this location.
                </p>
              </>
            ) : (
              <>
                <p className="text-slate-500 font-semibold text-sm">
                  No ineligible volunteers.
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  All available volunteers have relevant skills for this site.
                </p>
              </>
            )}
          </div>

        ) : (
          /* Candidate Cards */
          displayedCandidates.map((candidate, index) => {
            const isExpanded = expandedCards[candidate.id];
            const matchPct = candidate.matchPercentage ?? candidate.matchScore ?? 0;
            const isTopMatch = candidate.type === 'eligible' && !candidate.isAlreadyAssigned && index === 0;
            const isWithinTopSlots = candidate.type === 'eligible' && !candidate.isAlreadyAssigned && index < remainingSlots;

            return (
              <div
                key={candidate.id}
                className="bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all overflow-hidden"
              >
                {/* Main Card Row */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                  {/* Candidate Information */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    {/* Avatar and Match Score */}
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-sm">
                        {candidate.initials}
                      </div>
                      <div className={`absolute -top-1.5 -left-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold shadow-sm ${getScoreColor(matchPct)}`}>
                        {matchPct}%
                      </div>
                    </div>

                    {/* Name and Skills */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="font-bold text-slate-900 text-base truncate">
                          {candidate.name}
                        </div>
                        {isTopMatch && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-extrabold uppercase border border-amber-300 inline-flex items-center gap-1 shadow-sm">
                            ★ BEST MATCH ({matchPct}%)
                          </span>
                        )}
                        {!isTopMatch && isWithinTopSlots && remainingSlots > 1 && (
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase border border-indigo-200 inline-flex items-center gap-1">
                            ★ TOP #{index + 1} ({matchPct}%)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        {candidate.title}
                      </div>

                      {/* Skill Match Summary */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(candidate.matchingSkills || []).map((ms, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase border flex items-center gap-1 ${ms.meetsProficiency
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                          >
                            <CheckCircle2 size={10} />
                            {ms.skill}
                          </span>
                        ))}
                        {(candidate.missingSkills || []).map((ms, idx) => (
                          <span
                            key={`miss-${idx}`}
                            className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 text-[10px] font-bold tracking-wider uppercase border border-rose-200 flex items-center gap-1"
                          >
                            <XCircle size={10} />
                            {ms.skill}
                          </span>
                        ))}
                      </div>

                      {/* Double Booking Cross-Site Warning */}
                      {candidate.isDoubleBooked && (
                        <div className="mt-2 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1.5">
                          <AlertTriangle size={12} className="text-amber-600 shrink-0" />
                          <span>{candidate.doubleBookedDetails || 'Cross-site deployment conflict detected'}</span>
                        </div>
                      )}

                      {/* Location Mismatch Notice */}
                      {candidate.locationMatches === false && (
                        <div className="mt-2 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 flex items-center gap-1.5">
                          <MapPin size={12} className="text-rose-500 shrink-0" />
                          <span>{candidate.locationMismatchReason || 'Location mismatch with deployment site'}</span>
                        </div>
                      )}

                      {/* Shift / Time Mismatch Notice */}
                      {candidate.timeMatches === false && (
                        <div className="mt-2 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1.5">
                          <Clock size={12} className="text-amber-600 shrink-0" />
                          <span>{candidate.timeMismatchReason || 'Shift time or date mismatch with deployment window'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Expand button */}
                    <button
                      onClick={() => toggleExpand(candidate.id)}
                      className="px-3 py-2 rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 text-xs font-bold border border-slate-200 transition-all flex items-center gap-1"
                      title="Why this candidate?"
                    >
                      <Info size={12} />
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>

                    {/* Assignment Action */}
                    {candidate.isAlreadyAssigned ? (
                      <div className="px-5 py-2.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs uppercase border border-emerald-200 flex items-center gap-1.5">
                        <Check size={14} />
                        <span>ASSIGNED</span>
                      </div>
                    ) : candidate.isDoubleBooked ? (
                      <button
                        disabled
                        className="px-4 py-2.5 rounded-full bg-amber-50 text-amber-700 font-bold text-xs uppercase cursor-not-allowed border border-amber-200"
                        title={candidate.doubleBookedDetails || "Cannot assign: volunteer is already deployed at another site"}
                      >
                        ASSIGNED ELSEWHERE
                      </button>
                    ) : candidate.type === 'ineligible' ? (
                      <button
                        disabled
                        className="px-5 py-2.5 rounded-full bg-rose-50 text-rose-600 font-bold text-xs uppercase cursor-not-allowed border border-rose-200"
                        title="Cannot assign: volunteer lacks required skills"
                      >
                        INELIGIBLE
                      </button>
                    ) : candidate.type === 'suitable' ? (
                      <button
                        disabled
                        className="px-5 py-2.5 rounded-full bg-amber-50 text-amber-700 font-bold text-xs uppercase cursor-not-allowed border border-amber-200"
                        title={
                          !candidate.locationMatches
                            ? `Location mismatch: ${candidate.locationMismatchReason || 'Volunteer is not in this area'}`
                            : !candidate.timeMatches
                              ? `Timing mismatch: ${candidate.timeMismatchReason || 'Volunteer is not available during shift hours'}`
                              : 'Partial match: Missing required skills or proficiency level'
                        }
                      >
                        {!candidate.locationMatches
                          ? 'LOCATION MISMATCH'
                          : !candidate.timeMatches
                            ? 'TIME MISMATCH'
                            : 'PARTIAL MATCH'}
                      </button>
                    ) : isShiftOver ? (
                      <button
                        disabled
                        className="px-4 py-2.5 rounded-full bg-slate-100 text-slate-500 font-bold text-xs uppercase cursor-not-allowed border border-slate-300"
                        title="Deployment shift has concluded for this site"
                      >
                        SHIFT CONCLUDED
                      </button>
                    ) : isSiteFull ? (
                      <button
                        disabled
                        className="px-4 py-2.5 rounded-full bg-slate-100 text-slate-500 font-bold text-xs uppercase cursor-not-allowed border border-slate-300"
                        title={`Site capacity reached (${selectedLocation?.assignedCount || selectedLocation?.totalRequired}/${selectedLocation?.totalRequired || 1})`}
                      >
                        CAPACITY FULL
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          handleAssignCandidate(
                            candidate.id,
                            selectedLocationId || locations[0]?.id
                          )
                        }
                        className={`px-6 py-2.5 rounded-full text-white font-bold text-xs uppercase shadow-md transition-all duration-200 active:scale-95 flex items-center gap-1.5 ${isTopMatch
                            ? 'bg-[#4338ca] hover:bg-[#3730a3] shadow-indigo-600/30 ring-2 ring-indigo-400'
                            : 'bg-[#4338ca] hover:bg-[#3730a3] shadow-indigo-600/25'
                          }`}
                      >
                        {isTopMatch ? '★ ASSIGN BEST MATCH' : 'ASSIGN NOW'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expandable "Why this candidate?" Section */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-0 border-t border-slate-100">
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">

                      {/* Matching Skills */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-emerald-500" />
                          Matching Skills ({candidate.matchingSkills?.length || 0}/{candidate.totalRequiredSkills || 0})
                        </h4>
                        {(candidate.matchingSkills || []).length === 0 ? (
                          <p className="text-xs text-slate-400">None</p>
                        ) : (
                          <div className="space-y-1">
                            {candidate.matchingSkills.map((ms, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs">
                                <CheckCircle2 size={12} className={ms.meetsProficiency ? 'text-emerald-500' : 'text-amber-500'} />
                                <span className="text-slate-700 font-medium">{ms.skill}</span>
                                <span className="text-slate-400">
                                  (Level {ms.proficiency}/{ms.required})
                                </span>
                                {!ms.meetsProficiency && (
                                  <span className="text-amber-600 text-[10px] font-bold">BELOW MIN</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Missing Skills */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                          <XCircle size={13} className="text-rose-500" />
                          Missing Skills ({candidate.missingSkills?.length || 0})
                        </h4>
                        {(candidate.missingSkills || []).length === 0 ? (
                          <p className="text-xs text-emerald-500 font-medium">All required skills present ✓</p>
                        ) : (
                          <div className="space-y-1">
                            {candidate.missingSkills.map((ms, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs">
                                <XCircle size={12} className="text-rose-400" />
                                <span className="text-slate-700 font-medium">{ms.skill}</span>
                                <span className="text-slate-400">(Min level {ms.minProficiency})</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Location, Availability & Experience */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                          <Info size={13} className="text-blue-500" />
                          Location & Availability
                        </h4>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <MapPin size={12} className={candidate.locationMatches !== false ? 'text-emerald-500' : 'text-rose-500'} />
                            <span className="text-slate-600">
                              Location: <strong>{candidate.homeAddress || 'Not specified'}</strong>
                              {candidate.locationMatches !== false ? (
                                <span className="text-emerald-600 ml-1 font-medium">✓ Local</span>
                              ) : (
                                <span className="text-rose-600 ml-1 font-medium">(Site: {selectedLocation?.city || selectedLocation?.address || 'Different'})</span>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={12} className={candidate.timeMatches !== false ? 'text-emerald-500' : 'text-amber-500'} />
                            <span className="text-slate-600">
                              Shift: {candidate.timeMatches !== false ? (
                                <span className="text-emerald-600 font-medium">Available for shift</span>
                              ) : (
                                <span className="text-amber-600 font-medium">{candidate.timeMismatchReason || 'Shift mismatch'}</span>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Info size={12} className="text-blue-400" />
                            <span className="text-slate-600">
                              Experience: {candidate.experienceYears != null ? `${candidate.experienceYears} year(s)` : 'Not provided'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Info size={12} className="text-blue-400" />
                            <span className="text-slate-600">
                              Mobility: {candidate.mobilityLevel || 'Not provided'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Weighted Score Breakdown */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                          <Info size={13} className="text-indigo-500" />
                          Weighted Match Score Breakdown
                        </h4>
                        <div className="space-y-1 text-xs text-slate-600">
                          <div className="flex justify-between">
                            <span>Skills & Proficiency (40%):</span>
                            <strong>{candidate.scoreBreakdown?.skillsScore ?? 'N/A'}/100</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Location Proximity (25%):</span>
                            <strong>{candidate.scoreBreakdown?.locationScore ?? 'N/A'}/100</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Availability & Shift (25%):</span>
                            <strong>{candidate.scoreBreakdown?.availabilityScore ?? 'N/A'}/100</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Experience (10%):</span>
                            <strong>{candidate.scoreBreakdown?.experienceScore ?? 'N/A'}/100</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recommendation / Comparison Reason */}
                    <div className={`mt-4 p-3.5 rounded-2xl border ${candidate.type === 'eligible'
                        ? 'bg-emerald-50 border-emerald-200'
                        : candidate.type === 'suitable'
                          ? 'bg-amber-50 border-amber-200'
                          : 'bg-rose-50 border-rose-200'
                      }`}>
                      <div className={`text-xs font-bold flex items-center gap-1.5 mb-1 ${candidate.type === 'eligible'
                          ? 'text-emerald-700'
                          : candidate.type === 'suitable'
                            ? 'text-amber-700'
                            : 'text-rose-700'
                        }`}>
                        {candidate.type === 'eligible' ? (
                          <><CheckCircle2 size={13} /> Why recommended over others?</>
                        ) : candidate.type === 'suitable' ? (
                          <><AlertTriangle size={13} /> Why partially suitable?</>
                        ) : (
                          <><XCircle size={13} /> Why ineligible?</>
                        )}
                      </div>
                      <p className={`text-xs leading-relaxed font-medium ${candidate.type === 'eligible'
                          ? 'text-emerald-800'
                          : candidate.type === 'suitable'
                            ? 'text-amber-800'
                            : 'text-rose-800'
                        }`}>
                        {candidate.recommendationReason || 'No detailed explanation available.'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-2 italic">
                        Score calculated via weighted algorithm (Skills 40%, Location 25%, Availability 25%, Experience 10%).
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CandidateMatchingPool;
