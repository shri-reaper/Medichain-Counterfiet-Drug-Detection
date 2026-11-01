import React, { useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, ArrowRight, ChevronRight, ClipboardCheck, Factory, FlaskConical, Package, RefreshCw, Search, ShieldAlert, ShieldCheck, Truck, XCircle, Shield } from 'lucide-react';
import { checkHealth, createMedicine, getAllMedicines, getErrorMessage, recallMedicine, transferMedicine, verifyMedicine } from './api/medicineApi';
import { Toaster, toast } from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { motion, AnimatePresence } from 'framer-motion';
import './dashboard-theme.css';

const roles = ['WHOLESALER', 'DISTRIBUTOR', 'PHARMACY', 'HOSPITAL', 'REGULATOR'];
const initialForm = { medicineId: '', medicineName: '', manufacturer: '', batchNumber: '', expiryDate: '', manufacturingLocation: '', quantity: '', verificationCode: '' };
const statusConfig = { 
  GENUINE: ['Genuine', 'text-emerald-400 bg-emerald-500/20 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.4)]', ShieldCheck], 
  COUNTERFEIT_OR_RECALLED: ['Counterfeit / Recalled', 'text-rose-400 bg-rose-500/20 border-rose-500/50 shadow-[0_0_15px_rgba(225,29,72,0.4)]', ShieldAlert], 
  RECALLED: ['Recalled', 'text-rose-400 bg-rose-500/20 border-rose-500/50 shadow-[0_0_15px_rgba(225,29,72,0.4)]', XCircle], 
  UNVERIFIED: ['Unverified', 'text-amber-400 bg-amber-500/20 border-amber-500/50', AlertTriangle] 
};

function Badge({ status }) { 
  const [label, cls, Icon] = statusConfig[status] || statusConfig.UNVERIFIED; 
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-widest backdrop-blur-md ${cls} ${status === 'GENUINE' ? 'animate-pulse' : ''}`}>
      <Icon size={14}/>{label}
    </span>
  ); 
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-cyan-500/70">{label}</label>
      <input 
        className="w-full rounded-xl border border-slate-800 bg-[#0a1120] p-3 text-sm font-medium text-white outline-none focus:border-cyan-500/50" 
        {...props} 
      />
    </div>
  );
}

export default function App() {
  const [printLabel, setPrintLabel] = useState(null);
  const [medicines, setMedicines] = useState([]); 
  const [health, setHealth] = useState(null); 
  const [view, setView] = useState('registry'); 
  const [query, setQuery] = useState(''); 
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selected, setSelected] = useState(null); 
  const [busy, setBusy] = useState(false); 
  const [message, setMessage] = useState(null); 
  
  const [form, setForm] = useState(initialForm); 
  const [verifyForm, setVerifyForm] = useState({ scannedCode: '', verifier: '', location: '' }); 
  const [transferForm, setTransferForm] = useState({ newCustodian: '', newRole: 'DISTRIBUTOR', scannedCode: '' }); 
  const [recallForm, setRecallForm] = useState({ reason: '', recalledBy: '', scannedCode: '' });
  const getErrorMessage = (err) => {
    const fullError = JSON.stringify(err?.response?.data || err) + String(err);
    
    if (fullError.includes('10 ABORTED:') || fullError.includes('already exists') || fullError.includes('already registered')) {
      // 1. Check Ledger ID match
      if (medicines.some(m => m.medicineId === form.medicineId)) {
        return `Duplicate Entry: Ledger ID "${form.medicineId}" has already been created.`;
      }
      // 2. Check Batch Number match
      if (medicines.some(m => m.batchNumber === form.batchNumber)) {
        return `Duplicate Entry: Production Batch No. "${form.batchNumber}" is already registered.`;
      }
      // 3. Check Secret Hash match securely without exposing the hash
      if (fullError.includes('Cryptographic Secret Payload') || fullError.includes('Secret Hash')) {
        return 'Duplicate Entry: The provided Cryptographic Secret Payload is already in use by another batch.';
      }
      
      return `Duplicate Entry: A conflicting record already exists on the network.`;
    }
    
    return err?.response?.data?.error || err?.response?.data?.message || err?.message || String(err);
  };
  const load = async () => { 
    try { 
      setMedicines(await getAllMedicines()); 
      setHealth(await checkHealth()); 
    } catch (e) { 
      setHealth({ status: 'OFFLINE' }); 
      setMessage({ type: 'error', text: getErrorMessage(e) }); 
    } 
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
  return medicines.filter((m) => {
    const matchesQuery = [
      m.medicineId,
      m.medicineName,
      m.manufacturer,
      m.batchNumber,
      m.currentCustodian,
    ].some((value) =>
      String(value || '').toLowerCase().includes(query.toLowerCase())
    );

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'GENUINE' && m.authenticityStatus === 'GENUINE') ||
      (statusFilter === 'RECALLED' && m.status === 'RECALLED') ||
      (statusFilter === 'PENDING' &&
        m.authenticityStatus !== 'GENUINE' &&
        m.status !== 'RECALLED');

    return matchesQuery && matchesStatus;
  });
}, [medicines, query, statusFilter]);
const goToRegistry = (filter = 'ALL', hint = '') => {
  setStatusFilter(filter);
  setView('registry');

  if (hint) {
    setMessage({ type: 'success', text: hint });
  }

  window.setTimeout(() => {
    document.getElementById('medicine-registry')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, 150);
};

  const act = async (fn, success) => { 
    try { 
      setBusy(true); 
      const result = await fn(); 
      setSelected(result.medicine || result); 
      setMessage({ type: 'success', text: success }); 
      await load(); 
      return true; // Returns true if blockchain accepts it
    } catch (e) { 
      setMessage({ type: 'error', text: getErrorMessage(e) }); 
      return false; // Returns false so the UI knows to halt
    } finally { 
      setBusy(false); 
    } 
  };

  const submitCreate = async (e) => { 
    e.preventDefault(); 
    const labelData = { ...form }; 
    const isSuccess = await act(() => createMedicine({ ...form, quantity: Number(form.quantity) }), 'Medicine batch registered on the immutable ledger.'); 
    
    // Only display QR and clear form if registration was successful
    if (isSuccess) {
      setPrintLabel(labelData); 
      setForm(initialForm); 
    }
  };

  const current = selected ? medicines.find((m) => m.medicineId === selected.medicineId) || selected : null;
  const total = medicines.length, genuine = medicines.filter((m) => m.authenticityStatus === 'GENUINE').length, recalled = medicines.filter((m) => m.status === 'RECALLED').length, unverified = total - genuine - recalled;

  return (
    <div className="dashboard-theme min-h-screen bg-[#020617] text-slate-100 font-outfit relative overflow-hidden">
      {/* INJECT CUSTOM GOOGLE FONT */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700;900&display=swap');
        .font-outfit { font-family: 'Outfit', sans-serif; }
      `}} />


      {/* AMBIENT BACKGROUND GLOWS */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-cyan-600/20 blur-[150px]"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] rounded-full bg-indigo-600/10 blur-[150px]"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[40%] rounded-full bg-blue-800/10 blur-[120px]"></div>
      </div>

      <header className="relative z-10 border-b border-white/10 bg-[#020617]/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            {/* NEW LOGO DESIGN */}
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-600 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              <Shield className="absolute text-white/20" size={32} />
              <FlaskConical className="relative text-white" size={22} />
            </div>
            <div>
              <div className="text-2xl font-black tracking-tight text-[#211c32]">
                MEDI<span className="text-[#6242bd]">CHAIN</span>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#716b7c]">
                Zero-Trust Network
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
            <span className={`flex items-center gap-2 rounded-full border px-4 py-2 backdrop-blur-md ${health?.status === 'UP' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-amber-500/30 bg-amber-500/10 text-amber-400'}`}>
              <span className={`h-2 w-2 rounded-full bg-current ${health?.status === 'UP' ? 'animate-pulse' : ''}`}/>
              Sepolia {health?.status || 'CHECKING'}
            </span>
            <button onClick={load} className="rounded-full bg-white/5 p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"><RefreshCw size={18}/></button>
          </div>
        </div>
      </header>
<aside className="medi-sidebar" aria-label="Dashboard navigation">
  <p className="medi-sidebar-heading">WORKSPACE</p>

  <button
    type="button"
    className={`medi-nav-item ${view === 'registry' ? 'is-active' : ''}`}
    onClick={() => {
      setView('registry');
      setMessage(null);
    }}
  >
    <Activity size={19} />
    <span>Overview</span>
  </button>

  <button
    type="button"
    className={`medi-nav-item ${view === 'register' ? 'is-active' : ''}`}
    onClick={() => {
      setView('register');
      setMessage(null);
    }}
  >
    <Factory size={19} />
    <span>Register batch</span>
  </button>

  <button
  type="button"
  className="medi-nav-item"
  onClick={() =>
    goToRegistry(
      'ALL',
      'Select a medicine below to inspect, verify, transfer, or recall it.'
    )
  }
>
  <ShieldCheck size={19} />
  <span>Verify medicine</span>
</button>

  <button
    type="button"
    className="medi-nav-item"
    onClick={load}
  >
    <RefreshCw size={19} />
    <span>Sync network</span>
  </button>

  <div className="medi-sidebar-note">
    <span className="medi-sidebar-dot" />
    <div>
      <strong>Ethereum Sepolia</strong>
      <small>{health?.status || 'Checking status'}</small>
    </div>
  </div>
</aside>

      <main className="relative z-10 mx-auto max-w-7xl space-y-8 px-6 py-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-cyan-400 flex items-center gap-2">
              <Activity size={14}/> Supply-Chain Intelligence
            </p>
            {/* GRADIENT TEXT HERO */}
            <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-100 to-cyan-500 pb-2">
              Trust every dose.
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
              Register legitimate medicine batches, verify serialized cryptographic codes, and expose counterfeit products utilizing an immutable Ethereum Sepolia audit trail.
            </p>
          </motion.div>
          <div className="flex gap-3 rounded-2xl bg-white/5 p-1.5 backdrop-blur-md border border-white/10">
            <button onClick={() => setView('registry')} className={`rounded-xl px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${view === 'registry' ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>Registry</button>
            <button onClick={() => setView('register')} className={`rounded-xl px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${view === 'register' ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>Mint Batch</button>
          </div>
        </div>

        <AnimatePresence>
          {message && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`flex items-center justify-between rounded-2xl border px-5 py-4 text-sm backdrop-blur-md ${message.type === 'error' ? 'border-rose-500/30 bg-rose-500/10 text-rose-200' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'}`}>
              <span className="font-semibold tracking-wide">{message.text}</span>
              <button onClick={() => setMessage(null)} className="hover:scale-110 transition-transform"><XCircle size={18}/></button>
            </motion.div>
          )}
        </AnimatePresence>

        {view === 'register' ? (
          <motion.section initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl border border-white/10 bg-[#0c1322]/80 p-8 shadow-2xl backdrop-blur-xl">
            <div className="mb-8 flex items-center gap-4 border-b border-white/5 pb-6">
              <div className="rounded-xl bg-cyan-500/20 p-3 text-cyan-400 border border-cyan-500/30"><Factory size={24}/></div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Initialize Production Batch</h2>
                <p className="text-sm text-slate-400 mt-1">The verification code will act as the physical-to-digital cryptographic anchor.</p>
              </div>
            </div>
            <form onSubmit={submitCreate} className="grid gap-6 md:grid-cols-2">
              <Field label="Ledger ID" name="medicineId" value={form.medicineId} onChange={e => setForm({...form, medicineId: e.target.value})} placeholder="MED-2026-0001"/>
              <Field label="Product Name" name="medicineName" value={form.medicineName} onChange={e => setForm({...form, medicineName: e.target.value})} placeholder="Amoxicillin 500mg"/>
              <Field label="Authorized Manufacturer" name="manufacturer" value={form.manufacturer} onChange={e => setForm({...form, manufacturer: e.target.value})} placeholder="Acme Pharma Ltd."/>
              <Field label="Production Batch No." name="batchNumber" value={form.batchNumber} onChange={e => setForm({...form, batchNumber: e.target.value})} placeholder="AMX-26-091"/>
              <Field label="Expiration Date" name="expiryDate" type="date" value={form.expiryDate} onChange={e => setForm({...form, expiryDate: e.target.value})}/>
              <Field label="Volume (Units)" name="quantity" type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} onKeyDown={(e) => ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()} />
              <Field label="Facility Location" name="manufacturingLocation" value={form.manufacturingLocation} onChange={e => setForm({...form, manufacturingLocation: e.target.value})} placeholder="Hyderabad, India"/>
              <Field label="Cryptographic Secret Payload" name="verificationCode" value={form.verificationCode} onChange={e => setForm({...form, verificationCode: e.target.value})} placeholder="QR-9F7K-2A1C (Keep secure)"/>
              
              <div className="md:col-span-2 flex justify-end border-t border-white/5 pt-6 mt-2">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={busy} className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 px-8 py-3.5 text-sm font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50 transition-shadow hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]">
                  {busy && <RefreshCw size={18} className="animate-spin"/>} Commit to Ledger <ArrowRight size={18}/>
                </motion.button>
              </div>
            </form>
          </motion.section>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ staggerChildren: 0.1 }}>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
<Metric
  icon={Package}
  label="Total Mints"
  value={total}
  tone="cyan"
  onClick={() => goToRegistry('ALL')}
  active={statusFilter === 'ALL'}
/>
<Metric
  icon={ShieldCheck}
  label="Secured Verifications"
  value={genuine}
  tone="emerald"
  onClick={() => goToRegistry('GENUINE')}
  active={statusFilter === 'GENUINE'}
/>
<Metric
  icon={ShieldAlert}
  label="Burned / Recalled"
  value={recalled}
  tone="rose"
  onClick={() => goToRegistry('RECALLED')}
  active={statusFilter === 'RECALLED'}
/>
<Metric
  icon={Activity}
  label="Pending Validation"
  value={unverified}
  tone="amber"
  onClick={() => goToRegistry('PENDING')}
  active={statusFilter === 'PENDING'}
/>
            </div>
            
            <section id="medicine-registry" className="mt-8 rounded-3xl border border-white/10 bg-[#0c1322]/60 shadow-2xl backdrop-blur-xl overflow-hidden">
              <div className="flex flex-col justify-between gap-4 border-b border-white/10 bg-white/5 p-6 md:flex-row md:items-center">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-white">Immutable Registry</h2>
                  <p className="mt-1 text-xs font-medium text-slate-400 uppercase tracking-widest">Global Supply Chain State</p>
                </div>
                <div className="relative w-full md:w-72">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500"/>
                  <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Query ledger..." className="w-full rounded-full border border-white/10 bg-black/40 py-2.5 pl-11 pr-4 text-sm text-white outline-none transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-inner"/>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-black/40 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Asset Designation</th>
                      <th className="px-6 py-4">Origin Entity</th>
                      <th className="px-6 py-4">Current Custody</th>
                      <th className="px-6 py-4">State</th>
                      <th className="px-6 py-4 text-right">Access</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filtered.map(m => (
                      <motion.tr 
                        key={m.medicineId} 
                        whileHover={{ backgroundColor: "rgba(6, 182, 212, 0.05)", scale: 1.005 }}
                        className="group border-b border-transparent cursor-pointer transition-colors"
                        onClick={() => setSelected(m)}
                      >
                        <td className="px-6 py-5">
                          <div className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">{m.medicineName}</div>
                          <div className="mt-1 flex items-center gap-2 font-mono text-[10px] text-cyan-500/80">
                            <span className="rounded bg-cyan-950/50 px-1.5 py-0.5">{m.medicineId}</span> 
                            <span className="rounded bg-indigo-950/50 px-1.5 py-0.5">{m.batchNumber}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="font-semibold text-slate-300">{m.manufacturer}</div>
                          <div className="mt-1 text-[11px] tracking-wide text-slate-500">EXP: {m.expiryDate}</div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="font-bold text-slate-200">{m.currentCustodian}</div>
                          <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-indigo-400">{m.currentRole}</div>
                        </td>
                        <td className="px-6 py-5"><Badge status={m.status === 'RECALLED' ? 'RECALLED' : m.authenticityStatus}/></td>
                        <td className="px-6 py-5 text-right">
                          <span className="inline-flex items-center gap-1 rounded-xl bg-white/5 px-4 py-2 font-bold text-cyan-400 opacity-70 transition-all group-hover:bg-cyan-500/20 group-hover:opacity-100">
                            Inspect <ChevronRight size={14}/>
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="p-16 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/5 mb-4"><Search className="text-slate-600" size={24}/></div>
                    <p className="text-sm font-bold tracking-wide text-slate-400">No assets located on the ledger.</p>
                  </div>
                )}
              </div>
            </section>
          </motion.div>
        )}
        
        
      </main>
      
      <AnimatePresence>
        {current && (
          <Detail 
            medicine={current} 
            busy={busy} 
            verifyForm={verifyForm} 
            setVerifyForm={setVerifyForm} 
            transferForm={transferForm} 
            setTransferForm={setTransferForm} 
            recallForm={recallForm} 
            setRecallForm={setRecallForm} 
            onClose={() => setSelected(null)} 
            onVerify={() => {
              if (current.status === 'RECALLED') {
                toast.error('Action blocked: This asset has been permanently recalled.');
                return;
              }
              act(() => verifyMedicine(current.medicineId, verifyForm), 'Verification attempt committed to the ledger.');
            }} 
            onTransfer={() => {
              if (current.status === 'RECALLED') {
                toast.error('Action blocked: Cannot transfer a recalled asset.');
                return;
              }
              if (transferForm.newCustodian.trim().toLowerCase() === current.currentCustodian.trim().toLowerCase()) {
                toast.error(`Transfer failed: Asset is already in the custody of ${current.currentCustodian}!`);
                return;
              }
              act(() => transferMedicine(current.medicineId, transferForm), 'Custody transfer committed to the ledger.');
            }} 
            onRecall={() => {
              if (current.status === 'RECALLED') {
                toast.error('Action blocked: This asset is already recalled.');
                return;
              }
              if (recallForm.recalledBy.trim().toLowerCase() !== current.manufacturer.trim().toLowerCase()) {
                toast.error(`Unauthorized: Only ${current.manufacturer} can recall this batch!`);
                return;
              }
              act(() => recallMedicine(current.medicineId, recallForm), 'Recall status committed to the ledger.');
            }} 
          />
        )}
      </AnimatePresence>
      {printLabel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md max-h-[95vh] overflow-y-auto rounded-3xl border border-cyan-500/50 bg-[#050b14] p-6 text-center shadow-[0_0_80px_rgba(6,182,212,0.2)]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 mb-4 border border-rose-500/30">
              <AlertTriangle className="text-rose-400" size={24}/>
            </div>
            <h2 className="text-2xl font-black text-white">Factory Print Station</h2>
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-rose-400 bg-rose-950/30 py-1.5 rounded-lg border border-rose-500/20">Critical Security Warning</p>
            <p className="mt-3 text-xs leading-relaxed text-slate-400">This is the <strong className="text-white">only time</strong> the cryptographic payload will be displayed. Scan or photograph this matrix to physically attach it to the asset.</p>
            
            <div className="my-5 mx-auto flex justify-center rounded-2xl bg-white p-4 shadow-[0_0_40px_rgba(255,255,255,0.1)] w-fit relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-transparent pointer-events-none"></div>
              <QRCodeSVG value={JSON.stringify({ medicineId: printLabel.medicineId, secretCode: printLabel.verificationCode })} size={180} level="H" />
            </div>
            
            <button onClick={() => setPrintLabel(null)} className="w-full rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 py-3.5 text-sm font-black uppercase tracking-widest text-white hover:shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all">
              Acknowledge & Destroy
            </button>
          </motion.div>
        </div>
      )}
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' } }} />
    </div>
  );
}

function Metric({ icon: Icon, label, value, tone, onClick, active }) {
  const tones = {
    cyan: 'from-cyan-500/20 to-cyan-500/5 text-cyan-400 border-cyan-500/20',
    emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20',
    rose: 'from-rose-500/20 to-rose-500/5 text-rose-400 border-rose-500/20',
    amber: 'from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/20',
  };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={`${label}: ${value}. Click to filter the registry.`}
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.99 }}
      className={`relative w-full overflow-hidden rounded-3xl border border-white/10 bg-[#0c1322]/80 p-6 text-left backdrop-blur-xl transition-all hover:border-violet-400/50 ${
        active ? 'ring-2 ring-violet-400/60' : ''
      }`}
    >
      <div className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-${tone}-500/10 blur-[50px]`} />
      <div className={`mb-4 inline-flex rounded-2xl border bg-gradient-to-br p-3 ${tones[tone]}`}>
        <Icon size={20} />
      </div>
      <div className="text-4xl font-black tracking-tight text-white">{value}</div>
      <div className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-500">
        {label}
      </div>
    </motion.button>
  );
}

function Detail({ medicine: m, busy, verifyForm, setVerifyForm, transferForm, setTransferForm, recallForm, setRecallForm, onClose, onVerify, onTransfer, onRecall }) { 
  const [isScanningVerify, setIsScanningVerify] = useState(false);
  const [isScanningTransfer, setIsScanningTransfer] = useState(false);
  const [isScanningRecall, setIsScanningRecall] = useState(false);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/80 p-0 backdrop-blur-xl md:items-center md:p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-t-3xl border border-cyan-500/30 bg-[#060c18] p-6 shadow-[0_0_50px_rgba(6,182,212,0.15)] md:rounded-3xl lg:p-10"
      >
        <div className="flex items-start justify-between border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <p className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/50 px-2 py-1 rounded">{m.medicineId}</p>
              <p className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/50 px-2 py-1 rounded">{m.batchNumber}</p>
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white">{m.medicineName}</h2>
            <p className="mt-1 text-sm font-medium text-slate-400 uppercase tracking-widest">{m.manufacturer} <span className="text-white/20 mx-2">|</span> EXP: {m.expiryDate}</p>
          </div>
          <button onClick={onClose} className="rounded-full bg-white/5 p-2 text-slate-400 transition-all hover:bg-rose-500/20 hover:text-rose-400 hover:rotate-90"><XCircle size={24}/></button>
        </div>
        
        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm"><div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Network State</div><div className="mt-3"><Badge status={m.status === 'RECALLED' ? 'RECALLED' : m.authenticityStatus}/></div></div>
          <div className="rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm"><div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Asset Volume</div><div className="mt-2 text-xl font-black text-white">{m.quantity} <span className="text-sm font-medium text-slate-400">units</span></div></div>
          <div className="rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm"><div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Current Custody</div><div className="mt-2 truncate text-lg font-black text-white">{m.currentCustodian}</div></div>
          <div className="rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm"><div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Geolocation</div><div className="mt-2 truncate text-lg font-black text-white">{m.manufacturingLocation}</div></div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Action title="Cryptographic Verify" icon={ClipboardCheck} tone="emerald" onSubmit={onVerify} busy={busy}>
            {isScanningVerify ? (
              <div className="mb-3 w-full overflow-hidden rounded-xl border-2 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <Scanner 
                  onScan={(result) => {
                    if (!result) return;
                    const scannedText = Array.isArray(result) ? result[0].rawValue : (result.text || result);
                    try {
                      const data = JSON.parse(scannedText);
                      setVerifyForm({...verifyForm, scannedCode: data.secretCode || scannedText});
                    } catch (e) {
                      setVerifyForm({...verifyForm, scannedCode: scannedText});
                    }
                    setIsScanningVerify(false);
                    toast.success("Payload Captured!");
                  }} 
                  onError={(error) => console.log(error)} 
                />
                <button type="button" onClick={() => setIsScanningVerify(false)} className="w-full bg-rose-500/20 py-2 text-xs font-bold uppercase tracking-widest text-rose-400 hover:bg-rose-500/30">Abort Scan</button>
              </div>
            ) : (
              <button type="button" onClick={() => setIsScanningVerify(true)} className="mb-3 w-full rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-3 text-xs font-bold uppercase tracking-widest text-emerald-400 shadow-inner transition-all hover:bg-emerald-500/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                📷 Optical Scan
              </button>
            )}
            <input type="password" value={verifyForm.scannedCode} onChange={e=>setVerifyForm({...verifyForm, scannedCode:e.target.value})} onPaste={e => e.preventDefault()} readOnly placeholder="Secret Hash Payload (Scan Only)" />
            <input value={verifyForm.verifier} onChange={e=>setVerifyForm({...verifyForm, verifier:e.target.value})} placeholder="Verifier Identity"/>
            <input value={verifyForm.location} onChange={e=>setVerifyForm({...verifyForm, location:e.target.value})} placeholder="Geo-Location"/>
          </Action>

          <Action title="Transfer Custody" icon={Truck} tone="cyan" onSubmit={onTransfer} busy={busy}>
            {isScanningTransfer ? (
              <div className="mb-3 w-full overflow-hidden rounded-xl border-2 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                <Scanner 
                  onScan={(result) => {
                    if (!result) return;
                    const scannedText = Array.isArray(result) ? result[0].rawValue : (result.text || result);
                    try {
                      const data = JSON.parse(scannedText);
                      setTransferForm({...transferForm, scannedCode: data.secretCode || scannedText});
                    } catch (e) {
                      setTransferForm({...transferForm, scannedCode: scannedText});
                    }
                    setIsScanningTransfer(false);
                    toast.success("Auth Payload Captured!");
                  }} 
                  onError={(error) => console.log(error)} 
                />
                <button type="button" onClick={() => setIsScanningTransfer(false)} className="w-full bg-rose-500/20 py-2 text-xs font-bold uppercase tracking-widest text-rose-400 hover:bg-rose-500/30">Abort Scan</button>
              </div>
            ) : (
              <button type="button" onClick={() => setIsScanningTransfer(true)} className="mb-3 w-full rounded-xl border border-cyan-500/30 bg-cyan-500/10 py-3 text-xs font-bold uppercase tracking-widest text-cyan-400 shadow-inner transition-all hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                📷 Optical Scan
              </button>
            )}
            <input type="password" value={transferForm.scannedCode} onChange={e=>setTransferForm({...transferForm, scannedCode:e.target.value})} onPaste={e => e.preventDefault()} readOnly placeholder="Secret Hash Payload (Scan Only)" />
            <input value={transferForm.newCustodian} onChange={e=>setTransferForm({...transferForm, newCustodian:e.target.value})} placeholder="Receiving Entity"/>
            <select value={transferForm.newRole} onChange={e=>setTransferForm({...transferForm, newRole:e.target.value})}>{roles.map(r=><option key={r}>{r}</option>)}</select>
          </Action>

          <Action title="Burn / Recall Asset" icon={AlertTriangle} tone="rose" onSubmit={onRecall} busy={busy}>
            {isScanningRecall ? (
              <div className="mb-3 w-full overflow-hidden rounded-xl border-2 border-rose-500/50 shadow-[0_0_20px_rgba(225,29,72,0.2)]">
                <Scanner 
                  onScan={(result) => {
                    if (!result) return;
                    const scannedText = Array.isArray(result) ? result[0].rawValue : (result.text || result);
                    try {
                      const data = JSON.parse(scannedText);
                      setRecallForm({...recallForm, scannedCode: data.secretCode || scannedText});
                    } catch (e) {
                      setRecallForm({...recallForm, scannedCode: scannedText});
                    }
                    setIsScanningRecall(false);
                    toast.success("Auth Payload Captured!");
                  }} 
                  onError={(error) => console.log(error)} 
                />
                <button type="button" onClick={() => setIsScanningRecall(false)} className="w-full bg-rose-500/20 py-2 text-xs font-bold uppercase tracking-widest text-rose-400 hover:bg-rose-500/30">Abort Scan</button>
              </div>
            ) : (
               <button type="button" onClick={() => setIsScanningRecall(true)} className="mb-3 w-full rounded-xl border border-rose-500/30 bg-rose-500/10 py-3 text-xs font-bold uppercase tracking-widest text-rose-400 shadow-inner transition-all hover:bg-rose-500/20 hover:shadow-[0_0_15px_rgba(225,29,72,0.3)]">
                📷 Optical Scan
              </button>
            )}
            <input type="password" value={recallForm.scannedCode} onChange={e=>setRecallForm({...recallForm, scannedCode:e.target.value})} onPaste={e => e.preventDefault()} readOnly placeholder="Secret Hash Payload (Scan Only)" />
            <input value={recallForm.reason} onChange={e=>setRecallForm({...recallForm, reason:e.target.value})} placeholder="Burn Rationale"/>
            <input value={recallForm.recalledBy} onChange={e=>setRecallForm({...recallForm, recalledBy:e.target.value})} placeholder={`Authority (${m.manufacturer})`}/>
          </Action>
        </div>

        <div className="mt-8 rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-md">
          <div className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-cyan-400">
            <Activity size={16}/> Supply Chain Custody Trail
          </div>
          {(m.custodyHistory || []).length ? m.custodyHistory.slice().reverse().map((c, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-white/10 py-3 gap-2 hover:bg-white/5 transition-colors px-2 -mx-2 rounded">
              <span className="text-[11px] font-bold uppercase tracking-widest px-2 py-1 rounded inline-block w-fit bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                {c.role}
              </span>
              <span className="text-xs font-medium text-slate-400 text-right">
                <span className="text-white font-bold">{c.to}</span>
                {c.from !== 'ORIGIN' && <span className="text-slate-500"> (from {c.from})</span>}
                <span className="text-white/20 mx-2">|</span> 
                {new Date(c.timestamp).toLocaleString()}
              </span>
            </div>
          )) : <p className="text-sm font-medium text-slate-500 italic">No custody transfers recorded on ledger.</p>}
        </div>
      </motion.div>
    </div>
  ); 
}

function Action({ title, icon: Icon, tone, children, onSubmit, busy }) { 
  const tones = {
    emerald: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    cyan: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5',
    rose: 'text-rose-400 border-rose-500/20 bg-rose-500/5',
  };

  return (
    <form onSubmit={e=>{e.preventDefault(); onSubmit();}} className="relative flex flex-col rounded-3xl border border-white/10 bg-[#060c18] p-5 shadow-xl transition-all hover:border-white/20 hover:bg-white/5">
      <div className={`mb-5 flex items-center gap-3 border-b border-white/10 pb-4 text-xs font-black uppercase tracking-widest ${tones[tone].split(' ')[0]}`}>
        <div className={`rounded-xl p-2 border ${tones[tone]}`}><Icon size={18}/></div> {title}
      </div>
      <div className="flex-1 space-y-3">
        {React.Children.map(children, child => {
          if (!child) return null;
          if (child.type === 'input' || child.type === 'select') {
            return React.cloneElement(child, { className: 'w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 placeholder:text-slate-600 transition-all shadow-inner ' + (child.props.className || ''), required: true });
          }
          return child;
        })}
      </div>
      <motion.button 
        whileHover={{ scale: 1.02 }} 
        whileTap={{ scale: 0.98 }}
        disabled={busy} 
        className={`mt-5 w-full rounded-xl border py-3.5 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 ${
          tone === 'emerald' ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]' :
          tone === 'rose' ? 'border-rose-500/50 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 hover:shadow-[0_0_20px_rgba(225,29,72,0.3)]' :
          'border-cyan-500/50 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]'
        }`}
      >
        Sign & Execute
      </motion.button>
    </form>
  ); 
}