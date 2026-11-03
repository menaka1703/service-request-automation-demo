import React from 'react';
import { RequestStats } from '../types/request';

interface RequestChartsProps {
  stats: RequestStats;
}

export const RequestCharts: React.FC<RequestChartsProps> = ({ stats }) => {
  const total = stats.total || 1;

  const statusColors: Record<string, string> = {
    'Open': 'bg-sky-500',
    'In Progress': 'bg-amber-500',
    'Completed': 'bg-emerald-500',
    'Closed': 'bg-slate-400',
  };

  const priorityColors: Record<string, string> = {
    'Urgent': 'bg-rose-500',
    'High': 'bg-orange-500',
    'Medium': 'bg-indigo-500',
    'Low': 'bg-slate-400',
  };

  // Sort categories by highest volume and show active categories
  const activeCategories = Object.entries(stats.byCategory || {})
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxActiveCategory = Math.max(...activeCategories.map(([_, c]) => c), 1);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      {/* 1. Status Lifecycle */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-slate-300">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">Status Distribution</h4>
            <p className="text-xs text-slate-500">Live request states</p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
            {stats.total} total
          </span>
        </div>

        <div className="mt-4">
          {/* Progress bar */}
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100 gap-0.5 p-0.5">
            {Object.entries(stats.byStatus).map(([status, count]) => {
              const pct = (count / total) * 100;
              if (pct === 0) return null;
              return (
                <div
                  key={status}
                  style={{ width: `${pct}%` }}
                  className={`h-full rounded-full ${statusColors[status] || 'bg-slate-300'}`}
                  title={`${status}: ${count}`}
                />
              );
            })}
          </div>

          <div className="mt-4 space-y-2.5">
            {Object.entries(stats.byStatus).map(([status, count]) => {
              const pct = Math.round((count / total) * 100);
              return (
                <div key={status} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${statusColors[status] || 'bg-slate-300'}`} />
                    <span className="font-medium text-slate-700">{status}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-semibold text-slate-900">{count}</span>
                    <span className="text-slate-400 text-2xs w-8 text-right">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Priority Breakdown */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-slate-300">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">Priority Urgency</h4>
            <p className="text-xs text-slate-500">SLA triage breakdown</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {(['Urgent', 'High', 'Medium', 'Low'] as const).map((p) => {
            const count = stats.byPriority[p] || 0;
            const pct = Math.round((count / total) * 100);
            return (
              <div key={p} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${priorityColors[p]}`} />
                    <span className="font-medium text-slate-700">{p}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="font-semibold text-slate-900">{count}</span>
                    <span className="text-slate-400 text-2xs">({pct}%)</span>
                  </div>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    style={{ width: `${pct}%` }}
                    className={`h-full rounded-full ${priorityColors[p]}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Top Active Categories */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-slate-300">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">Top Workload Categories</h4>
            <p className="text-xs text-slate-500">Highest ticket volume</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {activeCategories.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No service data recorded yet</p>
          ) : (
            activeCategories.map(([cat, count]) => {
              const widthPct = Math.round((count / maxActiveCategory) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 truncate max-w-[170px]" title={cat}>
                      {cat}
                    </span>
                    <span className="font-semibold text-slate-900 font-mono">{count}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      style={{ width: `${widthPct}%` }}
                      className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
