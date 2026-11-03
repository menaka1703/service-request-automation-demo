import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { NavTab } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { RequestsListPage } from './pages/RequestsListPage';
import { CreateRequestPage } from './pages/CreateRequestPage';
import { RequestDetailsPage } from './pages/RequestDetailsPage';
import { ToastContainer, ToastMessage } from './components/Toast';
import { api } from './services/api';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [openCount, setOpenCount] = useState<number>(0);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isResetting, setIsResetting] = useState(false);

  // Parse URL hash for deep linking
  useEffect(() => {
    const parseHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (!hash || hash === '') {
        setCurrentTab('dashboard');
      } else if (hash.startsWith('requests/new') || hash === 'create') {
        setCurrentTab('create');
      } else if (hash.startsWith('requests/') && hash.split('/')[1]) {
        setCurrentTab('details');
        setSelectedRequestId(hash.split('/')[1]);
      } else if (hash.startsWith('requests')) {
        setCurrentTab('requests');
      } else {
        setCurrentTab('dashboard');
      }
    };

    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info', title?: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type, title }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Update open requests badge
  const refreshBadgeCounts = useCallback(async () => {
    try {
      const stats = await api.getStats();
      setOpenCount(stats.byStatus['Open'] || 0);
    } catch {
      // ignore badge failure
    }
  }, []);

  useEffect(() => {
    refreshBadgeCounts();
  }, [refreshBadgeCounts]);

  const handleNavigate = (tab: NavTab, requestId?: string) => {
    setCurrentTab(tab);
    if (tab === 'details' && requestId) {
      setSelectedRequestId(requestId);
      window.location.hash = `/requests/${requestId}`;
    } else if (tab === 'dashboard') {
      window.location.hash = '/';
    } else if (tab === 'requests') {
      window.location.hash = '/requests';
    } else if (tab === 'create') {
      window.location.hash = '/create';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetData = async () => {
    try {
      setIsResetting(true);
      await api.resetDatabase();
      showToast('Database reset and seeded with default sample data!', 'success');
      refreshBadgeCounts();
      if (currentTab === 'details') {
        handleNavigate('requests');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to reset sample data', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      <Layout
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onResetData={handleResetData}
        isResetting={isResetting}
        openCount={openCount}
      >
        {currentTab === 'dashboard' && (
          <DashboardPage onNavigate={handleNavigate} />
        )}
        {currentTab === 'requests' && (
          <RequestsListPage
            onNavigate={handleNavigate}
            showToast={showToast}
            onDataChanged={refreshBadgeCounts}
          />
        )}
        {currentTab === 'create' && (
          <CreateRequestPage
            onNavigate={handleNavigate}
            showToast={showToast}
            onDataChanged={refreshBadgeCounts}
          />
        )}
        {currentTab === 'details' && (
          <RequestDetailsPage
            requestId={selectedRequestId}
            onNavigate={handleNavigate}
            showToast={showToast}
            onDataChanged={refreshBadgeCounts}
          />
        )}
      </Layout>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
};

export default App;
