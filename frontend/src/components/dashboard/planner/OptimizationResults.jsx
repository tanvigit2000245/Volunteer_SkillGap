
import React from 'react';
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  TrendingUp,
} from 'lucide-react';

const OptimizationResults = ({
  showRecommendations,
  optimizationResult,
  locations,
  candidates,
  handleAutoFillSkillGap,
}) => {
  if (!showRecommendations || !optimizationResult) {
    return null;
  }

  const skillGaps = optimizationResult.detectedSkillGaps || [];
  const assignments = optimizationResult.proposedAssignments || [];
  const stats = optimizationResult.stats || {};

  return (
    <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white rounded-3xl p-6 shadow-xl border border-indigo-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-indigo-700/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/30 flex items-center justify-center text-teal-300">
            <Zap size={20} />
          </div>

          <div>
            <h3 className="font-extrabold text-base flex items-center gap-2">
              <span>Optimization Engine: How to Fill the Skill Gap</span>

              <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] uppercase font-bold tracking-wider">
                {stats.engineUsed || 'Greedy Heuristic'}
              </span>
            </h3>

            <p className="text-xs text-indigo-200">
              Analyzed {locations.length} site(s) ·{' '}
              {stats.totalAssigned || 0} volunteer(s) assigned ·{' '}
              {stats.totalGaps || 0} gap(s) detected
            </p>
          </div>
        </div>

        <button
          onClick={handleAutoFillSkillGap}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-xs shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2 shrink-0 active:scale-95"
        >
          <CheckCircle2 size={16} />
          <span>Generate Deployment Plan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">

        {/* Skill Gaps */}
        <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
          <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5 mb-2">
            <AlertTriangle size={14} />
            <span>Detected Skill Gaps ({skillGaps.length})</span>
          </div>

          {skillGaps.slice(0, 3).map((gap, index) => (
            <div key={index} className="text-[11px] text-indigo-200 mt-1">
              <strong className="text-white">{gap.requiredSkill}</strong>
              {' '}— short {gap.shortage} at site{' '}
              {String(gap.locationId).slice(-6)}
            </div>
          ))}

          {skillGaps.length === 0 && (
            <div className="text-[11px] text-emerald-300 font-bold">
              ✓ No skill gaps detected!
            </div>
          )}
        </div>

        {/* Top Assignments */}
        <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
          <div className="text-xs font-bold text-sky-300 flex items-center gap-1.5 mb-2">
            <Cpu size={14} />
            <span>Top Assignments ({assignments.length})</span>
          </div>

          {assignments.slice(0, 3).map((assignment, index) => {
            const candidate = candidates.find(
              (c) => c.id === assignment.volunteerId
            );

            return (
              <div key={index} className="text-[11px] text-indigo-200 mt-1">
                <strong className="text-white">
                  {candidate?.name || assignment.volunteerId?.slice(-6)}
                </strong>
                {' '}→ {assignment.task} (
                {Math.round((assignment.matchScore || 0) * 100)}%)
              </div>
            );
          })}
        </div>

        {/* Engine Stats */}
        <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
          <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-2">
            <TrendingUp size={14} />
            <span>Engine Stats</span>
          </div>

          <div className="text-[11px] text-indigo-200 mt-1">
            Coverage:{' '}
            <strong className="text-white">
              {Math.round(stats.globalCoverageRate || 0)}%
            </strong>
          </div>

          <div className="text-[11px] text-indigo-200 mt-1">
            Assigned:{' '}
            <strong className="text-white">
              {stats.totalAssigned || 0}
            </strong>
          </div>

          <div className="text-[11px] text-indigo-200 mt-1">
            Solver:{' '}
            <strong className="text-white">
              {stats.engineUsed || 'greedy'}
            </strong>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OptimizationResults;
