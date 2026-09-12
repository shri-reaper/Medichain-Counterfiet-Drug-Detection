import React, { useState } from 'react';
import {
  X,
  Truck,
  User,
  Building2,
  Store,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { transferBatch, getErrorMessage } from '../../api/batchApi';
import { getRoleBadgeConfig } from '../../utils/helpers';

const ROLE_OPTIONS = [
  { value: 'FARMER', label: 'Farmer / Producer', icon: User, desc: 'Agricultural crop producer or harvest station' },
  { value: 'TRANSPORTER', label: 'Transporter / Logistics', icon: Truck, desc: 'Cold-chain freight or vehicle carrier' },
  { value: 'DISTRIBUTOR', label: 'Distributor / Warehouse', icon: Building2, desc: 'Regional wholesale hub or packing facility' },
  { value: 'RETAILER', label: 'Retailer / Store', icon: Store, desc: 'Supermarket, grocery chain or end point-of-sale' },
];

export default function TransferCustodyModal({
  batch,
  onClose,
  onBatchUpdated,
}) {
  const currentCustodian = batch?.currentCustodian || batch?.farmer || 'Unknown';
  const currentRole = batch?.currentRole || 'FARMER';
  const currentRoleConfig = getRoleBadgeConfig(currentRole);

  // Suggest next role in standard progression: Farmer -> Transporter -> Distributor -> Retailer
  const getNextSuggestedRole = (role) => {
    switch (String(role).toUpperCase()) {
      case 'FARMER':
        return 'TRANSPORTER';
      case 'TRANSPORTER':
        return 'DISTRIBUTOR';
      case 'DISTRIBUTOR':
        return 'RETAILER';
      case 'RETAILER':
      default:
        return 'RETAILER';
    }
  };

  const [newCustodian, setNewCustodian] = useState('');
  const [newRole, setNewRole] = useState(getNextSuggestedRole(currentRole));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!batch) return null;

  const targetRoleConfig = getRoleBadgeConfig(newRole);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!newCustodian.trim()) {
      setError('Please provide the new custodian name or entity identifier.');
      return;
    }

    if (!newRole) {
      setError('Please select a supply chain role.');
      return;
    }

    if (newCustodian.trim().toLowerCase() === currentCustodian.trim().toLowerCase()) {
      setError('The new custodian cannot be identical to the current custodian.');
      return;
    }

    try {
      setLoading(true);
      const updatedBatch = await transferBatch(
        batch.batchId,
        newCustodian.trim(),
        newRole
      );
      setSuccessMsg(`Custody of batch ${batch.batchId} successfully transferred to ${newCustodian.trim()} (${newRole}) on the blockchain ledger!`);
      if (onBatchUpdated) {
        onBatchUpdated(updatedBatch);
      }
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Truck size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Transfer Batch Custody
              </h3>
              <p className="text-xs text-slate-400">
                Record immutable ownership handoff on Hyperledger Fabric
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Target Batch Info */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Target Batch
                </span>
                <div className="text-base font-bold text-white font-mono flex items-center gap-2">
                  <span className="text-emerald-400">{batch.batchId}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300 font-sans text-sm font-semibold">{batch.crop}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                  Current Role
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentRoleConfig.badgeBg} ${currentRoleConfig.badgeBorder} ${currentRoleConfig.badgeText}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${currentRoleConfig.dotColor}`}></span>
                  {currentRoleConfig.label}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-850 pt-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-400">Current Custodian:</span>
              <span className="font-semibold text-slate-200">{currentCustodian}</span>
            </div>
          </div>

          {/* Custody Transfer Flow Preview */}
          <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950/30 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-6 w-6 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 shrink-0">
                <User size={12} />
              </div>
              <div className="truncate">
                <div className="text-[10px] text-slate-500 uppercase">From</div>
                <div className="font-semibold text-slate-300 truncate">{currentCustodian}</div>
              </div>
            </div>

            <ArrowRight size={16} className="text-blue-400 shrink-0" />

            <div className="flex items-center gap-2 min-w-0 text-right">
              <div className="truncate">
                <div className="text-[10px] text-slate-500 uppercase">To (Next)</div>
                <div className="font-semibold text-blue-300 truncate">
                  {newCustodian.trim() || 'Specify Custodian'}
                </div>
              </div>
              <div className="h-6 w-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Truck size={12} />
              </div>
            </div>
          </div>

          {/* New Custodian Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              New Custodian Name / Organization <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={newCustodian}
                onChange={(e) => setNewCustodian(e.target.value)}
                placeholder="e.g. Transporter_A, ExpressLogistics, MetroDistributors"
                disabled={loading}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition disabled:opacity-50"
                required
              />
            </div>
            <p className="mt-1.5 text-[11px] text-slate-400">
              The individual or corporate entity accepting custody and responsibility for the produce.
            </p>
          </div>

          {/* New Role Select Dropdown */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Supply Chain Role <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ROLE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = newRole === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setNewRole(opt.value)}
                    disabled={loading}
                    className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10 text-white ring-1 ring-blue-500'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <div className={`rounded-lg p-1.5 mt-0.5 ${isSelected ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400'}`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200">
                        {opt.label}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                        {opt.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Blockchain Consensus Notice */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-xs text-slate-400 flex items-start gap-2.5">
            <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-300">Fabric Consensus Execution:</span>{' '}
              Submits <code className="font-mono text-emerald-400">TransferBatch</code> to chaincode <code className="font-mono text-cyan-400">agrichain</code> on channel <code className="font-mono text-cyan-400">agrichannel</code> with a deterministic transaction timestamp.
            </div>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300 flex items-start gap-2">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-start gap-2">
              <AlertTriangle size={16} className="shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-500 shadow-lg shadow-blue-950/60 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Submitting to Ledger...</span>
                </>
              ) : (
                <>
                  <Truck size={14} />
                  <span>Commit Transfer to Ledger</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
