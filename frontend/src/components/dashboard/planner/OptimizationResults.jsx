
import React from 'react';
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  TrendingUp,
  RefreshCw,
  Play,
} from 'lucide-react';

const OptimizationResults = ({
  showRecommendations,
  optimizationResult,
  locations,
  candidates,
  handleAutoFillSkillGap,
  handleUpdateView,
  isUpdating,
  selectedLocationId,
}) => {
  if (!showRecommendations || !optimizationResult) {
    return null;
  }

  const allSkillGaps = optimizationResult.detectedSkillGaps || [];
  const allAssignments = optimizationResult.proposedAssignments || [];
  const globalStats = optimizationResult.stats || {};

  // ── Determine selected site ───────────────────────────────────────────────
  const selectedLocation = selectedLocationId
    ? locations.find((l) => l.id === selectedLocationId)
    : null;

  // ── Filter data to selected site (or show all if none selected) ───────────
  const skillGaps = selectedLocationId
    ? allSkillGaps.filter((g) => g.locationId === selectedLocationId)
    : allSkillGaps;

  const assignments = selectedLocationId
    ? allAssignments.filter((a) => a.locationId === selectedLocationId)
    : allAssignments;

  // ── Per-site stats (live from selectedLocation, always up-to-date) ─────────
  const siteCoverage = selectedLocation
    ? selectedLocation.coverage ?? 0
    : Math.round(globalStats.globalCoverageRate || 0);

  const siteAssigned = selectedLocation
    ? selectedLocation.assignedCount ?? 0
    : globalStats.totalAssigned || 0;

  const siteRequired = selectedLocation
    ? selectedLocation.totalRequired ?? 1
    : null;

  const engineName = globalStats.engineUsed || 'HIGHS_MILP';

  // ── Combined Top Assignments: selected/assigned volunteers + engine proposals ─
  const assignedCandidates = selectedLocationId
    ? candidates
        .filter((c) => c.isAlreadyAssigned)
        .map((c) => ({
          volunteerId: c.id,
          name: c.name,
          matchScore: Math.round(c.matchPercentage ?? c.matchScore ?? 0),
          isSelected: true,
        }))
    : [];

  const assignedIds = new Set(assignedCandidates.map((a) => String(a.volunteerId)));
  const proposedForDisplay = assignments
    .filter((a) => !assignedIds.has(String(a.volunteerId)))
    .map((a) => {
      const cand = candidates.find((c) => c.id === a.volunteerId);
      const score = a.matchScore || 0;
      return {
        volunteerId: a.volunteerId,
        name:
          cand?.name ||
          a.volunteerDetails?.fullName ||
          `Vol …${String(a.volunteerId || '').slice(-4)}`,
        matchScore: score > 1 ? Math.round(score) : Math.round(score * 100),
        isSelected: false,
      };
    });

  const displayAssignments = [...assignedCandidates, ...proposedForDisplay];

  // ── Live remaining volunteers needed (drives gap recalculation) ───────────
  // This comes from live location state so it updates instantly after any assignment.
  const liveRemaining = selectedLocation != null
    ? Math.max(0, (selectedLocation.totalRequired || 0) - (selectedLocation.assignedCount || 0))
    : null;

  // ── Dynamically recalculate shortage per skill based on remaining slots ───
  // Uses engine's skill breakdown as a template but scales shortages down
  // as volunteers are assigned, so the display is always accurate.
  let displaySkillGaps = skillGaps;
  if (selectedLocation && liveRemaining !== null) {
    if (liveRemaining === 0) {
      // Site is fully staffed — no gaps to show
      displaySkillGaps = [];
    } else {
      const originalTotal = skillGaps.reduce((s, g) => s + (Number(g.shortage) || 0), 0);
      if (originalTotal > 0 && liveRemaining < originalTotal) {
        // Scale each gap's shortage proportionally to remaining slots
        let pool = liveRemaining;
        displaySkillGaps = skillGaps
          .map((gap, i) => {
            if (pool <= 0) return { ...gap, shortage: 0 };
            const isLast = i === skillGaps.length - 1;
            // Last gap absorbs any rounding remainder
            const share = isLast
              ? pool
              : Math.round((Number(gap.shortage) / originalTotal) * liveRemaining);
            const adjusted = Math.min(Number(gap.shortage), Math.max(0, share));
            pool -= adjusted;
            return { ...gap, shortage: adjusted };
          })
          .filter((g) => g.shortage > 0);
      }
      // If liveRemaining >= originalTotal the engine gaps are still accurate — keep as-is
    }
  }

  // ── Title & badges ────────────────────────────────────────────────────────
  const displayName = selectedLocation?.name || 'All Sites';

  // Derive region from city string (last comma-segment or full city)
  const rawCity = selectedLocation?.city || '';
  const regionTag = rawCity
    ? rawCity.split(',').pop().trim()
    : null;

  // High-priority = site still has live remaining gaps
  const isHighPriority = displaySkillGaps.length > 0;

  // ── Subtitle (uses live counts, not stale engine numbers) ─────────────────
  const subtitleText = selectedLocation
    ? `Showing data for: ${selectedLocation.name} · ${siteAssigned} assigned · ${siteRequired ?? '?'} required · ${displaySkillGaps.length} gap(s) detected`
    : `Analyzed ${locations.length} site(s) · ${globalStats.totalAssigned || 0} volunteer(s) assigned · ${globalStats.totalGaps || 0} gap(s) detected`;

  return (
    <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-indigo-700">

      {/* ── Header row ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-indigo-700/60">

        {/* Left: icon + title + badges */}
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/30 flex items-center justify-center text-teal-300 shrink-0 mt-0.5">
            <Zap size={20} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-sm sm:text-base leading-tight">
                Optimization Engine:&nbsp;
                <span className="text-teal-200">{displayName}</span>
              </h3>

              {/* Algorithm badge */}
              <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] uppercase font-bold tracking-wider shrink-0">
                {engineName}
              </span>

              {/* Region badge (derived from location city) */}
              {regionTag && (
                <span className="px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 text-[10px] font-bold uppercase shrink-0">
                  {regionTag}
                </span>
              )}

              {/* High Priority badge when gaps exist */}
              {isHighPriority && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/25 text-rose-300 text-[10px] font-bold uppercase border border-rose-500/30 shrink-0">
                  High Priority
                </span>
              )}
            </div>

            <p className="text-[11px] text-indigo-300 mt-1 leading-relaxed">{subtitleText}</p>
          </div>
        </div>

        {/* Right: Refresh icon + Run Optimization button */}
        <div className="flex items-center gap-2 shrink-0">
          {handleUpdateView && (
            <button
              onClick={handleUpdateView}
              disabled={isUpdating}
              title="Re-run optimization engine"
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-indigo-200 hover:text-white transition-all disabled:opacity-40 border border-white/10"
            >
              <RefreshCw size={15} className={isUpdating ? 'animate-spin' : ''} />
            </button>
          )}

          <button
            onClick={handleAutoFillSkillGap}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-xs shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap"
          >
            <Play size={13} className="fill-white" />
            <span>Run Optimization</span>
          </button>
        </div>
      </div>

      {/* ── Three info panels ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">

        {/* Panel 1 — Detected Skill Gaps */}
        <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
          <div className="text-[11px] font-bold text-rose-300 flex items-center gap-1.5 mb-3">
            <AlertTriangle size={13} />
            <span>Detected Skill Gaps ({displaySkillGaps.length})</span>
          </div>

          {displaySkillGaps.length === 0 ? (
            <div className="text-[11px] text-emerald-300 font-bold flex items-center gap-1.5">
              <CheckCircle2 size={12} />
              {liveRemaining === 0 ? '✓ Site fully staffed — no gaps!' : 'No skill gaps for this site!'}
            </div>
          ) : (
            <>
              {displaySkillGaps.slice(0, 4).map((gap, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[11px] text-indigo-200 mt-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1 shrink-0" />
                  <span>
                    <strong className="text-white">{gap.requiredSkill}</strong>
                    {' '}— short {gap.shortage}
                    {!selectedLocationId && (
                      <span className="text-indigo-400">
                        {' '}· site …{String(gap.locationId).slice(-4)}
                      </span>
                    )}
                  </span>
                </div>
              ))}
              {displaySkillGaps.length > 4 && (
                <div className="text-[10px] text-indigo-400 mt-2">
                  +{displaySkillGaps.length - 4} more gap(s)…
                </div>
              )}
            </>
          )}
        </div>

        {/* Panel 2 — Top Assignments (numbered inline chips) */}
        <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
          <div className="text-[11px] font-bold text-sky-300 flex items-center gap-1.5 mb-3">
            <Cpu size={13} />
            <span>Top Assignments ({displayAssignments.length})</span>
          </div>

          {displayAssignments.length === 0 ? (
            <div className="text-[11px] text-indigo-300/70">
              No assignments proposed for this site yet.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {displayAssignments.slice(0, 3).map((assignment, i) => {
                  const pct = assignment.matchScore || 0;
                  const chipColor =
                    pct >= 90 ? 'bg-emerald-500' :
                    pct >= 75 ? 'bg-sky-500' :
                    'bg-amber-500';

                  return (
                    <div key={assignment.volunteerId || i} className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-indigo-400 font-bold">{i + 1}.</span>
                      <span className="text-white font-semibold truncate max-w-[90px]">{assignment.name}</span>
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold text-white ${chipColor}`}>
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>

              {displayAssignments.length > 3 && (
                <div className="text-[10px] text-indigo-400 mt-2">
                  +{displayAssignments.length - 3} more…
                </div>
              )}
            </>
          )}
        </div>

        {/* Panel 3 — Site Stats */}
        <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
          <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5 mb-3">
            <TrendingUp size={13} />
            <span className="truncate">
              {selectedLocation
                ? `Site Stats — ${selectedLocation.name}`
                : 'Engine Stats'}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="text-[11px] text-indigo-200">
              Coverage:{' '}
              <strong className="text-white">{siteCoverage}%</strong>
            </div>

            <div className="text-[11px] text-indigo-200">
              Assigned:{' '}
              <strong className="text-white">
                {siteAssigned}
                {siteRequired != null ? ` / ${siteRequired}` : ''}
              </strong>
            </div>

            <div className="text-[11px] text-indigo-200">
              Skill Gaps:{' '}
              {(() => {
                const volunteersLeft = selectedLocation && liveRemaining !== null
                  ? liveRemaining
                  : displaySkillGaps.reduce((sum, g) => sum + (Number(g.shortage) || 0), 0);
                return (
                  <strong className={volunteersLeft > 0 ? 'text-rose-300' : 'text-emerald-300'}>
                    {volunteersLeft}
                  </strong>
                );
              })()}
            </div>

            <div className="text-[11px] text-indigo-200">
              Solver:{' '}
              <strong className="text-white">{engineName}</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OptimizationResults;
