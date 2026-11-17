import React from 'react';
import { Shield, Loader2, UserMinus, UserCheck, Layers } from 'lucide-react';

/** Extracted from AuthenticatedView. Shared state remains owned by the parent. */
export default function AdminTab(props) {
  const { loadingUsers, usersList, handleToggleCoordinator, deploymentRuns } = props;
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Shield size={20} className="text-purple-600" />
                  <span>Admin Role Manager: Make or Remove Coordinators</span>
                </h2>
                <p className="text-xs text-slate-500">Role changes persist directly to MongoDB via the backend API.</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold uppercase">Admin Authority</span>
            </div>

            {loadingUsers ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={28} className="text-purple-400 animate-spin" />
                <span className="ml-3 text-sm text-slate-400">Loading users from database…</span>
              </div>
            ) : usersList.length === 0 ? (
              <div className="text-center py-12 text-slate-400">No users found in database.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                      <th className="pb-3 px-3">User</th>
                      <th className="pb-3 px-3">Email</th>
                      <th className="pb-3 px-3">Current Role</th>
                      <th className="pb-3 px-3">Joined</th>
                      <th className="pb-3 px-3 text-right">Admin Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {usersList.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-3 font-bold text-slate-900">{u.fullName}</td>
                        <td className="py-3.5 px-3 text-slate-500">{u.email}</td>
                        <td className="py-3.5 px-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${u.role === 'admin' ? 'bg-purple-100 text-purple-800 border-purple-200' : u.role === 'coordinator' ? 'bg-sky-100 text-sky-800 border-sky-200' : 'bg-teal-100 text-teal-800 border-teal-200'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-400">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          {u.role === 'admin' ? (
                            <span className="text-slate-400 font-semibold italic text-[11px]">Primary Admin</span>
                          ) : u.role === 'coordinator' ? (
                            <button
                              onClick={() => handleToggleCoordinator(u)}
                              className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-all flex items-center gap-1.5 ml-auto"
                            >
                              <UserMinus size={13} />
                              <span>Remove Coordinator</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleCoordinator(u)}
                              className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all flex items-center gap-1.5 ml-auto"
                            >
                              <UserCheck size={13} />
                              <span>Make Coordinator</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Deployment Runs */}
            {deploymentRuns.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <Layers size={16} className="text-indigo-500" />
                  Recent Deployment Runs ({deploymentRuns.length})
                </h3>
                <div className="space-y-2">
                  {deploymentRuns.slice(0, 5).map((run) => (
                    <div key={run._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div>
                        <div className="font-bold text-slate-800">{run.title}</div>
                        <div className="text-slate-400">{run.targetDate ? new Date(run.targetDate).toLocaleDateString() : '—'}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${run.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' : run.status === 'CANCELLED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                        {run.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
  );
}
