import React, { useState, useEffect } from 'react';
import {
  X,
  Thermometer,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Info,
  Sparkles,
} from 'lucide-react';
import { updateStorageConditions, getBatchStorageRules, getErrorMessage } from '../../api/batchApi';
import { evaluateConditions } from '../../utils/helpers';
import StatusBadge from '../common/StatusBadge';

export default function UpdateStorageModal({
  batch,
  onClose,
  onBatchUpdated,
}) {
  const [temperature, setTemperature] = useState(
    batch?.temperature !== undefined ? String(batch.temperature) : ''
  );
  const [humidity, setHumidity] = useState(
    batch?.humidity !== undefined ? String(batch.humidity) : ''
  );
  const [rules, setRules] = useState(null);
  const [rulesLoading, setRulesLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (batch?.batchId) {
      setRulesLoading(true);
      getBatchStorageRules(batch.batchId)
        .then((res) => {
          if (isMounted) setRules(res);
        })
        .catch((err) => {
          console.warn('Failed to load crop storage rules:', err);
        })
        .finally(() => {
          if (isMounted) setRulesLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [batch?.batchId]);

  if (!batch) return null;

  // Real-time preview of what the chaincode will evaluate with crop-specific rules
  const evaluatedStatus =
    temperature !== '' && humidity !== ''
      ? evaluateConditions(temperature, humidity, rules)
      : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (temperature === '' || humidity === '') {
      setError('Please provide both temperature and humidity values.');
      return;
    }

    const t = Number(temperature);
    const h = Number(humidity);

    if (isNaN(t) || isNaN(h)) {
      setError('Temperature and humidity must be valid numeric values.');
      return;
    }

    try {
      setLoading(true);
      const updatedBatch = await updateStorageConditions(
        batch.batchId,
        t,
        h
      );
      setSuccessMsg(`Storage conditions successfully updated for ${batch.batchId}! Status is now ${updatedBatch.storageStatus}.`);
      if (onBatchUpdated) {
        onBatchUpdated(updatedBatch);
      }
      // Auto-close after short delay or let user dismiss
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Thermometer size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Update Storage Conditions
              </h3>
              <p className="text-xs text-slate-400">
                Transact IoT Telemetry to Blockchain Ledger
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

        {/* Batch Quick Context */}
        <div className="bg-slate-950/40 px-6 py-3 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Batch:</span>
            <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
              {batch.batchId}
            </span>
            <span className="text-slate-300 font-medium">({batch.crop})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Current:</span>
            <StatusBadge status={batch.storageStatus} size="sm" />
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Transaction Failed</p>
                <p className="mt-0.5 text-rose-200/80">{error}</p>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Transaction Committed to Ledger!</p>
                <p className="mt-0.5 text-emerald-200/80">{successMsg}</p>
              </div>
            </div>
          )}

          {/* Crop-Specific Guidelines Box */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-400 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                <Sparkles size={14} className="text-emerald-400" />
                <span>On-Chain Rules: <strong className="text-white">{batch.crop}</strong></span>
              </div>
              {rules?.isFallback && (
                <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
                  Baseline Fallback
                </span>
              )}
            </div>

            {rulesLoading ? (
              <p className="text-[11px] text-slate-500 animate-pulse">
                Querying crop-specific thresholds from Hyperledger Fabric...
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Safe Temp Range</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {rules?.minTemperature ?? 2}°C – {rules?.maxTemperature ?? 8}°C
                    </span>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Safe Humidity Range</span>
                    <span className="font-mono font-bold text-cyan-400">
                      {rules?.minHumidity ?? 40}% – {rules?.maxHumidity ?? 60}% RH
                    </span>
                  </div>
                </div>
                {rules?.description && (
                  <p className="text-[11px] text-slate-400 leading-relaxed italic border-t border-slate-850 pt-2">
                    "{rules.description}"
                  </p>
                )}
              </>
            )}
          </div>

          {/* Temperature Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Thermometer size={14} className="text-emerald-400" />
                Temperature (°C)
              </span>
              <span className="text-[11px] font-normal text-slate-400">
                Safe: {rules ? `${rules.minTemperature} to ${rules.maxTemperature} °C` : '2 to 8 °C'}
              </span>
            </label>
            <input
              type="number"
              step="any"
              required
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              placeholder="e.g. 12"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 font-mono text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
            />
          </div>

          {/* Humidity Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Droplets size={14} className="text-cyan-400" />
                Humidity (% RH)
              </span>
              <span className="text-[11px] font-normal text-slate-400">
                Safe: {rules ? `${rules.minHumidity} to ${rules.maxHumidity} %` : '40 to 60 %'}
              </span>
            </label>
            <input
              type="number"
              step="any"
              required
              value={humidity}
              onChange={(e) => setHumidity(e.target.value)}
              placeholder="e.g. 90"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 font-mono text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-sm"
            />
          </div>

          {/* Dynamic Evaluation Preview */}
          {evaluatedStatus && (
            <div
              className={`rounded-xl border p-3.5 flex items-center justify-between transition-all ${
                evaluatedStatus === 'SAFE'
                  ? 'border-emerald-500/30 bg-emerald-950/20'
                  : 'border-rose-500/30 bg-rose-950/20'
              }`}
            >
              <div className="flex items-center gap-2.5 text-xs">
                {evaluatedStatus === 'SAFE' ? (
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle size={18} className="text-rose-400 shrink-0" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">Smart Contract Simulation:</span>
                    <span className="font-mono text-[11px] text-slate-400">({batch.crop})</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {evaluatedStatus === 'SAFE'
                      ? `Within ${batch.crop} cold-chain preservation thresholds`
                      : `Outside ${batch.crop} safe limits (${rules ? `${rules.minTemperature}–${rules.maxTemperature}°C, ${rules.minHumidity}–${rules.maxHumidity}%` : ''}) - will flag breach`}
                  </p>
                </div>
              </div>
              <StatusBadge status={evaluatedStatus} size="sm" />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500 shadow-md shadow-emerald-950 transition disabled:opacity-50"
            >
              {loading && <RefreshCw size={15} className="animate-spin" />}
              <span>{loading ? 'Submitting to Peer...' : 'Commit to Blockchain'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
