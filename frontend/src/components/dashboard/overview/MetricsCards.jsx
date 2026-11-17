import React from 'react';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from 'lucide-react';

const MetricsCards = ({ metrics }) => {
  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

      {/* Total Volunteers */}
      <div className="bg-white/95 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#edf4ff] border border-blue-100/60 flex items-center justify-center shrink-0">
          <Users size={22} className="text-[#3b82f6]" />
        </div>

        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Volunteers
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] mt-0.5">
            {(metrics?.totalVolunteers || 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Staffing Coverage */}
      <div className="bg-white/95 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#e6fbf5] border border-teal-100/60 flex items-center justify-center shrink-0">
          <CheckCircle2 size={22} className="text-[#10b981]" />
        </div>

        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Staffing Coverage
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] mt-0.5">
            {metrics?.staffingCoverage || 0}%
          </div>
        </div>
      </div>

      {/* Active Skill Gaps */}
      <div className="bg-white/95 rounded-3xl p-5 sm:p-6 border border-rose-300 shadow-[0_0_24px_rgba(244,63,94,0.18)] hover:shadow-[0_0_30px_rgba(244,63,94,0.25)] transition-all flex items-center gap-4 relative overflow-hidden">
        <div className="w-12 h-12 rounded-2xl bg-[#ffebee] border border-rose-200/70 flex items-center justify-center shrink-0">
          <AlertTriangle size={22} className="text-[#ef4444]" />
        </div>

        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Active Skill Gaps
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#ef4444] mt-0.5">
            {metrics?.activeSkillGaps || 0}
          </div>
        </div>
      </div>

      {/* Pending Reviews */}
      <div className="bg-white/95 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#fff8eb] border border-amber-100/60 flex items-center justify-center shrink-0">
          <Clock size={22} className="text-[#f59e0b]" />
        </div>

        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Pending Reviews
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] mt-0.5">
            {metrics?.pendingReviews || 0}
          </div>
        </div>
      </div>

    </section>
  );
};

export default MetricsCards;
