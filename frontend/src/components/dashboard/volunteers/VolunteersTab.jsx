import React from 'react';
import { Loader2, UserCheck } from 'lucide-react';

/** Extracted from AuthenticatedView. Shared state remains owned by the parent. */
export default function VolunteersTab(props) {
  const { candidates, loadingCandidates } = props;
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Volunteer Network Pool</h2>
                <p className="text-xs text-slate-500">All registered volunteers, their skills and certifications from MongoDB.</p>
              </div>
              <div className="text-xs font-bold text-slate-400">Total: {candidates.length} volunteers</div>
            </div>

            {loadingCandidates ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={28} className="text-indigo-400 animate-spin" />
              </div>
            ) : candidates.length === 0 ? (
              <div className="text-center py-12 text-slate-400">No volunteers found in database.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {candidates.map((cand) => (
                  <div key={cand.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-sm border">
                        {cand.initials}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{cand.name}</div>
                        <div className="text-xs text-slate-500">{cand.title}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {cand.skills.map((s, idx) => (
                        <span key={idx} className="px-2 py-1 bg-slate-100 rounded-md text-[10px] font-bold text-slate-600">{s}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cand.scoreColor}`}>{cand.matchScore}% match</span>
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <UserCheck size={14} /> Verified
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
  );
}
