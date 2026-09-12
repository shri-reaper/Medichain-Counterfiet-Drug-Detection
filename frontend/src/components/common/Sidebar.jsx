import React from 'react';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Network,
  Database,
  ExternalLink,
  X,
} from 'lucide-react';

export default function Sidebar({
  currentView,
  setCurrentView,
  batchCount = 0,
  isOpen,
  onClose,
}) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'batches',
      label: 'All Batches',
      icon: Package,
      badge: batchCount > 0 ? batchCount : null,
    },
    {
      id: 'create',
      label: 'Register Batch',
      icon: PlusCircle,
      badge: null,
    },
    {
      id: 'architecture',
      label: 'Architecture & Ledger',
      icon: Network,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-slate-950 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header (Mobile close) */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-800 lg:hidden">
          <span className="font-bold text-white tracking-tight">Navigation</span>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-3 py-6 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Supply Chain Portal
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  onClose();
                }}
                className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    className={`transition-colors ${
                      isActive
                        ? 'text-emerald-400'
                        : 'text-slate-400 group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-mono font-semibold ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Blockchain Node Status Widget in Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/80">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-semibold mb-2">
              <Database size={14} className="text-emerald-400" />
              <span>Fabric Network</span>
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-400 font-mono">
              <div className="flex justify-between">
                <span>Peer:</span>
                <span className="text-slate-200 font-medium">peer0.org1</span>
              </div>
              <div className="flex justify-between">
                <span>Consensus:</span>
                <span className="text-slate-200 font-medium">Raft / BFT</span>
              </div>
              <div className="flex justify-between">
                <span>State DB:</span>
                <span className="text-emerald-400 font-medium">GoLevelDB</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
