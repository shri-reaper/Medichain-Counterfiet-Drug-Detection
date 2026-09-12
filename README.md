# 🌱 AgriChain — Blockchain-Based Agricultural Supply Chain

AgriChain is a blockchain-based agricultural supply chain tracking system built using **Hyperledger Fabric**.

It provides transparent and tamper-resistant tracking of agricultural batches from the farmer through the complete supply chain while maintaining an immutable record of custody and storage conditions.

## 🚀 Key Features

- 📦 Agricultural batch creation and tracking
- 🔗 Hyperledger Fabric blockchain ledger
- 👨‍🌾 Farmer → Transporter → Distributor → Retailer custody tracking
- 🔐 Immutable custody history
- 🌡️ Storage temperature and humidity monitoring
- 📊 Immutable storage telemetry audit trail
- ⚠️ Automatic storage condition status
- 🖥️ React-based dashboard
- ⚙️ Node.js + Express backend
- ⛓️ JavaScript chaincode
- 🔄 REST API integration with Fabric

## 🏗️ Architecture

```text
React Frontend
      │
      ▼
Node.js / Express Backend
      │
      ▼
Hyperledger Fabric Gateway
      │
      ▼
AgriChain Chaincode
      │
      ▼
Hyperledger Fabric Network
      │
      ▼
Immutable Distributed Ledger
📁 Project Structure
agrichain/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── fabric/
│   │   ├── middleware/
│   │   └── routes/
│   └── package.json
│
├── chaincode-javascript/
│   ├── lib/
│   │   └── assetTransfer.js
│   ├── index.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   └── utils/
    └── package.json
⛓️ Supply Chain Flow
FARMER
   ↓
TRANSPORTER
   ↓
DISTRIBUTOR
   ↓
RETAILER

Every custody transfer is recorded on the blockchain with:

Previous custodian
New custodian
Supply-chain role
Transaction timestamp
🌡️ Storage Telemetry

Storage condition updates are recorded as immutable telemetry events containing:

Temperature
Humidity
Storage status
Transaction timestamp

This creates an auditable history of storage conditions for every agricultural batch.

🧪 Example Batch
Batch: B002
Crop: Alphonso Mango

Farmer_Ramesh
      ↓
Transporter_Speedy
      ↓
Central_Distributors
      ↓
Metro_Supermarket

The complete custody history is maintained on the Fabric ledger.

🛠️ Technologies
Hyperledger Fabric
JavaScript Chaincode
Node.js
Express.js
React
Vite
REST APIs
Docker
Git / GitHub
▶️ Running the Project
Backend
cd backend
npm install
npm start
Frontend
cd frontend
npm install
npm run dev

The frontend runs on:

http://localhost:5173

The backend runs on:

http://localhost:3000
Hyperledger Fabric

The application is designed to run with the Hyperledger Fabric test network and the agrichannel channel.

Chaincode:

agrichain
🔒 Security

Sensitive files and generated Fabric material are excluded using .gitignore.

The repository does not contain:

.env files
node_modules
Private keys
Fabric MSP material
Generated certificates
📌 Project Status

Current implementation includes:

✅ Batch management
✅ Blockchain-backed storage
✅ Custody tracking
✅ Multi-stage supply-chain tracking
✅ Storage telemetry history
✅ REST API integration
✅ React dashboard
✅ End-to-end Fabric verification

AgriChain — Transparent. Traceable. Tamper-resistant.


Save:

**Ctrl + O → Enter → Ctrl + X**

Then run:

```bash
git add README.md
git commit -m "Add project README"
git push
