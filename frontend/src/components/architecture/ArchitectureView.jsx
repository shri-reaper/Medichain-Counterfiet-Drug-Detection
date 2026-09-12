import React, { useState } from 'react';
import {
  Network,
  Server,
  Cpu,
  Layers,
  Database,
  ArrowRight,
  ShieldCheck,
  Zap,
  RefreshCw,
  CheckCircle2,
  Lock,
  Code2,
  Terminal,
} from 'lucide-react';
import { checkHealth, getErrorMessage } from '../../api/batchApi';

export default function ArchitectureView() {
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthData, setHealthData] = useState(null);
  const [healthError, setHealthError] = useState(null);

  const handleTestHealth = async () => {
    try {
      setHealthLoading(true);
      setHealthError(null);
      const data = await checkHealth();
      setHealthData(data);
    } catch (err) {
      setHealthError(getErrorMessage(err));
    } finally {
      setHealthLoading(false);
    }
  };

  const architectureNodes = [
    {
      id: 'frontend',
      title: 'React Frontend',
      role: 'Client Interface',
      icon: Terminal,
      color: 'emerald',
      tech: 'React 18 + Vite + Tailwind',
      desc: 'Dispatches HTTP REST requests with sensor telemetry and batch metadata.',
    },
    {
      id: 'backend',
      title: 'Express Backend',
      role: 'API Middleware',
      icon: Server,
      color: 'cyan',
      tech: 'Node.js + Express (Port 3000)',
      desc: 'Validates inputs, connects to Fabric Gateway using Org1 MSP credentials.',
    },
    {
      id: 'gateway',
      title: 'Fabric Gateway',
      role: 'Client SDK',
      icon: Lock,
      color: 'purple',
      tech: '@hyperledger/fabric-gateway',
      desc: 'Manages gRPC transport, cryptographic identity, and peer endorsement discovery.',
    },
    {
      id: 'peer',
      title: 'Fabric Peer',
      role: 'Endorsing Node',
      icon: Cpu,
      color: 'blue',
      tech: 'peer0.org1.example.com',
      desc: 'Simulates smart contract transactions, signs endorsement proofs, commits valid blocks.',
    },
    {
      id: 'chaincode',
      title: 'agrichain Chaincode',
      role: 'Smart Contract',
      icon: Code2,
      color: 'amber',
      tech: 'fabric-contract-api (JS)',
      desc: 'Executes cold-chain threshold algorithms (2-8°C, 40-60% RH) on agrichannel.',
    },
    {
      id: 'ledger',
      title: 'Ledger & World State',
      role: 'Immutable Storage',
      icon: Database,
      color: 'emerald',
      tech: 'GoLevelDB + Block Store',
      desc: 'Cryptographically hashed immutable blockchain blocks with current state key-values.',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Network size={22} className="text-emerald-400" />
          Hyperledger Fabric Enterprise Architecture
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          End-to-end cryptographic pipeline: from React UI to Hyperledger Fabric distributed ledger
        </p>
      </div>

      {/* Visual Pipeline Flow */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Zap size={16} className="text-amber-400" />
            <span>Cryptographic Transaction Flow</span>
          </h3>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            Channel: agrichannel
          </span>
        </div>

        {/* Node Pipeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {architectureNodes.map((node, idx) => {
            const Icon = node.icon;
            return (
              <div
                key={node.id}
                className="relative rounded-xl border border-slate-800 bg-slate-950/70 p-4 flex flex-col justify-between transition-all hover:border-slate-750 hover:bg-slate-900"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-emerald-400 border border-slate-700">
                      <Icon size={16} />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                      Step {idx + 1}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white leading-snug">
                    {node.title}
                  </h4>
                  <p className="text-[10px] font-medium text-emerald-400/90 uppercase tracking-wide mt-0.5">
                    {node.role}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 mt-1">
                    {node.tech}
                  </p>
                </div>

                <p className="text-[11px] text-slate-400 mt-3 border-t border-slate-850 pt-2 leading-tight">
                  {node.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Pipeline Summary Text */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-4 text-xs text-slate-300 space-y-2">
          <p className="font-semibold text-white">How a transaction is committed:</p>
          <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
            <li>Frontend submits <code className="text-emerald-400 font-mono">POST /api/batches</code> or <code className="text-emerald-400 font-mono">PUT /api/batches/:batchId/storage</code> to the Express backend.</li>
            <li>Backend invokes <code className="text-slate-300 font-mono">contract.submitTransaction(...)</code> via Fabric Gateway.</li>
            <li>Fabric Gateway proposes the transaction to endorsing peers (<code className="text-slate-300 font-mono">peer0.org1.example.com</code>).</li>
            <li>The peer executes the JavaScript chaincode (<code className="text-slate-300 font-mono">agrichain</code>) and signs read/write set endorsements.</li>
            <li>Fabric Gateway broadcasts endorsed transaction to the Raft Ordering Service.</li>
            <li>Orderer packages transactions into blocks and distributes them to peers to commit into the state database (<code className="text-slate-300 font-mono">GoLevelDB</code>).</li>
          </ol>
        </div>
      </div>

      {/* Transaction Classification & Live Endpoint Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fabric API Mechanics */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Transaction Classification
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-emerald-400">submitTransaction()</span>
                <span className="text-[10px] uppercase font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded">
                  State Mutation
                </span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Invoked for <strong className="text-white">CreateBatch</strong> and <strong className="text-white">UpdateStorageConditions</strong>. Requires peer endorsements, consensus ordering, and block commitment.
              </p>
            </div>

            <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-cyan-400">evaluateTransaction()</span>
                <span className="text-[10px] uppercase font-bold text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded">
                  Query Only
                </span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Invoked for <strong className="text-white">GetAllBatches</strong> and <strong className="text-white">ReadBatch</strong>. Queries the local peer's world-state cache directly without ordering or fee overhead.
              </p>
            </div>
          </div>
        </div>

        {/* Live Backend & Fabric Ping Tester */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server size={18} className="text-cyan-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                Live Backend Telemetry Ping
              </h3>
            </div>
            <button
              onClick={handleTestHealth}
              disabled={healthLoading}
              className="flex items-center gap-1.5 rounded-xl bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 transition disabled:opacity-50"
            >
              <RefreshCw size={12} className={healthLoading ? 'animate-spin' : ''} />
              <span>Ping /api/health</span>
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Click above to probe the live connection between this React frontend and the Express backend running on <span className="font-mono text-slate-200">http://localhost:3000</span>.
          </p>

          {healthData && (
            <div className="rounded-xl border border-emerald-500/30 bg-slate-950 p-3.5 font-mono text-xs text-emerald-400">
              <div className="flex items-center gap-1.5 text-emerald-300 mb-2 font-semibold">
                <CheckCircle2 size={15} />
                <span>Backend Responsive</span>
              </div>
              <pre className="text-[11px] text-slate-300 overflow-x-auto">
                {JSON.stringify(healthData, null, 2)}
              </pre>
            </div>
          )}

          {healthError && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3.5 text-xs text-rose-300">
              <p className="font-bold">Ping Failed</p>
              <p className="text-[11px] mt-1 text-rose-200/80">{healthError}</p>
            </div>
          )}

          {!healthData && !healthError && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-center text-xs text-slate-400">
              Awaiting health check trigger...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
