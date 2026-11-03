import React, { useState } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  Building2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'requests' | 'create' | 'details' | 'automation' | 'reports';

interface SidebarProps {
  currentTab: NavTab;
  onNavigate: (tab: NavTab, requestId?: string) => void;
  openCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onNavigate, openCount = 0 }) => {
  const [collapsed, setCollapsed] = useState(false);

  const isDashboardActive = currentTab === 'dashboard';
  const isRequestsActive = currentTab === 'requests' || currentTab === 'details';
  const isCreateActive = currentTab === 'create';

  return (
    <aside
      className={`${
        collapsed ? 'w-18' : 'w-64'
      } bg-slate-950 border-r border-slate-800/80 text-slate-300 flex flex-col shrink-0 h-screen sticky top-0 overflow-y-auto transition-all duration-200 ease-in-out select-none`}
    >
      {/* Brand Header — Property Management is the main product */}
      <div
        className={`px-4 py-4 border-b border-slate-800/70 flex items-center ${
          collapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white tracking-tight truncate">Property Management</span>
              </div>
              <p className="text-xs text-indigo-400 font-medium truncate">Service Requests</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 py-4 space-y-6">
        {/* Overview */}
        <div>
          {!collapsed && (
            <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase text-slate-500">
              Overview
            </div>
          )}
          <button
            data-testid="nav-item-dashboard"
            onClick={() => onNavigate('dashboard')}
            title={collapsed ? 'Dashboard' : undefined}
            className={`w-full flex items-center ${
              collapsed ? 'justify-center px-2' : 'justify-start px-3'
            } py-2.5 rounded-lg text-sm font-medium transition-all ${
              isDashboardActive
                ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 shrink-0 ${isDashboardActive ? 'text-white' : 'text-slate-400'}`} />
            {!collapsed && <span className="ml-3 truncate">Dashboard</span>}
          </button>
        </div>

        {/* Service Requests under Property Management */}
        <div>
          {!collapsed && (
            <div className="px-3 pb-2 flex items-center justify-between text-[11px] font-semibold tracking-wider uppercase text-slate-500">
              <span>Service Requests</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </div>
          )}
          <div className="space-y-1">
            {/* Service Requests List */}
            <button
              data-testid="nav-item-requests"
              onClick={() => onNavigate('requests')}
              title={collapsed ? 'Service Requests' : undefined}
              className={`w-full flex items-center ${
                collapsed ? 'justify-center px-2' : 'justify-between px-3'
              } py-2.5 rounded-lg text-sm font-medium transition-all ${
                isRequestsActive
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center min-w-0">
                <ClipboardList className={`w-4 h-4 shrink-0 ${isRequestsActive ? 'text-white' : 'text-slate-400'}`} />
                {!collapsed && <span className="ml-3 truncate">Service Requests</span>}
              </div>
              {!collapsed && openCount > 0 && (
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    isRequestsActive
                      ? 'bg-white/20 text-white'
                      : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                  }`}
                >
                  {openCount}
                </span>
              )}
            </button>

            {/* Create Service Request */}
            <button
              data-testid="nav-item-create"
              onClick={() => onNavigate('create')}
              title={collapsed ? 'New Request' : undefined}
              className={`w-full flex items-center ${
                collapsed ? 'justify-center px-2' : 'justify-start px-3'
              } py-2.5 rounded-lg text-sm font-medium transition-all ${
                isCreateActive
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
              }`}
            >
              <PlusCircle className={`w-4 h-4 shrink-0 ${isCreateActive ? 'text-white' : 'text-slate-400'}`} />
              {!collapsed && <span className="ml-3 truncate">New Request</span>}
            </button>
          </div>
        </div>
      </nav>

      {/* System Status / Health badge */}
      {!collapsed && (
        <div className="px-4 py-3 mx-3 mb-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Operational</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">Property Management v2.4</p>
        </div>
      )}

      {/* Footer with Collapse Toggle */}
      <div className="p-3 border-t border-slate-800/70">
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="w-full flex items-center justify-center py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors text-xs font-medium"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="ml-2">Collapse Menu</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
