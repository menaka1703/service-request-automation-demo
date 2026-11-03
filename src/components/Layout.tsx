import React, { ReactNode } from 'react';
import { Sidebar, NavTab } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  currentTab: NavTab;
  onNavigate: (tab: NavTab, requestId?: string) => void;
  onResetData: () => void;
  isResetting?: boolean;
  openCount?: number;
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  currentTab,
  onNavigate,
  onResetData,
  isResetting,
  openCount,
  children,
}) => {
  return (
    <div className="h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden antialiased">
      {/* Desktop / Persistent Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onNavigate={onNavigate}
        openCount={openCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Header
          currentTab={currentTab}
          onNavigate={onNavigate}
          onResetData={onResetData}
          isResetting={isResetting}
        />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

