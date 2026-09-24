# MediChain Verify

MediChain Verify is a Hyperledger Fabric application for pharmaceutical traceability and counterfeit drug detection. It registers medicine batches, validates serialized product codes, tracks custody, and records recalls on an immutable distributed ledger.

## Features

- Medicine registration with manufacturer, batch, expiry, quantity, and verification code
- Genuine, counterfeit, and recalled product verification
- Immutable verification attempt history
- Manufacturer-to-pharmacy custody tracking
- Recall workflows for manufacturers and regulators
- React dashboard with medicine registry and verification actions
- Node.js and Express REST API
- JavaScript Hyperledger Fabric chaincode

## Project structure

```text
medichain/
├── backend/
│   └── src/
│       ├── config/
│       ├── controllers/medicineController.js
│       ├── fabric/
│       └── routes/medicineRoutes.js
├── chaincode-javascript/
│   ├── lib/medicineTraceability.js
│   └── index.js
└── frontend/
    └── src/
        ├── api/medicineApi.js
        └── App.jsx
```

## Smart-contract transactions

| Transaction | Description |
| --- | --- |
| `CreateMedicine` | Registers a medicine record and verification code |
| `VerifyMedicine` | Records a scan and returns `GENUINE` or `COUNTERFEIT_OR_RECALLED` |
| `TransferMedicine` | Adds a custody event and changes the current custodian |
| `RecallMedicine` | Marks a record as recalled with a reason and actor |
| `ReadMedicine` | Reads one medicine record |
| `GetAllMedicines` | Reads all medicine records |
| `GetVerificationHistory` | Reads all verification attempts |
| `GetCustodyHistory` | Reads all custody events |

## REST API

The backend serves these endpoints under `/api/medicines`:

- `POST /` — register a medicine
- `GET /` — list medicines
- `GET /:medicineId` — read a medicine
- `POST /:medicineId/verify` — verify a scanned code
- `POST /:medicineId/transfer` — transfer custody
- `POST /:medicineId/recall` — recall a medicine
- `GET /:medicineId/verification-history` — verification history
- `GET /:medicineId/custody-history` — custody history

## Run the application

Start the Fabric network and deploy the `medichain` chaincode to the `medichainchannel` channel. Configure the backend Fabric connection through `.env` or the environment variables described in `backend/src/config/fabric.config.js`.

```bash
cd backend
npm install
npm start
```

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend uses `http://localhost:3000` as the default API base URL. Override it with `VITE_API_URL` when required.

## Security note

Verification codes should be generated and issued by authorized pharmaceutical organizations and delivered through protected QR, NFC, or serialization workflows. Production deployments should add Fabric endorsement policies, access control, private data collections, key management, and secure code issuance.
