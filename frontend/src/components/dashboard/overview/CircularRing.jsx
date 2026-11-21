import React from 'react';

function CircularRing({ coverage, assignedCount, totalRequired }) {
  const hasAssigned = Number(assignedCount) > 0;
  const pct = hasAssigned ? Math.min(100, Math.max(0, Number(coverage) || 0)) : 0;
  const isFullyStaffed = pct >= 100;

  return (
    <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
      <svg
        className="w-full h-full transform -rotate-90"
        viewBox="0 0 36 36"
      >
        {/* Background Circle */}
        <path
          className="text-slate-100"
          strokeWidth="3.5"
          stroke="currentColor"
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />

        {/* Progress Circle */}
        {hasAssigned && (
          <path
            className={
              isFullyStaffed ? 'text-[#10b981]' : 'text-[#4338ca]'
            }
            strokeDasharray={`${pct}, 100`}
            strokeWidth="3.5"
            strokeLinecap="round"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        )}
      </svg>

      <span className={`absolute font-bold ${hasAssigned ? 'text-xs text-slate-700' : 'text-[11px] text-slate-400 font-mono'}`}>
        {hasAssigned ? `${pct}%` : `0/${totalRequired || 1}`}
      </span>
    </div>
  );
}

export default CircularRing;
