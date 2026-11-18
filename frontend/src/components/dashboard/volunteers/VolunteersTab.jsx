
import React, { useMemo, useState } from "react";
import { Loader2, UserCheck, Search } from "lucide-react";

export default function VolunteersTab({ candidates = [], loadingCandidates = false }) {
  const [search, setSearch] = useState("");

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const query = search.toLowerCase();

      return (
        (candidate.name || "").toLowerCase().includes(query) ||
        (candidate.title || "").toLowerCase().includes(query) ||
        (candidate.rawData?.phone || "").toLowerCase().includes(query) ||
        (candidate.skills || []).some((skill) =>
          skill.toLowerCase().includes(query)
        )
      );
    });
  }, [candidates, search]);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Volunteer Network Pool
          </h2>
          <p className="text-xs text-slate-500">
            All registered volunteers, their skills and certifications.
          </p>
        </div>

        <span className="text-xs font-bold text-slate-400">
          Total: {filteredCandidates.length} volunteers
        </span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-400" size={17} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone or skill..."
          className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {loadingCandidates ? (
        <div className="flex justify-center py-12">
          <Loader2 size={28} className="text-indigo-400 animate-spin" />
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          No volunteers found.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {filteredCandidates.map((cand) => (
            <div
              key={cand.id}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-sm">
                  {cand.initials}
                </div>

                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {cand.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {cand.title}
                  </div>
                  <div className="text-xs text-slate-400">
                    {cand.rawData?.phone || "Phone not available"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {cand.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-slate-100 rounded-md text-[10px] font-bold text-slate-600"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${cand.scoreColor}`}>
                  {cand.matchScore}% match
                </span>

                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <UserCheck size={14} /> Registered
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
