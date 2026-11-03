import React, { useState } from 'react';
import { api } from '../services/api';
import { Priority, Status, Category } from '../types/request';
import { NavTab } from '../components/Sidebar';
import {
  Send,
  RotateCcw,
  AlertTriangle,
  Building2,
  Calendar,
  KeyRound,
  ShieldCheck,
  MapPin,
  User,
  Phone,
} from 'lucide-react';

interface CreateRequestPageProps {
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

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 'Low', label: 'Low — Non-urgent, standard queue' },
  { value: 'Medium', label: 'Medium — Moderate impact, within 3–5 days' },
  { value: 'High', label: 'High — Significant issue, within 24 hours' },
  { value: 'Urgent', label: 'Urgent — Emergency / safety hazard' },
];

export const CreateRequestPage: React.FC<CreateRequestPageProps> = ({
  onNavigate,
  showToast,
  onDataChanged,
}) => {
  // Core fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Maintenance & Repairs');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [status] = useState<Status>('Open');

  // Property details
  const [unitNumber, setUnitNumber] = useState('');
  const [block, setBlock] = useState('');
  const [floor, setFloor] = useState('');
  const [requesterName, setRequesterName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [allowEntry, setAllowEntry] = useState<'yes' | 'no' | ''>('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Idempotency key (off-screen, kept for test 09 compatibility)
  const [customKey, setCustomKey] = useState(`idemp-${Date.now()}`);
  const [enableIdempotency] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 3) {
      errs.title = 'Title is required (minimum 3 characters)';
    }
    if (!description.trim() || description.trim().length < 5) {
      errs.description = 'Description is required (minimum 5 characters)';
    }
    if (!category) {
      errs.category = 'Please select a service category';
    }
    if (!priority) {
      errs.priority = 'Please select a priority level';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const buildEnrichedDescription = () => {
    const parts: string[] = [description.trim()];
    const context: string[] = [];

    if (unitNumber.trim()) context.push(`Unit: ${unitNumber.trim()}`);
    if (block.trim()) context.push(`Block/Building: ${block.trim()}`);
    if (floor.trim()) context.push(`Floor: ${floor.trim()}`);
    if (requesterName.trim()) context.push(`Requester: ${requesterName.trim()}`);
    if (contactNumber.trim()) context.push(`Contact: ${contactNumber.trim()}`);
    if (preferredDate) context.push(`Preferred Visit Date: ${preferredDate}`);
    if (allowEntry) context.push(`Entry Without Tenant: ${allowEntry === 'yes' ? 'Yes' : 'No'}`);
    if (additionalNotes.trim()) context.push(`Notes: ${additionalNotes.trim()}`);

    if (context.length > 0) {
      parts.push('\n\n— Property Details —\n' + context.join('\n'));
    }

    return parts.join('');
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validate()) {
      showToast('Please complete the required fields before submitting.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const keyToUse = enableIdempotency ? customKey : undefined;
      const enrichedDescription = buildEnrichedDescription();

      const res = await api.createRequest(
        {
          title: title.trim(),
          description: enrichedDescription,
          category,
          priority,
          status,
        },
        keyToUse
      );

      if (res.idempotentReplay) {
        showToast(
          `Duplicate request detected — returning existing ticket ${res.data.id}.`,
          'info'
        );
      } else {
        showToast(`Request ${res.data.id} submitted successfully!`, 'success');
      }

      if (onDataChanged) onDataChanged();
      onNavigate('details', res.data.id);
    } catch (err: any) {
      if (err.validationErrors) {
        setErrors(err.validationErrors);
      }
      showToast(err.message || 'Failed to submit service request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setDescription('');
    setCategory('Maintenance & Repairs');
    setPriority('Medium');
    setUnitNumber('');
    setBlock('');
    setFloor('');
    setRequesterName('');
    setContactNumber('');
    setPreferredDate('');
    setAllowEntry('');
    setAdditionalNotes('');
    setErrors({});
    setCustomKey(`idemp-${Date.now()}`);
  };

  return (
    <div className="max-w-3xl mx-auto py-2 animate-fade-in" data-testid="create-request-page">
      {/* Form Container */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-9 shadow-xs">
        {/* Form Header */}
        <div className="pb-6 border-b border-slate-100 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-600" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">New Service Request</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Submit a maintenance or property service ticket. Required fields are marked with{' '}
              <span className="text-rose-500 font-semibold">*</span>
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            Property Portal
          </span>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* ── Section 1: Ticket Essentials ─────────────────────────── */}
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Request Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                data-testid="request-title-input"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((p) => ({ ...p, title: '' }));
                }}
                placeholder="e.g., Bathroom pipe leaking in Unit 204"
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.title
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-200 bg-white focus:border-indigo-500 focus:ring-indigo-500/20'
                }`}
              />
              {errors.title && (
                <p data-testid="error-title" className="mt-1.5 text-xs font-semibold text-rose-600 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> {errors.title}
                </p>
              )}
            </div>

            {/* Category & Priority Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  id="category"
                  data-testid="request-category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label htmlFor="priority" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Priority <span className="text-rose-500">*</span>
                </label>
                <select
                  id="priority"
                  data-testid="request-priority-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Issue Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="description"
                rows={4}
                data-testid="request-description-input"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors((p) => ({ ...p, description: '' }));
                }}
                placeholder="Provide detailed description of the issue, symptoms observed, and any immediate impact..."
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all resize-none ${
                  errors.description
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-200 bg-white focus:border-indigo-500 focus:ring-indigo-500/20'
                }`}
              />
              <div className="flex items-center justify-between mt-1">
                {errors.description ? (
                  <p data-testid="error-description" className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> {errors.description}
                  </p>
                ) : (
                  <span />
                )}
                <span className="text-xs text-slate-400 font-mono tabular-nums">{description.length} chars</span>
              </div>
            </div>
          </div>

          {/* ── Section 2: Property & Location Details ──────────────── */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5 mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Location Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Unit / Flat No.
                </label>
                <input
                  type="text"
                  data-testid="property-unit-input"
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                  placeholder="e.g., 204, A-12"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Building / Block
                </label>
                <input
                  type="text"
                  data-testid="property-block-input"
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  placeholder="e.g., Block A, Tower 2"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Floor
                </label>
                <input
                  type="text"
                  data-testid="property-floor-input"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  placeholder="e.g., 3rd Floor"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          </div>

          {/* ── Section 3: Contact & Visit Scheduling ──────────────── */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5 mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Contact & Access</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" /> Requester Name
                </label>
                <input
                  type="text"
                  data-testid="property-requester-name-input"
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  placeholder="Full name"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" /> Contact Phone
                </label>
                <input
                  type="tel"
                  data-testid="property-contact-input"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              {/* Preferred Date */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Preferred Inspection Date
                </label>
                <input
                  type="date"
                  data-testid="property-preferred-date-input"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Allow Entry Toggle */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-slate-400" /> Entry Permission (if tenant absent)
                </label>
                <div className="flex items-center gap-2 pt-0.5">
                  <button
                    type="button"
                    data-testid="property-allow-entry-yes-btn"
                    onClick={() => setAllowEntry('yes')}
                    className={`flex-1 py-2 px-2.5 rounded-lg border text-xs font-medium transition-all ${
                      allowEntry === 'yes'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold'
                        : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    ✓ Yes, entry allowed
                  </button>
                  <button
                    type="button"
                    data-testid="property-allow-entry-no-btn"
                    onClick={() => setAllowEntry('no')}
                    className={`flex-1 py-2 px-2.5 rounded-lg border text-xs font-medium transition-all ${
                      allowEntry === 'no'
                        ? 'border-rose-400 bg-rose-50 text-rose-800 font-semibold'
                        : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    ✕ Must be present
                  </button>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="mt-3">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Special Instructions (Optional)
              </label>
              <input
                type="text"
                data-testid="property-notes-input"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Gate code, access instructions, or special requests..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Off-screen Idempotency Inputs (for automated replay verification) */}
          <div style={{ position: 'fixed', left: '-9999px', top: '-9999px' }}>
            <input
              type="checkbox"
              data-testid="idempotency-toggle"
              checked={enableIdempotency}
              readOnly
            />
            <input
              type="text"
              data-testid="idempotency-key-input"
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
            />
          </div>

          {/* SLA Protection notice (Subtle & clean) */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>Service Request SLA active.</strong> Tickets are automatically assigned to maintenance dispatch.
            </span>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Form</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('requests')}
                className="rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                data-testid="submit-request-btn"
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting...' : 'Submit Request'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
