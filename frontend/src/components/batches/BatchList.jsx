import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Thermometer,
  Droplets,
  Eye,
  Edit3,
  Layers,
  MapPin,
  User,
  Scale,
  RefreshCw,
  LayoutGrid,
  List,
  AlertCircle,
  PlusCircle,
  Truck,
  Shield,
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { formatDate, getRoleBadgeConfig } from '../../utils/helpers';

export default function BatchList({
  batches,
  loading,
  error,
  onRefresh,
  onViewBatch,
  onUpdateStorage,
  onTransferCustody,
  onNavigateCreate,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  const filteredBatches = useMemo(() => {
    if (!Array.isArray(batches)) return [];
    return batches.filter((b) => {
      // Status filter
      if (statusFilter !== 'ALL' && b.storageStatus !== statusFilter) {
        return false;
      }
      // Search filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchId = String(b.batchId || '').toLowerCase().includes(q);
        const matchCrop = String(b.crop || '').toLowerCase().includes(q);
        const matchFarmer = String(b.farmer || '').toLowerCase().includes(q);
        const matchLoc = String(b.location || '').toLowerCase().includes(q);
        const matchCustodian = String(b.currentCustodian || '').toLowerCase().includes(q);
        const matchRole = String(b.currentRole || '').toLowerCase().includes(q);
        return matchId || matchCrop || matchFarmer || matchLoc || matchCustodian || matchRole;
      }
      return true;
    });
  }, [batches, searchQuery, statusFilter]);

  const filterTabs = [
    { id: 'ALL', label: 'All Batches', count: batches?.length || 0 },
    {
      id: 'SAFE',
      label: 'Safe',
      count: batches?.filter((b) => b.storageStatus === 'SAFE').length || 0,
    },
    {
      id: 'CONDITION_FAILED',
      label: 'Condition Failed',
      count:
        batches?.filter((b) => b.storageStatus === 'CONDITION_FAILED').length ||
        0,
    },
    {
      id: 'NOT_MONITORED',
      label: 'Not Monitored',
      count:
        batches?.filter((b) => b.storageStatus === 'NOT_MONITORED').length || 0,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layers size={22} className="text-emerald-400" />
            Agricultural Produce Batches
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable supply-chain records registered on Hyperledger Fabric
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateCreate}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 shadow-md shadow-emerald-950 transition"
          >
            <PlusCircle size={15} />
            <span>Register New Batch</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-medium transition ${
                statusFilter === tab.id
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                  statusFilter === tab.id
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Layout Controls */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              placeholder="Search batches, custodian, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900/80 p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`rounded-lg p-1.5 transition ${
                viewMode === 'table'
                  ? 'bg-slate-800 text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Table View"
            >
              <List size={15} />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`rounded-lg p-1.5 transition ${
                viewMode === 'cards'
                  ? 'bg-slate-800 text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Cards View"
            >
              <LayoutGrid size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-3">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
          <p className="text-xs text-slate-400 font-medium">
            Evaluating transaction 'GetAllBatches' via Fabric Gateway
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center space-y-3">
          <AlertCircle size={32} className="mx-auto text-rose-400" />
          <div>
            <h4 className="text-base font-bold text-rose-300">
              Failed to Load Batches from Blockchain
            </h4>
            <p className="text-xs text-rose-200/80 mt-1 max-w-md mx-auto">
              {error}
            </p>
          </div>
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition"
          >
            <RefreshCw size={14} />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredBatches.length === 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-400">
            <Filter size={24} />
          </div>
          <h4 className="text-base font-semibold text-slate-200">
            No Batches Found
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'ALL'
              ? 'No batches match your active filter criteria. Try resetting your search or filter.'
              : 'No agricultural batches are registered on the Fabric ledger yet.'}
          </p>
          {(searchQuery || statusFilter !== 'ALL') ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
            >
              Reset Filters
            </button>
          ) : (
            <button
              onClick={onNavigateCreate}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 shadow-md shadow-emerald-950"
            >
              <PlusCircle size={14} />
              <span>Register First Batch</span>
            </button>
          )}
        </div>
      )}

      {/* Batches Content: Table View */}
      {!loading && !error && filteredBatches.length > 0 && viewMode === 'table' && (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-950/60 font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th scope="col" className="px-4 py-3.5">
                    Batch ID
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Crop
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Origin / Farmer
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Current Custodian & Role
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-right">
                    Quantity
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-center">
                    Temp / Humidity
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-center">
                    Storage Status
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredBatches.map((batch) => {
                  const isMonitored = batch.storageStatus !== 'NOT_MONITORED';
                  const custodian = batch.currentCustodian || batch.farmer;
                  const role = batch.currentRole || 'FARMER';
                  const roleCfg = getRoleBadgeConfig(role);

                  return (
                    <tr
                      key={batch.batchId}
                      className="group transition-colors hover:bg-slate-850/50"
                    >
                      <td className="whitespace-nowrap px-4 py-4 font-mono font-bold text-emerald-400">
                        {batch.batchId}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <span className="font-semibold text-white">
                          {batch.crop}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-300">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <User size={12} className="text-slate-400" />
                            <span>{batch.farmer}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                            <MapPin size={11} />
                            <span>{batch.location}</span>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                            <Truck size={12} className="text-blue-400 shrink-0" />
                            <span className="truncate max-w-[140px]">{custodian}</span>
                          </div>
                          <div>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${roleCfg.badgeBg} ${roleCfg.badgeBorder} ${roleCfg.badgeText}`}>
                              <span className={`h-1 w-1 rounded-full ${roleCfg.dotColor}`}></span>
                              {roleCfg.label}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-right font-mono font-medium text-slate-200">
                        {batch.quantity}{' '}
                        <span className="text-[11px] text-slate-400">units</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-center">
                        {isMonitored ? (
                          <div className="inline-flex items-center gap-2.5 font-mono text-xs">
                            <span
                              className={`flex items-center gap-1 ${
                                batch.temperature >= 2 && batch.temperature <= 8
                                  ? 'text-emerald-400'
                                  : 'text-rose-400'
                              }`}
                            >
                              <Thermometer size={13} />
                              {batch.temperature}°C
                            </span>
                            <span
                              className={`flex items-center gap-1 ${
                                batch.humidity >= 40 && batch.humidity <= 60
                                  ? 'text-cyan-400'
                                  : 'text-rose-400'
                              }`}
                            >
                              <Droplets size={13} />
                              {batch.humidity}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic font-mono">
                            Telemetry Pending
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-center">
                        <StatusBadge status={batch.storageStatus} size="sm" />
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewBatch(batch)}
                            className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-300 hover:border-slate-600 hover:bg-slate-700 hover:text-white transition"
                            title="Inspect Batch Details & Custody"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => onTransferCustody ? onTransferCustody(batch) : onViewBatch(batch)}
                            className="flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-500/10 px-2 py-1.5 text-xs font-semibold text-blue-400 hover:bg-blue-500/20 transition"
                            title="Transfer Batch Custody"
                          >
                            <Truck size={13} />
                            <span>Transfer</span>
                          </button>
                          <button
                            onClick={() => onUpdateStorage(batch)}
                            className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition"
                            title="Update IoT Telemetry"
                          >
                            <Edit3 size={13} />
                            <span>Update</span>
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

      {/* Batches Content: Cards Grid View */}
      {!loading && !error && filteredBatches.length > 0 && viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBatches.map((batch) => {
            const isMonitored = batch.storageStatus !== 'NOT_MONITORED';
            const custodian = batch.currentCustodian || batch.farmer;
            const role = batch.currentRole || 'FARMER';
            const roleCfg = getRoleBadgeConfig(role);

            return (
              <div
                key={batch.batchId}
                className="group relative rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg transition-all hover:border-slate-700 hover:bg-slate-850"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {batch.batchId}
                    </span>
                    <h3 className="mt-2 text-lg font-bold text-white">
                      {batch.crop}
                    </h3>
                  </div>
                  <StatusBadge status={batch.storageStatus} size="sm" />
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <User size={14} /> Farmer:
                    </span>
                    <span className="font-medium text-slate-200">{batch.farmer}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Truck size={14} className="text-blue-400" /> Custodian:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-200">{custodian}</span>
                      <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold border ${roleCfg.badgeBg} ${roleCfg.badgeBorder} ${roleCfg.badgeText}`}>
                        {roleCfg.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <MapPin size={14} /> Origin:
                    </span>
                    <span className="font-medium text-slate-200">{batch.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Scale size={14} /> Quantity:
                    </span>
                    <span className="font-mono font-medium text-slate-200">{batch.quantity} units</span>
                  </div>
                </div>

                {/* Telemetry Bar in Card */}
                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex items-center justify-between text-xs">
                  {isMonitored ? (
                    <>
                      <div className="flex items-center gap-1.5">
                        <Thermometer
                          size={14}
                          className={
                            batch.temperature >= 2 && batch.temperature <= 8
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                          }
                        />
                        <span className="font-mono font-semibold text-slate-200">
                          {batch.temperature}°C
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Droplets
                          size={14}
                          className={
                            batch.humidity >= 40 && batch.humidity <= 60
                              ? 'text-cyan-400'
                              : 'text-rose-400'
                          }
                        />
                        <span className="font-mono font-semibold text-slate-200">
                          {batch.humidity}%
                        </span>
                      </div>
                    </>
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">
                      Awaiting IoT Sensor Sync
                    </span>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-4 flex items-center gap-2 pt-3 border-t border-slate-800/80">
                  <button
                    onClick={() => onViewBatch(batch)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition"
                  >
                    <Eye size={14} />
                    <span>Details</span>
                  </button>
                  <button
                    onClick={() => onTransferCustody ? onTransferCustody(batch) : onViewBatch(batch)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-blue-600/90 py-2 text-xs font-semibold text-white hover:bg-blue-600 transition"
                  >
                    <Truck size={14} />
                    <span>Transfer</span>
                  </button>
                  <button
                    onClick={() => onUpdateStorage(batch)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600/90 py-2 text-xs font-semibold text-white hover:bg-emerald-600 transition"
                  >
                    <Edit3 size={14} />
                    <span>Update</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
