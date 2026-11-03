import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { RequestStats } from '../types/request';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { RequestCharts } from '../components/RequestCharts';
import { CardSkeleton, TableSkeleton } from '../components/SkeletonLoader';
import { NavTab } from '../components/Sidebar';
import {
  Inbox,
  Clock,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  Activity,
  FileText,
  Plus,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: NavTab, requestId?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<RequestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <TableSkeleton rows={4} />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
        <AlertOctagon className="mx-auto h-8 w-8 text-rose-500" />
        <h3 className="mt-2 text-sm font-bold text-rose-900">Failed to load dashboard</h3>
        <p className="mt-1 text-xs text-rose-700">{error || 'Unknown error occurred'}</p>
        <button
          onClick={fetchStats}
          className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-7 animate-fade-in" data-testid="dashboard-page">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Operations Dashboard</h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Real-time property maintenance queues and service ticket analytics
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('create')}
            data-testid="dashboard-quick-create-btn"
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Submit Request</span>
          </button>
          <button
            onClick={() => onNavigate('requests')}
            data-testid="dashboard-view-all-btn"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <span>All Requests</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Requests"
          value={stats.total}
          icon={<Inbox className="w-4 h-4 text-sky-600" />}
          subtitle="All recorded tickets"
          badge="Total"
          badgeColor="blue"
          onClick={() => onNavigate('requests')}
        />
        <StatCard
          title="Open Queue"
          value={stats.byStatus['Open'] || 0}
          icon={<Clock className="w-4 h-4 text-amber-600" />}
          subtitle="Awaiting triage or review"
          badge="Action Needed"
          badgeColor="amber"
          onClick={() => onNavigate('requests')}
        />
        <StatCard
          title="In Progress"
          value={stats.byStatus['In Progress'] || 0}
          icon={<Activity className="w-4 h-4 text-indigo-600" />}
          subtitle="Technicians dispatched"
          badge="Active"
          badgeColor="indigo"
          onClick={() => onNavigate('requests')}
        />
        <StatCard
          title="Resolved & Closed"
          value={(stats.byStatus['Completed'] || 0) + (stats.byStatus['Closed'] || 0)}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          subtitle="Fulfillments completed"
          badge="Healthy"
          badgeColor="emerald"
          onClick={() => onNavigate('requests')}
        />
      </div>

      {/* Analytics Breakdown */}
      <div>
        <div className="mb-3.5 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Workload & Urgency Analytics
          </h3>
        </div>
        <RequestCharts stats={stats} />
      </div>

      {/* Recent Requests Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Recent Service Activity</h3>
            <p className="text-xs text-slate-500 mt-0.5">Most recent property maintenance tickets</p>
          </div>
          <button
            onClick={() => onNavigate('requests')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" data-testid="dashboard-recent-table">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-2xs font-bold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3">Request ID</th>
                <th className="px-6 py-3">Title & Issue</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Priority</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Logged Date</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {stats.recent.map((req) => (
                <tr
                  key={req.id}
                  data-testid={`recent-row-${req.id}`}
                  className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                  onClick={() => onNavigate('details', req.id)}
                >
                  <td className="px-6 py-3.5 font-mono text-xs font-bold text-indigo-600 whitespace-nowrap">
                    {req.id}
                  </td>
                  <td className="px-6 py-3.5 max-w-sm">
                    <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 text-sm">
                      {req.title}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {req.description}
                    </p>
                  </td>
                  <td className="px-6 py-3.5 text-xs text-slate-600 whitespace-nowrap">
                    <span className="rounded-md bg-slate-100 px-2 py-1 font-medium">{req.category}</span>
                  </td>
                  <td className="px-6 py-3.5 whitespace-nowrap">
                    <PriorityBadge priority={req.priority} size="sm" />
                  </td>
                  <td className="px-6 py-3.5 whitespace-nowrap">
                    <StatusBadge status={req.status} size="sm" />
                  </td>
                  <td className="px-6 py-3.5 text-xs text-slate-500 whitespace-nowrap font-mono">
                    {new Date(req.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-3.5 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('details', req.id);
                      }}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
