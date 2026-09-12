import React, { useState } from 'react';
import {
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Package,
  User,
  MapPin,
  Scale,
  ShieldCheck,
  ArrowRight,
  Hash,
} from 'lucide-react';
import { createBatch, getErrorMessage } from '../../api/batchApi';

export default function CreateBatchView({
  onBatchCreated,
  onNavigateBatches,
}) {
  const [formData, setFormData] = useState({
    batchId: '',
    crop: '',
    farmer: '',
    location: '',
    quantity: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdBatch, setCreatedBatch] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCreatedBatch(null);

    // Validation
    if (!formData.batchId.trim()) {
      setError('Batch ID is required.');
      return;
    }
    if (!formData.crop.trim()) {
      setError('Crop name is required.');
      return;
    }
    if (!formData.farmer.trim()) {
      setError('Farmer / Producer name is required.');
      return;
    }
    if (!formData.location.trim()) {
      setError('Location is required.');
      return;
    }
    const q = Number(formData.quantity);
    if (isNaN(q) || q <= 0) {
      setError('Quantity must be a positive number.');
      return;
    }

    try {
      setLoading(true);
      const newBatch = await createBatch({
        batchId: formData.batchId.trim(),
        crop: formData.crop.trim(),
        farmer: formData.farmer.trim(),
        location: formData.location.trim(),
        quantity: q,
      });

      setCreatedBatch(newBatch);
      if (onBatchCreated) {
        onBatchCreated(newBatch);
      }
      // Reset form
      setFormData({
        batchId: '',
        crop: '',
        farmer: '',
        location: '',
        quantity: '',
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <PlusCircle size={22} className="text-emerald-400" />
          Register New Agricultural Batch
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Mint a cryptographic agricultural asset on the Hyperledger Fabric ledger (Channel: <span className="text-slate-300 font-mono">agrichannel</span>)
        </p>
      </div>

      {/* Success Notification Banner */}
      {createdBatch && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-emerald-300 space-y-3 shadow-lg shadow-emerald-950/40">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={22} className="shrink-0 text-emerald-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-emerald-200">
                Batch Successfully Minted to Ledger!
              </h4>
              <p className="text-xs text-emerald-300/80 mt-1">
                Asset <strong className="font-mono text-white">{createdBatch.batchId}</strong> has been committed to the ledger with initial status <strong className="font-mono text-amber-300">NOT_MONITORED</strong>.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={onNavigateBatches}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition shadow-sm"
                >
                  <span>View All Batches</span>
                  <ArrowRight size={13} />
                </button>
                <button
                  onClick={() => setCreatedBatch(null)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
                >
                  Register another batch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-300 text-xs flex items-start gap-3">
          <AlertTriangle size={18} className="shrink-0 text-rose-400 mt-0.5" />
          <div>
            <h4 className="font-bold text-rose-200">Transaction Rejection</h4>
            <p className="text-rose-200/80 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Form Container */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Batch ID */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                <Hash size={14} className="text-emerald-400" />
                Batch ID <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="batchId"
                required
                value={formData.batchId}
                onChange={handleChange}
                placeholder="e.g. B002 or BATCH-TOMATO-02"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 font-mono text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Unique identifier acting as the primary key in world state.
              </p>
            </div>

            {/* Crop */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                <Package size={14} className="text-emerald-400" />
                Crop / Produce Type <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="crop"
                required
                value={formData.crop}
                onChange={handleChange}
                placeholder="e.g. Organic Tomato, Basmati Rice"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Farmer */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                <User size={14} className="text-emerald-400" />
                Farmer / Producer Identity <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="farmer"
                required
                value={formData.farmer}
                onChange={handleChange}
                placeholder="e.g. Farmer_B, Deccan Farms"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                <MapPin size={14} className="text-emerald-400" />
                Origin / Harvest Location <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Nashik, Maharashtra"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Quantity */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                <Scale size={14} className="text-emerald-400" />
                Quantity (Kg / Units) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                min="1"
                step="any"
                required
                value={formData.quantity}
                onChange={handleChange}
                placeholder="e.g. 250"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 font-mono text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Blockchain Consensus Explanation Card */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-slate-200">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>Smart Contract Execution Details</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Submitting this form executes the <code className="text-emerald-400 font-mono">CreateBatch</code> transaction via the Fabric Node.js Gateway. The chaincode verifies that the batch ID does not already exist, initializes telemetry to <code className="text-slate-300 font-mono">0°C / 0%</code> with status <code className="text-amber-400 font-mono">NOT_MONITORED</code>, and records the current timestamp.
            </p>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() =>
                setFormData({
                  batchId: '',
                  crop: '',
                  farmer: '',
                  location: '',
                  quantity: '',
                })
              }
              disabled={loading}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition disabled:opacity-50"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-950 transition disabled:opacity-50"
            >
              {loading && <RefreshCw size={15} className="animate-spin" />}
              <span>
                {loading ? 'Committing to Blockchain...' : 'Mint Batch to Blockchain'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
