import React, { useEffect, useState } from 'react';
import {
  X,
  Thermometer,
  Droplets,
  MapPin,
  User,
  Scale,
  Calendar,
  Layers,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Truck,
  Building2,
  Store,
  ArrowRight,
  History,
  Shield,
  Activity,
  Sparkles,
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { formatDate, getRoleBadgeConfig } from '../../utils/helpers';
import {
  getBatchById,
  getCustodyHistory,
  getTelemetryHistory,
  getBatchStorageRules,
  getErrorMessage,
} from '../../api/batchApi';

const SUPPLY_CHAIN_STAGES = [
  { role: 'FARMER', label: 'Farmer', icon: User, desc: 'Harvest & Registration' },
  { role: 'TRANSPORTER', label: 'Transporter', icon: Truck, desc: 'Cold Freight Transit' },
  { role: 'DISTRIBUTOR', label: 'Distributor', icon: Building2, desc: 'Warehouse & Wholesale' },
  { role: 'RETAILER', label: 'Retailer', icon: Store, desc: 'Point of Sale' },
];

export default function BatchDetailModal({
  batchId,
  initialData,
  onClose,
  onOpenUpdateStorage,
  onOpenTransferCustody,
}) {
  const [batch, setBatch] = useState(initialData || null);
  const [custodyHistory, setCustodyHistory] = useState(
    initialData && Array.isArray(initialData.custodyHistory) ? initialData.custodyHistory : []
  );
  const [telemetryHistory, setTelemetryHistory] = useState(
    initialData && Array.isArray(initialData.telemetryHistory) ? initialData.telemetryHistory : []
  );
  const [storageRules, setStorageRules] = useState(null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!batchId) return;
    let isMounted = true;

    async function fetchDetails() {
      try {
        setLoading(true);
        setError(null);
        const [batchData, historyData, telemetryData, rulesData] = await Promise.allSettled([
          getBatchById(batchId),
          getCustodyHistory(batchId),
          getTelemetryHistory(batchId),
          getBatchStorageRules(batchId),
        ]);

        if (isMounted) {
          if (batchData.status === 'fulfilled') {
            setBatch(batchData.value);
            if (Array.isArray(batchData.value?.custodyHistory) && batchData.value.custodyHistory.length > 0) {
              setCustodyHistory(batchData.value.custodyHistory);
            }
            if (Array.isArray(batchData.value?.telemetryHistory) && batchData.value.telemetryHistory.length > 0) {
              setTelemetryHistory(batchData.value.telemetryHistory);
            }
          } else {
            setError(getErrorMessage(batchData.reason));
          }

          if (historyData.status === 'fulfilled' && Array.isArray(historyData.value) && historyData.value.length > 0) {
            setCustodyHistory(historyData.value);
          }

          if (telemetryData.status === 'fulfilled' && Array.isArray(telemetryData.value) && telemetryData.value.length > 0) {
            setTelemetryHistory(telemetryData.value);
          }

          if (rulesData.status === 'fulfilled' && rulesData.value) {
            setStorageRules(rulesData.value);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchDetails();
    return () => {
      isMounted = false;
    };
  }, [batchId]);

  if (!batchId) return null;

  const temp = batch ? Number(batch.temperature || 0) : 0;
  const hum = batch ? Number(batch.humidity || 0) : 0;

  const minTemp = storageRules?.minTemperature !== undefined ? storageRules.minTemperature : (storageRules?.minTemp !== undefined ? storageRules.minTemp : 2);
  const maxTemp = storageRules?.maxTemperature !== undefined ? storageRules.maxTemperature : (storageRules?.maxTemp !== undefined ? storageRules.maxTemp : 8);
  const minHum = storageRules?.minHumidity !== undefined ? storageRules.minHumidity : 40;
  const maxHum = storageRules?.maxHumidity !== undefined ? storageRules.maxHumidity : 60;

  const isSafeTemp = temp >= minTemp && temp <= maxTemp;
  const isSafeHum = hum >= minHum && hum <= maxHum;
  const isMonitored = batch?.storageStatus !== 'NOT_MONITORED';

  const currentCustodian = batch?.currentCustodian || batch?.farmer || 'Unknown';
  const currentRole = batch?.currentRole || 'FARMER';
  const currentRoleConfig = getRoleBadgeConfig(currentRole);

  // Compute active stage index for progression timeline
  const stageOrder = ['FARMER', 'TRANSPORTER', 'DISTRIBUTOR', 'RETAILER'];
  const activeStageIndex = stageOrder.indexOf(String(currentRole).toUpperCase());

  // Determine actual custody events to display
  const custodyEventsToDisplay = custodyHistory.length > 0 ? custodyHistory : (
    batch ? [{
      from: 'ORIGIN',
      to: batch.farmer,
      role: 'FARMER',
      timestamp: batch.createdAt || 'N/A',
    }] : []
  );

  // Determine actual telemetry records to display
  const telemetryToDisplay = Array.isArray(telemetryHistory) && telemetryHistory.length > 0
    ? telemetryHistory
    : (Array.isArray(batch?.telemetryHistory) ? batch.telemetryHistory : []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  Batch Asset Details
                </h3>
                {batch && (
                  <span className="font-mono text-sm font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {batch.batchId}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Verified World-State Asset on Hyperledger Fabric Ledger
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[calc(85vh-8rem)] overflow-y-auto">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
              <p className="text-sm">Querying state from Fabric peer...</p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-300 text-sm">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertTriangle size={16} /> Error querying ledger
              </p>
              <p className="mt-1 text-xs text-rose-200/80">{error}</p>
            </div>
          )}

          {batch && !loading && (
            <>
              {/* Top Summary Banner */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                <div>
                  <span className="text-xs text-slate-400 font-medium uppercase">
                    Produce & Variety
                  </span>
                  <h4 className="text-2xl font-bold text-white mt-0.5">
                    {batch.crop}
                  </h4>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-slate-400 font-medium uppercase mb-1">
                    Compliance Status
                  </span>
                  <StatusBadge status={batch.storageStatus} size="lg" />
                </div>
              </div>

              {/* Core Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {/* Farmer / Producer */}
                <div className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-950/30 p-3.5">
                  <div className="rounded-lg bg-blue-500/10 p-2.5 text-blue-400 border border-blue-500/20 shrink-0">
                    <User size={18} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                      Farmer / Producer
                    </span>
                    <p className="text-sm font-semibold text-slate-200 truncate">
                      {batch.farmer}
                    </p>
                  </div>
                </div>

                {/* Current Custodian */}
                <div className="flex items-center gap-3 rounded-xl border border-blue-500/20 bg-blue-950/20 p-3.5">
                  <div className="rounded-lg bg-blue-500/20 p-2.5 text-blue-400 border border-blue-500/30 shrink-0">
                    <Truck size={18} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-blue-300">
                      Current Custodian
                    </span>
                    <p className="text-sm font-bold text-white truncate">
                      {currentCustodian}
                    </p>
                  </div>
                </div>

                {/* Current Role */}
                <div className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-950/30 p-3.5">
                  <div className={`rounded-lg p-2.5 border shrink-0 ${currentRoleConfig.badgeBg} ${currentRoleConfig.badgeBorder} ${currentRoleConfig.badgeText}`}>
                    <Shield size={18} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                      Current Role
                    </span>
                    <div className="mt-0.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${currentRoleConfig.badgeBg} ${currentRoleConfig.badgeBorder} ${currentRoleConfig.badgeText}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${currentRoleConfig.dotColor}`}></span>
                        {currentRoleConfig.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Origin Location */}
                <div className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-950/30 p-3.5">
                  <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-400 border border-emerald-500/20 shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                      Origin Location
                    </span>
                    <p className="text-sm font-semibold text-slate-200 truncate">
                      {batch.location}
                    </p>
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-950/30 p-3.5">
                  <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-400 border border-amber-500/20 shrink-0">
                    <Scale size={18} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                      Quantity Registered
                    </span>
                    <p className="text-sm font-semibold text-slate-200">
                      {batch.quantity} <span className="text-xs text-slate-400 font-normal">units</span>
                    </p>
                  </div>
                </div>

                {/* Registered Timestamp */}
                <div className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-950/30 p-3.5">
                  <div className="rounded-lg bg-purple-500/10 p-2.5 text-purple-400 border border-purple-500/20 shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                      Ledger Timestamp
                    </span>
                    <p className="text-sm font-semibold text-slate-200 font-mono text-xs truncate">
                      {formatDate(batch.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Supply Chain Custody Tracking & Timeline Section */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <History size={16} className="text-blue-400" />
                      Supply Chain Custody & Chain-of-Custody Timeline
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Cryptographically verified handoffs recorded on Hyperledger Fabric ledger
                    </p>
                  </div>

                  <button
                    onClick={() => onOpenTransferCustody(batch)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg border border-blue-500/20 transition self-start sm:self-auto"
                  >
                    <Truck size={13} />
                    <span>Transfer Custody</span>
                  </button>
                </div>

                {/* Progression Stepper: Farmer -> Transporter -> Distributor -> Retailer */}
                <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Handoff Progression Pipeline
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SUPPLY_CHAIN_STAGES.map((stage, idx) => {
                      const Icon = stage.icon;
                      const isReached = idx <= activeStageIndex;
                      const isCurrent = idx === activeStageIndex;

                      return (
                        <div
                          key={stage.role}
                          className={`rounded-xl border p-3 transition-all relative ${
                            isCurrent
                              ? 'border-blue-500/60 bg-blue-950/30 shadow-md shadow-blue-950/50 ring-1 ring-blue-500/50'
                              : isReached
                              ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
                              : 'border-slate-800/60 bg-slate-950/30 text-slate-500 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-mono font-bold uppercase">
                              Stage 0{idx + 1}
                            </span>
                            {isReached && (
                              <CheckCircle2 size={13} className={isCurrent ? 'text-blue-400' : 'text-emerald-400'} />
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${
                              isCurrent
                                ? 'bg-blue-500/20 text-blue-400'
                                : isReached
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-slate-800 text-slate-500'
                            }`}>
                              <Icon size={14} />
                            </div>
                            <span className={`text-xs font-bold ${
                              isCurrent ? 'text-white' : isReached ? 'text-slate-200' : 'text-slate-500'
                            }`}>
                              {stage.label}
                            </span>
                          </div>

                          <div className="text-[10px] text-slate-400 mt-1 truncate">
                            {stage.desc}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actual Blockchain Custody Events List */}
                <div className="space-y-2.5">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Ledger Custody Event Log ({custodyEventsToDisplay.length} {custodyEventsToDisplay.length === 1 ? 'event' : 'events'})
                  </div>

                  {custodyEventsToDisplay.map((event, index) => {
                    const roleCfg = getRoleBadgeConfig(event.role);
                    const isLatest = index === custodyEventsToDisplay.length - 1;

                    return (
                      <div
                        key={index}
                        className={`rounded-xl border p-3.5 transition-all ${
                          isLatest
                            ? 'border-blue-500/30 bg-blue-950/10'
                            : 'border-slate-800/80 bg-slate-900/40'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="h-6 w-6 rounded-full bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
                              #{index + 1}
                            </span>

                            <div className="flex items-center gap-2 text-xs flex-wrap">
                              <span className="text-slate-400">From:</span>
                              <span className="font-semibold text-slate-300 font-mono bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                                {event.from}
                              </span>

                              <ArrowRight size={13} className="text-slate-500 shrink-0" />

                              <span className="text-slate-400">To:</span>
                              <span className="font-bold text-white font-mono bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30 text-blue-300">
                                {event.to}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${roleCfg.badgeBg} ${roleCfg.badgeBorder} ${roleCfg.badgeText}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${roleCfg.dotColor}`}></span>
                              {roleCfg.label}
                            </span>

                            <span className="text-[11px] text-slate-400 font-mono">
                              {formatDate(event.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* IoT Storage Telemetry Details & Chronological Audit Trail */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-5 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <Layers size={16} className="text-emerald-400" />
                      Storage Telemetry & Cold-Chain Compliance
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Immutable IoT sensor readings evaluated on-chain against crop-specific rules
                    </p>
                  </div>

                  <button
                    onClick={() => onOpenUpdateStorage(batch)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition self-start sm:self-auto"
                  >
                    <Edit3 size={13} />
                    <span>Update Conditions</span>
                  </button>
                </div>

                {/* On-Chain Crop Specific Rules Banner */}
                <div className="rounded-xl border border-slate-800/80 bg-slate-900/70 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles size={15} className="text-emerald-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        On-Chain Crop Standard: {batch.crop}
                      </span>
                      {storageRules?.isFallback && (
                        <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
                          Baseline Fallback
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {storageRules?.ruleName || 'Evaluating chaincode rules...'}
                    </span>
                  </div>

                  {/* Requirements vs Current Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] uppercase font-medium text-slate-400 block">Required Temp</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        {minTemp}°C – {maxTemp}°C
                      </span>
                    </div>
                    <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] uppercase font-medium text-slate-400 block">Required RH</span>
                      <span className="font-mono font-bold text-cyan-400 text-sm">
                        {minHum}% – {maxHum}%
                      </span>
                    </div>
                    <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] uppercase font-medium text-slate-400 block">Current Temp</span>
                      <span className={`font-mono font-bold text-sm ${isMonitored ? (isSafeTemp ? 'text-emerald-400' : 'text-rose-400') : 'text-slate-500'}`}>
                        {isMonitored ? `${temp}°C` : '—'}
                      </span>
                    </div>
                    <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] uppercase font-medium text-slate-400 block">Current RH</span>
                      <span className={`font-mono font-bold text-sm ${isMonitored ? (isSafeHum ? 'text-cyan-400' : 'text-rose-400') : 'text-slate-500'}`}>
                        {isMonitored ? `${hum}%` : '—'}
                      </span>
                    </div>
                  </div>

                  {storageRules?.description && (
                    <p className="text-[11px] text-slate-400 italic">
                      "{storageRules.description}"
                    </p>
                  )}
                </div>

                {/* Current Telemetry Gauges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Temperature Card */}
                  <div className={`rounded-xl border p-4 transition-colors ${
                    !isMonitored
                      ? 'border-slate-800 bg-slate-900/50'
                      : isSafeTemp
                      ? 'border-emerald-500/30 bg-emerald-950/20'
                      : 'border-rose-500/30 bg-rose-950/20'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                        <Thermometer size={15} className={isSafeTemp ? 'text-emerald-400' : 'text-rose-400'} />
                        Latest Temperature
                      </span>
                      {isMonitored && (
                        <span className={`text-xs font-medium ${isSafeTemp ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isSafeTemp ? `Compliant (${minTemp}°C – ${maxTemp}°C)` : 'Out of Safe Range'}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-2xl font-bold font-mono text-white">
                        {isMonitored ? temp : '—'}
                      </span>
                      <span className="text-sm text-slate-400">°C</span>
                    </div>
                    <div className="mt-2 text-[11px] text-slate-400">
                      {batch.crop} cold-chain threshold: {minTemp}°C to {maxTemp}°C
                    </div>
                  </div>

                  {/* Humidity Card */}
                  <div className={`rounded-xl border p-4 transition-colors ${
                    !isMonitored
                      ? 'border-slate-800 bg-slate-900/50'
                      : isSafeHum
                      ? 'border-emerald-500/30 bg-emerald-950/20'
                      : 'border-rose-500/30 bg-rose-950/20'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                        <Droplets size={15} className={isSafeHum ? 'text-cyan-400' : 'text-rose-400'} />
                        Latest Humidity
                      </span>
                      {isMonitored && (
                        <span className={`text-xs font-medium ${isSafeHum ? 'text-cyan-400' : 'text-rose-400'}`}>
                          {isSafeHum ? `Compliant (${minHum}% – ${maxHum}% RH)` : 'Out of Safe Range'}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-2xl font-bold font-mono text-white">
                        {isMonitored ? hum : '—'}
                      </span>
                      <span className="text-sm text-slate-400">% RH</span>
                    </div>
                    <div className="mt-2 text-[11px] text-slate-400">
                      {batch.crop} humidity threshold: {minHum}% to {maxHum}% RH
                    </div>
                  </div>
                </div>

                {/* Immutable Storage Telemetry Audit Trail Timeline */}
                <div className="pt-3 space-y-3 border-t border-slate-850">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity size={14} className="text-cyan-400" />
                      <span>Telemetry Audit Trail ({telemetryToDisplay.length} {telemetryToDisplay.length === 1 ? 'record' : 'records'})</span>
                    </div>
                    {telemetryToDisplay.length > 0 && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        Chronological Fabric Ledger Commits
                      </span>
                    )}
                  </div>

                  {telemetryToDisplay.length === 0 ? (
                    <div className="rounded-xl border border-slate-850 bg-slate-900/30 p-5 text-center">
                      <p className="text-xs text-slate-400">
                        No IoT sensor telemetry records committed to ledger yet. Click <span className="text-emerald-400 font-semibold">"Update Conditions"</span> to record the first reading.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {telemetryToDisplay.map((rec, index) => {
                        const isSafe = rec.storageStatus === 'SAFE';
                        const isLatest = index === telemetryToDisplay.length - 1;

                        return (
                          <div
                            key={index}
                            className={`rounded-xl border p-3.5 transition-all ${
                              isLatest
                                ? isSafe
                                  ? 'border-emerald-500/40 bg-emerald-950/15 ring-1 ring-emerald-500/20'
                                  : 'border-rose-500/40 bg-rose-950/15 ring-1 ring-rose-500/20'
                                : 'border-slate-800/80 bg-slate-900/40'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                              <div className="flex items-center gap-3">
                                <span className="h-6 w-6 rounded-full bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
                                  #{index + 1}
                                </span>

                                <div className="flex items-center gap-3 text-xs flex-wrap font-mono">
                                  {/* Temperature */}
                                  <div className="flex items-center gap-1.5 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-850">
                                    <Thermometer
                                      size={14}
                                      className={rec.temperature >= minTemp && rec.temperature <= maxTemp ? 'text-emerald-400' : 'text-rose-400'}
                                    />
                                    <span className="text-slate-400">Temp:</span>
                                    <span className={`font-bold ${rec.temperature >= minTemp && rec.temperature <= maxTemp ? 'text-emerald-300' : 'text-rose-300'}`}>
                                      {rec.temperature}°C
                                    </span>
                                  </div>

                                  {/* Humidity */}
                                  <div className="flex items-center gap-1.5 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-850">
                                    <Droplets
                                      size={14}
                                      className={rec.humidity >= minHum && rec.humidity <= maxHum ? 'text-cyan-400' : 'text-rose-400'}
                                    />
                                    <span className="text-slate-400">RH:</span>
                                    <span className={`font-bold ${rec.humidity >= minHum && rec.humidity <= maxHum ? 'text-cyan-300' : 'text-rose-300'}`}>
                                      {rec.humidity}%
                                    </span>
                                  </div>

                                  {rec.ruleApplied && (
                                    <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded">
                                      {rec.ruleApplied}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Status Badge & Timestamp */}
                              <div className="flex items-center gap-2.5 self-start sm:self-auto">
                                <StatusBadge status={rec.storageStatus} size="sm" />

                                <span className="text-[11px] text-slate-400 font-mono">
                                  {formatDate(rec.timestamp)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Cryptographic Ledger Audit Proof */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-2.5">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  <span>Hyperledger Fabric Immutability Proof</span>
                </div>
                <div className="space-y-1 text-xs text-slate-400 font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400">Channel Name:</span>
                    <span className="text-slate-200">agrichannel</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400">Chaincode ID:</span>
                    <span className="text-slate-200">agrichain</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400">Ledger State Key:</span>
                    <span className="text-emerald-400">{batch.batchId}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400">Crop Rules Query:</span>
                    <span className="text-purple-400">EvaluateTransaction('GetBatchStorageRules')</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400">Custody Audit Query:</span>
                    <span className="text-blue-400">EvaluateTransaction('GetCustodyHistory')</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Telemetry Audit Query:</span>
                    <span className="text-cyan-400">EvaluateTransaction('GetTelemetryHistory')</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-800 px-6 py-4 bg-slate-950/80">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition"
          >
            Close
          </button>
          {batch && (
            <>
              <button
                onClick={() => onOpenTransferCustody(batch)}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 shadow-md shadow-blue-950 transition"
              >
                <Truck size={15} />
                Transfer Custody
              </button>
              <button
                onClick={() => onOpenUpdateStorage(batch)}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 shadow-md shadow-emerald-950 transition"
              >
                <Edit3 size={15} />
                Update Storage Conditions
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
