import React from 'react';
import { Sprout, RefreshCw, Layers, ShieldCheck, AlertCircle, Menu } from 'lucide-react';

export default function Navbar({
  healthStatus,
  isRefreshing,
  onRefresh,
  onToggleSidebar,
}) {
  const isHealthy = healthStatus && healthStatus.status === 'UP';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/95 px-4 sm:px-6 backdrop-blur supports-[backdrop-filter]:bg-slate-950/80">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-850 hover:text-white lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 shadow-md shadow-emerald-900/30">
            <Sprout className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight text-white">
                AGRI<span className="text-emerald-400">CHAIN</span>
              </span>
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-mono font-medium text-emerald-400 border border-emerald-500/20">
                v1.0
              </span>
            </div>
            <p className="hidden text-[10px] text-slate-400 sm:block">
              Blockchain Agricultural Supply Chain
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Fabric Network Info Badges */}
        <div className="hidden items-center gap-2 text-xs md:flex">
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-slate-300">
            <Layers size={13} className="text-cyan-400" />
            <span className="text-slate-400">Channel:</span>
            <span className="font-mono font-medium text-slate-200">agrichannel</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-slate-300">
            <ShieldCheck size={13} className="text-emerald-400" />
            <span className="text-slate-400">Chaincode:</span>
            <span className="font-mono font-medium text-slate-200">agrichain</span>
          </div>
        </div>

        {/* Backend & Fabric Gateway Health Indicator */}
        <div
          className={`flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs transition-colors ${
            isHealthy
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
          }`}
          title={isHealthy ? 'Backend & Fabric Gateway are operational' : 'Backend connection error'}
        >
          <span className="relative flex h-2 w-2">
            {isHealthy && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                isHealthy ? 'bg-emerald-400' : 'bg-rose-500'
              }`}
            ></span>
          </span>
          <span className="font-medium">
            {isHealthy ? 'Fabric Gateway: UP' : 'Backend: Offline'}
          </span>
        </div>

        {/* Global Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-700 hover:text-white disabled:opacity-50"
          title="Refresh blockchain ledger state"
        >
          <RefreshCw
            size={13}
            className={`transition-transform duration-700 ${
              isRefreshing ? 'animate-spin text-emerald-400' : ''
            }`}
          />
          <span className="hidden sm:inline">Refresh Ledger</span>
        </button>
      </div>
    </header>
  );
}
