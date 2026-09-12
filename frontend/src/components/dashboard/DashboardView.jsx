import React from 'react';
import {
  Package,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ArrowRight,
  Thermometer,
  Droplets,
  PlusCircle,
  Activity,
  Layers,
  Sparkles,
  TrendingUp,
  Truck,
} from 'lucide-react';
import StatCard from '../common/StatCard';
import StatusBadge from '../common/StatusBadge';
import { formatDate, getRoleBadgeConfig } from '../../utils/helpers';

export default function DashboardView({
  batches,
  loading,
  onNavigateBatches,
  onNavigateCreate,
  onViewBatch,
  onUpdateStorage,
  onTransferCustody,
}) {

  const totalCount = batches?.length || 0;
  const safeCount = batches?.filter((b) => b.storageStatus === 'SAFE').length || 0;
  const failedCount =
    batches?.filter((b) => b.storageStatus === 'CONDITION_FAILED').length || 0;
  const notMonitoredCount =
    batches?.filter((b) => b.storageStatus === 'NOT_MONITORED').length || 0;

  // Recent 5 batches sorted by date (if available) or as returned
  const recentBatches = [...(batches || [])].slice(0, 5);

  const complianceRate =
    totalCount > 0 ? Math.round((safeCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-7">
      {/* Top Welcome / Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span>Agricultural Supply Chain Overview</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time cold-chain telemetry and cryptographic asset traceability powered by Hyperledger Fabric
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateCreate}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-950/60 transition"
          >
            <PlusCircle size={15} />
            <span>Register Batch</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Batches"
          value={loading ? '...' : totalCount}
          subtitle="Committed to Fabric Ledger"
          icon={Package}
          colorScheme="blue"
          onClick={onNavigateBatches}
        />
        <StatCard
          title="Safe Batches"
          value={loading ? '...' : safeCount}
          subtitle="Compliant Storage Status"
          icon={ShieldCheck}
          colorScheme="emerald"
          onClick={onNavigateBatches}
        />
        <StatCard
          title="Condition Failed"
          value={loading ? '...' : failedCount}
          subtitle="Spoilage Breach Alerts"
          icon={AlertTriangle}
          colorScheme="rose"
          onClick={onNavigateBatches}
        />
        <StatCard
          title="Not Monitored"
          value={loading ? '...' : notMonitoredCount}
          subtitle="Awaiting IoT Telemetry"
          icon={Clock}
          colorScheme="amber"
          onClick={onNavigateBatches}
        />
      </div>

      {/* Cold Chain Storage Thresholds & Telemetry Reference */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <Activity size={14} />
              <span>Smart Contract Telemetry Rules</span>
            </div>
            <h3 className="text-base font-bold text-white">
              Automated Crop-Specific Cold-Chain Verification
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When IoT temperature and humidity readings are submitted, the <code className="text-emerald-400 font-mono">UpdateStorageConditions</code> transaction executes on-chain consensus logic against specialized produce standards:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3.5 flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                <Thermometer size={18} />
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-400 uppercase">
                  Adaptive Crop Temp Standards
                </span>
                <p className="text-xs font-bold font-mono text-emerald-400">
                  Tomato (10-15°C) • Rice (15-25°C) • Mango (10-14°C)
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3.5 flex items-center gap-3">
              <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400">
                <Droplets size={18} />
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-400 uppercase">
                  Adaptive Humidity Bounds
                </span>
                <p className="text-xs font-bold font-mono text-cyan-400">
                  Greens (90-98%) • Potato (85-95%) • Rice (40-65%)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Batches Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              Recent Batches on Ledger
            </h3>
          </div>
          <button
            onClick={onNavigateBatches}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
          >
            <span>View All ({totalCount})</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {recentBatches.length === 0 && !loading && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center">
            <p className="text-xs text-slate-400">
              No batches registered yet. Click "Register Batch" to mint your first agricultural produce batch.
            </p>
          </div>
        )}

        {recentBatches.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="border-b border-slate-800 bg-slate-950/60 font-semibold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th scope="col" className="px-5 py-3">Batch ID</th>
                    <th scope="col" className="px-5 py-3">Crop</th>
                    <th scope="col" className="px-5 py-3">Farmer</th>
                    <th scope="col" className="px-5 py-3">Custodian & Role</th>
                    <th scope="col" className="px-5 py-3 text-right">Quantity</th>
                    <th scope="col" className="px-5 py-3 text-center">Status</th>
                    <th scope="col" className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentBatches.map((batch) => {
                    const custodian = batch.currentCustodian || batch.farmer;
                    const role = batch.currentRole || 'FARMER';
                    const roleCfg = getRoleBadgeConfig(role);

                    return (
                      <tr
                        key={batch.batchId}
                        className="transition-colors hover:bg-slate-850/50"
                      >
                        <td className="whitespace-nowrap px-5 py-3.5 font-mono font-bold text-emerald-400">
                          {batch.batchId}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 font-semibold text-white">
                          {batch.crop}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-slate-300">
                          {batch.farmer}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5">
                          <div className="flex items-center gap-1.5 font-medium text-slate-200">
                            <Truck size={12} className="text-blue-400 shrink-0" />
                            <span>{custodian}</span>
                            <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold border ${roleCfg.badgeBg} ${roleCfg.badgeBorder} ${roleCfg.badgeText}`}>
                              {roleCfg.label}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-right font-mono text-slate-200">
                          {batch.quantity} units
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-center">
                          <StatusBadge status={batch.storageStatus} size="sm" />
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onViewBatch(batch)}
                              className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition"
                              title="Details & Custody"
                            >
                              Details
                            </button>
                            <button
                              onClick={() => onTransferCustody ? onTransferCustody(batch) : onViewBatch(batch)}
                              className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-400 hover:bg-blue-500/20 transition"
                              title="Transfer Custody"
                            >
                              Transfer
                            </button>
                            <button
                              onClick={() => onUpdateStorage(batch)}
                              className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition"
                              title="Update Storage"
                            >
                              Update
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
