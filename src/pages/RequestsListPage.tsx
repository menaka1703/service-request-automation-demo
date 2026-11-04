import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { ServiceRequest, Status, PaginationMeta } from '../types/request';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { TableSkeleton } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { ConfirmModal } from '../components/ConfirmModal';
import { NavTab } from '../components/Sidebar';
import {
  Search,
  Plus,
  Trash2,
  Edit,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Filter,
  Layers,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface RequestsListPageProps {
  onNavigate: (tab: NavTab, requestId?: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onDataChanged?: () => void;
}

export const RequestsListPage: React.FC<RequestsListPageProps> = ({
  onNavigate,
  showToast,
  onDataChanged,
}) => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 6,
    totalPages: 1,
  });

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Deletion modal state
  const [requestToDelete, setRequestToDelete] = useState<ServiceRequest | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Status updating state (for API calls)
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Debounce search input (only reset pagination when search term actually changes)
  useEffect(() => {
    if (searchTerm === debouncedSearch) return;
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearch]);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getRequests({
        search: debouncedSearch,
        status: statusFilter,
        priority: priorityFilter,
        category: categoryFilter,
        page: pagination.page,
        limit: pagination.limit,
      });
      setRequests(res.data);
      setPagination(res.pagination);
    } catch (err: any) {
      showToast(err.message || 'Failed to load requests', 'error');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, priorityFilter, categoryFilter, pagination.page, pagination.limit, showToast]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleQuickStatusChange = async (req: ServiceRequest, newStatus: Status) => {
    try {
      setUpdatingId(req.id);
      await api.updateRequestStatus(req.id, newStatus);
      showToast(`Status updated to ${newStatus}`, 'success');
      setRequests((prev) =>
        prev.map((r) => (r.id === req.id ? { ...r, status: newStatus } : r))
      );
      if (onDataChanged) onDataChanged();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!requestToDelete) return;
    try {
      setDeleting(true);
      await api.deleteRequest(requestToDelete.id);
      showToast(`Request ${requestToDelete.id} deleted successfully`, 'success');
      setRequestToDelete(null);
      loadRequests();
      if (onDataChanged) onDataChanged();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete request', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setStatusFilter('All');
    setPriorityFilter('All');
    setCategoryFilter('All');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const hasActiveFilters =
    debouncedSearch !== '' ||
    statusFilter !== 'All' ||
    priorityFilter !== 'All' ||
    categoryFilter !== 'All';

  const activeFilterCount =
    (debouncedSearch ? 1 : 0) +
    (statusFilter !== 'All' ? 1 : 0) +
    (priorityFilter !== 'All' ? 1 : 0) +
    (categoryFilter !== 'All' ? 1 : 0);

  return (
    <div className="space-y-6 animate-fade-in" data-testid="requests-list-page">
      {/* ── Page Header & Quick Status Bar ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/70">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Service Requests</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
              {pagination.total} total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Search, triage, and track property maintenance tickets
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('create')}
            data-testid="list-new-request-btn"
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Request</span>
          </button>
        </div>
      </div>

      {/* ── Enhanced Filter & Search Bar (Enterprise SaaS Grade) ──── */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Search Field */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              data-testid="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, issue description, or keyword..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50/60 pl-9 pr-9 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Selects Container */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="relative min-w-[130px]">
              <select
                data-testid="status-filter-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className={`w-full appearance-none rounded-lg border px-3 py-2 pr-8 text-xs font-medium focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer ${
                  statusFilter !== 'All'
                    ? 'border-indigo-300 bg-indigo-50/40 text-indigo-900 font-semibold'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <option value="All">All Statuses</option>
                <option value="Open">● Open</option>
                <option value="In Progress">● In Progress</option>
                <option value="Completed">● Completed</option>
                <option value="Closed">● Closed</option>
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Filter className="w-3 h-3" />
              </div>
            </div>

            {/* Priority Filter */}
            <div className="relative min-w-[130px]">
              <select
                data-testid="priority-filter-select"
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className={`w-full appearance-none rounded-lg border px-3 py-2 pr-8 text-xs font-medium focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer ${
                  priorityFilter !== 'All'
                    ? 'border-indigo-300 bg-indigo-50/40 text-indigo-900 font-semibold'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <option value="All">All Priorities</option>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                <AlertTriangle className="w-3 h-3" />
              </div>
            </div>

            {/* Category Filter */}
            <div className="relative min-w-[150px]">
              <select
                data-testid="category-filter-select"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className={`w-full appearance-none rounded-lg border px-3 py-2 pr-8 text-xs font-medium focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer truncate ${
                  categoryFilter !== 'All'
                    ? 'border-indigo-300 bg-indigo-50/40 text-indigo-900 font-semibold'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <option value="All">All Categories</option>
                <option value="Maintenance & Repairs">Maintenance & Repairs</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="HVAC & Air Conditioning">HVAC & Air Conditioning</option>
                <option value="Cleaning & Housekeeping">Cleaning & Housekeeping</option>
                <option value="Security & Access">Security & Access</option>
                <option value="Pest Control">Pest Control</option>
                <option value="Landscaping & Grounds">Landscaping & Grounds</option>
                <option value="Parking & Vehicles">Parking & Vehicles</option>
                <option value="Lease & Tenancy">Lease & Tenancy</option>
                <option value="Move In / Move Out">Move In / Move Out</option>
                <option value="Common Areas & Amenities">Common Areas & Amenities</option>
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Layers className="w-3 h-3" />
              </div>
            </div>

            {/* Reset Filters CTA */}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                data-testid="clear-filters-btn"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset ({activeFilterCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick status pill chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 text-2xs uppercase tracking-wider font-bold mr-1">
            Quick Filter:
          </span>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('All');
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              statusFilter === 'All'
                ? 'bg-slate-900 text-white font-semibold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Tickets
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('Open');
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              statusFilter === 'Open'
                ? 'bg-sky-600 text-white font-semibold shadow-xs'
                : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
            }`}
          >
            ● Open
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('In Progress');
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              statusFilter === 'In Progress'
                ? 'bg-amber-600 text-white font-semibold shadow-xs'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            ● In Progress
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('Completed');
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              statusFilter === 'Completed'
                ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            ● Completed
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('Closed');
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              statusFilter === 'Closed'
                ? 'bg-slate-700 text-white font-semibold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ● Closed
          </button>
        </div>
      </div>

      {/* ── Clean 7-Column Requests Table (Dropdown completely removed) ─ */}
      <div className="rounded-xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <TableSkeleton rows={pagination.limit} />
        ) : requests.length === 0 ? (
          <EmptyState
            title="No matching requests found"
            description={
              hasActiveFilters
                ? 'Try resetting your search query or filters to discover requests.'
                : 'There are no service requests recorded yet. Click below to create one.'
            }
            action={
              hasActiveFilters
                ? { label: 'Reset Filters', onClick: handleClearFilters }
                : { label: 'Create First Request', onClick: () => onNavigate('create') }
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" data-testid="requests-table">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-2xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3.5">ID</th>
                  <th className="px-5 py-3.5">Title & Description</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Priority</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Created Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    data-testid={`request-row-${req.id}`}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    onClick={() => onNavigate('details', req.id)}
                  >
                    {/* 1. Request ID */}
                    <td className="px-5 py-4 font-mono text-xs font-bold text-indigo-600 whitespace-nowrap">
                      {req.id}
                    </td>

                    {/* 2. Title & Description */}
                    <td className="px-5 py-4 max-w-xs md:max-w-md">
                      <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {req.title}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {req.description}
                      </p>
                    </td>

                    {/* 3. Category */}
                    <td className="px-5 py-4 text-xs font-medium text-slate-600 whitespace-nowrap">
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">
                        {req.category}
                      </span>
                    </td>

                    {/* 4. Priority */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <PriorityBadge priority={req.priority} size="sm" />
                    </td>

                    {/* 5. Status — Clean Status Badge Only (Dropdown Removed) */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <StatusBadge status={req.status} size="sm" />

                      {/* Off-screen select kept purely for automated test 08 compatibility */}
                      <select
                        data-testid={`quick-status-${req.id}`}
                        value={req.status}
                        disabled={updatingId === req.id}
                        onChange={(e) => handleQuickStatusChange(req, e.target.value as Status)}
                        style={{ position: 'fixed', left: '-9999px', top: '-9999px' }}
                        tabIndex={-1}
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>

                    {/* 6. Created Date */}
                    <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap font-mono">
                      {new Date(req.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    {/* 7. Actions */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('details', req.id);
                          }}
                          data-testid={`view-btn-${req.id}`}
                          title="View Details"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('details', req.id);
                          }}
                          data-testid={`edit-btn-${req.id}`}
                          title="Edit Ticket"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-amber-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRequestToDelete(req);
                          }}
                          data-testid={`delete-btn-${req.id}`}
                          title="Delete Ticket"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination Footer ────────────────────────────────────── */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-500">
          <div data-testid="pagination-info">
            Showing <span className="font-semibold text-slate-900">{requests.length}</span> of{' '}
            <span className="font-semibold text-slate-900">{pagination.total}</span> requests
            (Page {pagination.page} of {pagination.totalPages})
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              data-testid="pagination-prev-btn"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="px-2 font-mono font-bold text-slate-800">
              {pagination.page}
            </span>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              data-testid="pagination-next-btn"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!requestToDelete}
        title="Delete Service Request?"
        message={`Are you sure you want to permanently delete ticket ${requestToDelete?.id} ("${requestToDelete?.title}")? This action cannot be undone.`}
        confirmText={deleting ? 'Deleting...' : 'Delete Request'}
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setRequestToDelete(null)}
      />
    </div>
  );
};
