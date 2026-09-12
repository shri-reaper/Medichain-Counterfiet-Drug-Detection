import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import DashboardView from './components/dashboard/DashboardView';
import BatchList from './components/batches/BatchList';
import CreateBatchView from './components/create/CreateBatchView';
import ArchitectureView from './components/architecture/ArchitectureView';
import BatchDetailModal from './components/batches/BatchDetailModal';
import UpdateStorageModal from './components/batches/UpdateStorageModal';
import TransferCustodyModal from './components/batches/TransferCustodyModal';
import { getAllBatches, checkHealth, getErrorMessage } from './api/batchApi';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modals state
  const [detailModalBatchId, setDetailModalBatchId] = useState(null);
  const [detailModalInitialData, setDetailModalInitialData] = useState(null);
  const [updateModalBatch, setUpdateModalBatch] = useState(null);
  const [transferModalBatch, setTransferModalBatch] = useState(null);

  // Fetch batches and health
  const fetchData = useCallback(async (isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError(null);

    try {
      // Parallel fetch for batches and health
      const [batchesResult, healthResult] = await Promise.allSettled([
        getAllBatches(),
        checkHealth(),
      ]);

      if (batchesResult.status === 'fulfilled') {
        setBatches(batchesResult.value || []);
      } else {
        setError(getErrorMessage(batchesResult.reason));
      }

      if (healthResult.status === 'fulfilled') {
        setHealthStatus(healthResult.value);
      } else {
        setHealthStatus({ status: 'DOWN', error: getErrorMessage(healthResult.reason) });
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle batch created
  const handleBatchCreated = (newBatch) => {
    // Refresh ledger data
    fetchData(true);
  };

  // Handle batch updated (storage conditions or custody transfer)
  const handleBatchUpdated = (updatedBatch) => {
    setBatches((prev) =>
      prev.map((b) => (b.batchId === updatedBatch.batchId ? updatedBatch : b))
    );
    // Also if detail modal is open for this batch, update its initial data
    if (detailModalBatchId === updatedBatch.batchId) {
      setDetailModalInitialData(updatedBatch);
    }
    fetchData(true);
  };

  // Open detail modal
  const handleViewBatch = (batch) => {
    setDetailModalBatchId(batch.batchId);
    setDetailModalInitialData(batch);
  };

  // Open update storage modal
  const handleOpenUpdateStorage = (batch) => {
    setUpdateModalBatch(batch);
  };

  // Open transfer custody modal
  const handleOpenTransferCustody = (batch) => {
    setTransferModalBatch(batch);
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        batchCount={batches.length}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main App Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <Navbar
          healthStatus={healthStatus}
          isRefreshing={isRefreshing}
          onRefresh={() => fetchData(true)}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
          {currentView === 'dashboard' && (
            <DashboardView
              batches={batches}
              loading={loading}
              onNavigateBatches={() => setCurrentView('batches')}
              onNavigateCreate={() => setCurrentView('create')}
              onViewBatch={handleViewBatch}
              onUpdateStorage={handleOpenUpdateStorage}
              onTransferCustody={handleOpenTransferCustody}
            />
          )}

          {currentView === 'batches' && (
            <BatchList
              batches={batches}
              loading={loading}
              error={error}
              onRefresh={() => fetchData(true)}
              onViewBatch={handleViewBatch}
              onUpdateStorage={handleOpenUpdateStorage}
              onTransferCustody={handleOpenTransferCustody}
              onNavigateCreate={() => setCurrentView('create')}
            />
          )}

          {currentView === 'create' && (
            <CreateBatchView
              onBatchCreated={handleBatchCreated}
              onNavigateBatches={() => setCurrentView('batches')}
            />
          )}

          {currentView === 'architecture' && <ArchitectureView />}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-850 py-5 text-center text-xs text-slate-400">
          <div className="flex items-center justify-center gap-2">
            <span>AGRICHAIN Supply Chain Platform</span>
            <span>•</span>
            <span>Hyperledger Fabric Enterprise Network</span>
            <span>•</span>
            <span className="font-mono text-emerald-400">Channel: agrichannel</span>
          </div>
        </footer>
      </div>

      {/* Batch Details Modal */}
      {detailModalBatchId && (
        <BatchDetailModal
          batchId={detailModalBatchId}
          initialData={detailModalInitialData}
          onClose={() => {
            setDetailModalBatchId(null);
            setDetailModalInitialData(null);
          }}
          onOpenUpdateStorage={(batch) => {
            setDetailModalBatchId(null);
            setDetailModalInitialData(null);
            setUpdateModalBatch(batch);
          }}
          onOpenTransferCustody={(batch) => {
            setDetailModalBatchId(null);
            setDetailModalInitialData(null);
            setTransferModalBatch(batch);
          }}
        />
      )}

      {/* Update Storage Modal */}
      {updateModalBatch && (
        <UpdateStorageModal
          batch={updateModalBatch}
          onClose={() => setUpdateModalBatch(null)}
          onBatchUpdated={handleBatchUpdated}
        />
      )}

      {/* Transfer Custody Modal */}
      {transferModalBatch && (
        <TransferCustodyModal
          batch={transferModalBatch}
          onClose={() => setTransferModalBatch(null)}
          onBatchUpdated={handleBatchUpdated}
        />
      )}
    </div>
  );
}
