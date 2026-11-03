import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ServiceRequest, Priority, Status, Category } from '../types/request';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { ConfirmModal } from '../components/ConfirmModal';
import { NavTab } from '../components/Sidebar';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Calendar,
  Clock,
  Save,
  X,
  AlertCircle,
  Copy,
  Check,
  Building2,
  User,
  Phone,
  DoorOpen,
  ShieldAlert,
  Wrench,
  CheckCircle2,
  FileText,
  MapPin,
  CalendarClock,
  Sparkles,
  Timer,
} from 'lucide-react';

interface RequestDetailsPageProps {
  requestId: string;
  onNavigate: (tab: NavTab, requestId?: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onDataChanged?: () => void;
}

const CATEGORIES: Category[] = [
  'Maintenance & Repairs',
  'Plumbing',
  'Electrical',
  'HVAC & Air Conditioning',
  'Cleaning & Housekeeping',
  'Security & Access',
  'Pest Control',
  'Landscaping & Grounds',
  'Parking & Vehicles',
  'Lease & Tenancy',
  'Move In / Move Out',
  'Common Areas & Amenities',
];

const PRIORITIES: Priority[] = ['Low', 'Medium', 'High', 'Urgent'];
const STATUSES: Status[] = ['Open', 'In Progress', 'Completed', 'Closed'];

interface ParsedPropertyDetails {
  unit?: string;
  building?: string;
  floor?: string;
  requester?: string;
  contact?: string;
  preferredDate?: string;
  entryAllowed?: string;
  notes?: string;
}

function parsePropertyMetadata(description: string): {
  cleanDescription: string;
  details: ParsedPropertyDetails;
} {
  const details: ParsedPropertyDetails = {};
  const splitMarker = '— Property Details —';

  if (!description.includes(splitMarker)) {
    return { cleanDescription: description, details };
  }

  const [mainPart, metaPart] = description.split(splitMarker);
  const lines = metaPart.split('\n').map((l) => l.trim()).filter(Boolean);

  lines.forEach((line) => {
    if (line.startsWith('Unit:')) details.unit = line.replace('Unit:', '').trim();
    else if (line.startsWith('Block/Building:')) details.building = line.replace('Block/Building:', '').trim();
    else if (line.startsWith('Floor:')) details.floor = line.replace('Floor:', '').trim();
    else if (line.startsWith('Requester:')) details.requester = line.replace('Requester:', '').trim();
    else if (line.startsWith('Contact:')) details.contact = line.replace('Contact:', '').trim();
    else if (line.startsWith('Preferred Visit Date:')) details.preferredDate = line.replace('Preferred Visit Date:', '').trim();
    else if (line.startsWith('Entry Without Tenant:')) details.entryAllowed = line.replace('Entry Without Tenant:', '').trim();
    else if (line.startsWith('Notes:')) details.notes = line.replace('Notes:', '').trim();
  });

  return { cleanDescription: mainPart.trim(), details };
}

function getSlaTarget(priority: Priority): { label: string; hours: string; color: string } {
  switch (priority) {
    case 'Urgent':
      return { label: 'Urgent Dispatch', hours: '< 4 Hours SLA', color: 'text-rose-700 bg-rose-50 border-rose-200' };
    case 'High':
      return { label: 'High Priority', hours: '< 24 Hours SLA', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    case 'Medium':
      return { label: 'Standard Ticket', hours: '< 48 Hours SLA', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
    case 'Low':
    default:
      return { label: 'Routine Service', hours: '< 5 Days SLA', color: 'text-slate-700 bg-slate-100 border-slate-200' };
  }
}

export const RequestDetailsPage: React.FC<RequestDetailsPageProps> = ({
  requestId,
  onNavigate,
  showToast,
  onDataChanged,
}) => {
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState<Category>('Maintenance & Repairs');
  const [editPriority, setEditPriority] = useState<Priority>('Medium');
  const [editStatus, setEditStatus] = useState<Status>('Open');
  const [saving, setSaving] = useState(false);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Copy ID indicator
  const [copied, setCopied] = useState(false);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getRequestById(requestId);
      setRequest(data);
      setEditTitle(data.title);
      setEditDescription(data.description);
      setEditCategory(data.category as Category);
      setEditPriority(data.priority);
      setEditStatus(data.status);
    } catch (err: any) {
      setError(err.message || 'Request not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (requestId) {
      fetchRequest();
    }
  }, [requestId]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(requestId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || editTitle.trim().length < 3) {
      showToast('Title must be at least 3 characters', 'error');
      return;
    }
    if (!editDescription.trim() || editDescription.trim().length < 5) {
      showToast('Description must be at least 5 characters', 'error');
      return;
    }

    try {
      setSaving(true);
      const updated = await api.updateRequest(requestId, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        category: editCategory,
        priority: editPriority,
        status: editStatus,
      });
      setRequest(updated);
      setIsEditing(false);
      showToast('Service request updated successfully', 'success');
      if (onDataChanged) onDataChanged();
    } catch (err: any) {
      showToast(err.message || 'Failed to update request', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusTransition = async (newStatus: Status) => {
    try {
      const updated = await api.updateRequestStatus(requestId, newStatus);
      setRequest(updated);
      setEditStatus(newStatus);
      showToast(`Status changed to ${newStatus}`, 'success');
      if (onDataChanged) onDataChanged();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.deleteRequest(requestId);
      showToast(`Request ${requestId} deleted successfully`, 'success');
      if (onDataChanged) onDataChanged();
      onNavigate('requests');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete request', 'error');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto rounded-2xl border border-slate-200 bg-white p-8 animate-pulse space-y-6">
        <div className="h-6 w-32 bg-slate-200 rounded"></div>
        <div className="h-8 w-3/4 bg-slate-200 rounded"></div>
        <div className="h-28 w-full bg-slate-100 rounded"></div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="max-w-md mx-auto text-center p-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="mt-3 text-lg font-bold text-slate-900">Request Not Found</h3>
        <p className="mt-1 text-sm text-slate-500">{error || 'The requested ticket does not exist.'}</p>
        <button
          onClick={() => onNavigate('requests')}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Requests</span>
        </button>
      </div>
    );
  }

  const { cleanDescription, details } = parsePropertyMetadata(request.description);
  const sla = getSlaTarget(request.priority);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-fade-in" data-testid="request-details-page">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          onClick={() => onNavigate('requests')}
          data-testid="back-to-requests-btn"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Service Requests</span>
        </button>

        <div className="flex items-center gap-2.5">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                data-testid="edit-request-btn"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit Ticket</span>
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                data-testid="delete-request-btn"
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/80 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-all shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                data-testid="save-request-btn"
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Ticket Container */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Ticket Header Banner */}
        <div className="p-6 sm:p-7 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 via-white to-slate-50/40">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                data-testid="details-request-id"
                className="font-mono text-sm font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-3 py-1 rounded-lg"
              >
                {request.id}
              </span>
              <button
                onClick={handleCopyId}
                title="Copy Ticket ID"
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">•</span>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                Property Maintenance
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <PriorityBadge priority={request.priority} />
              <StatusBadge status={request.status} />
            </div>
          </div>

          <div className="mt-4">
            <h1
              data-testid="details-request-title"
              className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug"
            >
              {request.title}
            </h1>
          </div>
        </div>

        {/* Content Section: View vs Edit Mode */}
        {!isEditing ? (
          <div className="p-6 sm:p-7 space-y-6">
            {/* Quick Property & Resident Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Property Location */}
              <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/40 space-y-2.5">
                <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider">
                  <Building2 className="w-4 h-4" />
                  <span>Property & Location</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                    <span className="text-slate-500">Unit / Flat:</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {details.unit || 'Unit 204'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                    <span className="text-slate-500">Building / Block:</span>
                    <span className="font-semibold text-slate-800">
                      {details.building || 'Main Residential Tower'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-500">Floor Level:</span>
                    <span className="font-semibold text-slate-800">
                      {details.floor || 'Floor Level 2'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Tenant & Contact */}
              <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/40 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs uppercase tracking-wider">
                  <User className="w-4 h-4" />
                  <span>Resident & Access</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                    <span className="text-slate-500">Resident:</span>
                    <span className="font-bold text-slate-900">
                      {details.requester || 'Primary Tenant'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                    <span className="text-slate-500">Contact:</span>
                    <span className="font-semibold text-slate-800">
                      {details.contact || '+91 98765 12345'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-500">Unattended Entry:</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                        details.entryAllowed === 'Yes'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {details.entryAllowed === 'Yes' ? 'Permitted' : 'Tenant Required'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: SLA & Dispatch */}
              <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/40 space-y-2.5">
                <div className="flex items-center gap-2 text-purple-600 font-semibold text-xs uppercase tracking-wider">
                  <Timer className="w-4 h-4" />
                  <span>Triage & Service SLA</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                    <span className="text-slate-500">Target Response:</span>
                    <span className={`font-bold px-2 py-0.5 rounded border text-[11px] ${sla.color}`}>
                      {sla.hours}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                    <span className="text-slate-500">Dispatch Queue:</span>
                    <span className="font-semibold text-slate-800">Facility Operations</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-500">Visit Window:</span>
                    <span className="font-semibold text-slate-800">
                      {details.preferredDate || 'Earliest Available'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description & Work Details */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Description & Maintenance Scope</span>
                </h4>
                <span className="text-[11px] text-slate-400">Verbatim submission</span>
              </div>
              
              {/* Preserved test hook with full description */}
              <div
                data-testid="details-request-description"
                className="rounded-xl bg-slate-50 border border-slate-200/80 p-5 text-sm text-slate-800 leading-relaxed whitespace-pre-line font-normal"
              >
                {request.description}
              </div>
            </div>

            {/* Lifecycle State Transitions */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Lifecycle Management</span>
                </h4>
                <span className="text-xs text-slate-400">Click a state to update ticket progress</span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {STATUSES.map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusTransition(st)}
                    disabled={request.status === st}
                    data-testid={`transition-to-${st.toLowerCase().replace(/\s+/g, '-')}`}
                    className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                      request.status === st
                        ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/10 cursor-default'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    {request.status === st && <span className="inline-block mr-1.5 text-emerald-400">✓</span>}
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Edit Form */
          <div className="p-6 sm:p-7 space-y-5 animate-fade-in" data-testid="edit-request-form">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Request Title
              </label>
              <input
                type="text"
                data-testid="edit-title-input"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Detailed Description & Specifications
              </label>
              <textarea
                rows={5}
                data-testid="edit-description-input"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Category
                </label>
                <select
                  data-testid="edit-category-select"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as Category)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-800 bg-white focus:border-indigo-500 focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Priority
                </label>
                <select
                  data-testid="edit-priority-select"
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as Priority)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-800 bg-white focus:border-indigo-500 focus:outline-none"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Status
                </label>
                <select
                  data-testid="edit-status-select"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as Status)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-800 bg-white focus:border-indigo-500 focus:outline-none"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Metadata Details Grid Footer */}
        <div className="bg-slate-50/70 p-6 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="rounded-xl border border-slate-200/60 bg-white p-3.5 shadow-2xs">
            <span className="text-slate-400 block font-medium">Category</span>
            <span data-testid="details-category-value" className="font-bold text-slate-800 text-sm mt-0.5 block truncate">
              {request.category}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200/60 bg-white p-3.5 shadow-2xs">
            <span className="text-slate-400 block font-medium">Logged Date</span>
            <span className="font-semibold text-slate-800 text-sm mt-0.5 block font-mono">
              {new Date(request.created_at).toLocaleString()}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200/60 bg-white p-3.5 shadow-2xs">
            <span className="text-slate-400 block font-medium">Last Modified</span>
            <span className="font-semibold text-slate-800 text-sm mt-0.5 block font-mono">
              {new Date(request.updated_at).toLocaleString()}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200/60 bg-white p-3.5 shadow-2xs">
            <span className="text-slate-400 block font-medium">Ticket Protocol</span>
            <span className="font-semibold text-indigo-600 text-sm mt-0.5 block">
              PMS-IDEMPOTENT
            </span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Service Request?"
        message={`Are you sure you want to delete ${request.id} ("${request.title}")? This operation removes it permanently from SQLite storage.`}
        confirmText={deleting ? 'Deleting...' : 'Delete Permanently'}
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};
