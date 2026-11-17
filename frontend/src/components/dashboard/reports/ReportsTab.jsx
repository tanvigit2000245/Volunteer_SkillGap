import React from 'react';
import { FileSpreadsheet, FileText, Download, Calendar, Loader2 } from 'lucide-react';

/** Reports UI. The parent owns deployment runs and export API calls. */
export default function ReportsTab({
  deploymentRuns = [],
  selectedRunId = '',
  onRunChange,
  onExport,
  exportingFormat = '',
  loadingRuns = false,
}) {
  const hasRuns = deploymentRuns.length > 0;
  const selectedRun = deploymentRuns.find(
    (run) => String(run._id || run.id) === String(selectedRunId)
  ) || deploymentRuns[0];
  const isExporting = Boolean(exportingFormat);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Deployment Reports &amp; Audit Export</h2>
        <p className="text-xs text-slate-500">Download formatted sheets for dispatch coordinators and regional command centers.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
        <label htmlFor="report-run" className="text-xs font-bold text-slate-700 flex items-center gap-2">
          <Calendar size={14} /> Select deployment run
        </label>
        <select
          id="report-run"
          value={selectedRun?._id || selectedRun?.id || ''}
          onChange={(event) => onRunChange?.(event.target.value)}
          disabled={!hasRuns || isExporting || loadingRuns}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          {!hasRuns && <option value="">No deployment runs available</option>}
          {deploymentRuns.map((run) => {
            const id = run._id || run.id;
            return <option key={id} value={id}>{run.title || 'Deployment run'} — {run.targetDate ? new Date(run.targetDate).toLocaleDateString() : 'Date not set'} ({run.status || 'DRAFT'})</option>;
          })}
        </select>
        {loadingRuns && <p className="text-[11px] text-slate-500">Loading deployment history…</p>}
        {!hasRuns && !loadingRuns && <p className="text-[11px] text-amber-700">Generate a deployment plan first. If you already generated one, refresh the dashboard to load its run history.</p>}
        {selectedRun && <p className="text-[11px] text-slate-500">Selected: <span className="font-semibold text-slate-700">{selectedRun.title || 'Deployment run'}</span></p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3 shadow-md"><FileSpreadsheet size={20} /></div>
            <h3 className="font-bold text-slate-900 text-base">Excel Deployment Sheet (.xlsx)</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">Full deployment schedule, site-by-site volunteer assignments, phone contacts, and skill-gap matrix.</p>
          </div>
          <button type="button" onClick={() => onExport?.('excel', selectedRun?._id || selectedRun?.id)} disabled={!hasRuns || isExporting} className="mt-6 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md transition-all self-start flex items-center gap-2">
            {exportingFormat === 'excel' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {exportingFormat === 'excel' ? 'Preparing Excel…' : 'Download Excel Sheet'}
          </button>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center mb-3 shadow-md"><FileText size={20} /></div>
            <h3 className="font-bold text-slate-900 text-base">Printable PDF Roster (.pdf)</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">Formal regional summary sheet for on-site check-in tables, badge verification, and emergency coordinators.</p>
          </div>
          <button type="button" onClick={() => onExport?.('pdf', selectedRun?._id || selectedRun?.id)} disabled={!hasRuns || isExporting} className="mt-6 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md transition-all self-start flex items-center gap-2">
            {exportingFormat === 'pdf' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {exportingFormat === 'pdf' ? 'Preparing PDF…' : 'Download PDF Roster'}
          </button>
        </div>
      </div>
    </div>
  );
}
