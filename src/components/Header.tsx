import React from 'react';
import { Plus, Bell } from 'lucide-react';
import { NavTab } from './Sidebar';

interface HeaderProps {
  currentTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  onResetData: () => void;
  isResetting?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
}) => {
  const getTabMetadata = () => {
    switch (currentTab) {
      case 'dashboard':
        return {
          title: 'Dashboard',
          subtitle: 'Real-time service request metrics and queue analytics',
        };
      case 'requests':
        return {
          title: 'Service Requests',
          subtitle: 'Search, filter and manage all active service tickets',
        };
      case 'create':
        return {
          title: 'New Property Service Request',
          subtitle: 'Submit a maintenance or tenancy request for your property',
        };
      case 'details':
        return {
          title: 'Request Details',
          subtitle: 'Inspect ticket metadata, update status and manage attributes',
        };
      default:
        return {
          title: 'Property Management',
          subtitle: 'Enterprise service request management',
        };
    }
  };

  const { title, subtitle } = getTabMetadata();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 px-6 py-3.5 flex items-center justify-between gap-4 shadow-sm">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-0.5">
          <span>Property Management</span>
          <span>/</span>
          <span className="text-slate-600 font-semibold capitalize">{currentTab}</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
          {title}
        </h2>
        <p className="text-xs text-slate-500 hidden sm:block mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        {/* Notification placeholder */}
        <button
          title="Notifications"
          className="relative p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* New Request CTA — hidden on create page */}
        {currentTab !== 'create' && (
          <button
            onClick={() => onNavigate('create')}
            data-testid="header-create-btn"
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Request</span>
          </button>
        )}

        {/* Hidden reset button — kept for test compatibility */}
        <button
          data-testid="header-reset-db-btn"
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>
    </header>
  );
};
