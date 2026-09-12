# AGRICHAIN — Modern React Frontend

AGRICHAIN is an enterprise-grade agricultural supply-chain tracking dashboard built with React, Vite, and Tailwind CSS. It connects seamlessly to the Hyperledger Fabric blockchain network via the Node.js / Express backend.

---

## Architecture Flow

```
┌─────────────────┐       HTTP / REST       ┌──────────────────────┐
│  React Frontend │ ──────────────────────> │ Node/Express Backend │
│ (Vite + Tailwind│ <────────────────────── │  (http://localhost:  │
│   Port: 5173)   │                         │        3000)         │
└─────────────────┘                         └──────────┬───────────┘
                                                       │ @hyperledger/fabric-gateway
                                                       ▼
                                            ┌──────────────────────┐
                                            │ Hyperledger Fabric   │
                                            │ Peer & agrichannel   │
                                            └──────────┬───────────┘
                                                       │ Smart Contract
                                                       ▼
                                            ┌──────────────────────┐
                                            │ agrichain Chaincode  │
                                            │ (World State Ledger) │
                                            └──────────────────────┘
```

---

## Features

1. **Dashboard**
   - Real-time key metrics: Total Batches, Safe Batches, Condition Failed Batches, Not Monitored Batches.
   - Cold-chain compliance threshold indicators (2°C – 8°C, 40% – 60% RH).
   - Recent batches ledger stream with instant actions.

2. **Batches Explorer**
   - View all produce batches stored in the Fabric World State.
   - Filter by status (`ALL`, `SAFE`, `CONDITION_FAILED`, `NOT_MONITORED`).
   - Real-time search across Batch ID, Crop, Farmer identity, and Origin Location.
   - Switchable Table and Card layouts.
   - Status badges with visual indicators.

3. **Batch Details & Cryptographic Audit Modal**
   - Live query of `GET /api/batches/:batchId`.
   - Full produce metadata, quantity, and registration timestamp.
   - Telemetry gauges with safe bounds highlighting.
   - Immutability proof showing channel (`agrichannel`), contract (`agrichain`), and state key.

4. **IoT Storage Telemetry Ingestion**
   - Direct submission of `PUT /api/batches/:batchId/storage`.
   - Dynamic real-time preview: simulates smart contract rules as you type temperature and humidity.
   - Instant ledger re-query and state update.

5. **Register New Batch**
   - Form for Batch ID, Crop, Farmer, Origin Location, and Quantity.
   - Dispatches `POST /api/batches` invoking `CreateBatch` on the Fabric ledger.

6. **Interactive Blockchain Architecture Explorer**
   - Visual step-by-step pipeline from Client UI to GoLevelDB ledger state.
   - Live interactive ping tester to check backend and gateway status (`GET /api/health`).
   - Clear distinction between `submitTransaction` (mutations) and `evaluateTransaction` (queries).

---

## Getting Started

### 1. Ensure Backend is Running
The Express backend must be running on port `3000`:
```bash
# In backend/
npm start
# or node src/server.js
```
Verify backend health:
```bash
curl http://localhost:3000/api/health
```

### 2. Start the Frontend

In the `frontend/` directory:

```bash
# Navigate to frontend
cd frontend

# Install dependencies (if not already installed)
npm install

# Start development server
npm run dev
```

Open your browser at:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## Environment Configuration

The frontend uses Vite environment variables defined in `.env`:

```env
# Backend API Base URL (default: http://localhost:3000)
VITE_API_URL=http://localhost:3000
```

---

## Production Build

To build an optimized production distribution:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```
