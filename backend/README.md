# MediChain Backend API

Node.js and Express REST API for the MediChain counterfeit drug detection ledger. The service uses the Hyperledger Fabric Gateway SDK to submit and evaluate medicine traceability transactions.

## Configuration

Configuration is loaded from `.env` and `src/config/fabric.config.js`.

| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | HTTP server port | `3000` |
| `CHANNEL_NAME` | Fabric channel | `medichainchannel` |
| `CHAINCODE_NAME` | Deployed contract name | `medichain` |
| `MSP_ID` | Fabric organization MSP | `Org1MSP` |
| `CRYPTO_PATH` | Organization crypto material path | Fabric test-network path |
| `KEY_DIRECTORY_PATH` | Admin private key directory | Derived from `CRYPTO_PATH` |
| `CERT_DIRECTORY_PATH` | Admin certificate directory | Derived from `CRYPTO_PATH` |
| `TLS_CERT_PATH` | Peer TLS CA path | Derived from `CRYPTO_PATH` |
| `PEER_ENDPOINT` | Gateway gRPC endpoint | `localhost:7051` |
| `PEER_HOST_ALIAS` | TLS hostname override | `peer0.org1.example.com` |

## Start the service

```bash
npm install
npm start
```

Use `npm run dev` for Node watch mode.

## API endpoints

All medicine routes are under `/api/medicines`.

- `GET /api/health`
- `POST /api/medicines`
- `GET /api/medicines`
- `GET /api/medicines/:medicineId`
- `POST /api/medicines/:medicineId/verify`
- `POST /api/medicines/:medicineId/transfer`
- `POST /api/medicines/:medicineId/recall`
- `GET /api/medicines/:medicineId/verification-history`
- `GET /api/medicines/:medicineId/custody-history`

Example registration request:

```bash
curl -X POST http://localhost:3000/api/medicines \
  -H 'Content-Type: application/json' \
  -d '{
    "medicineId": "MED-2026-0001",
    "medicineName": "Amoxicillin 500mg",
    "manufacturer": "Acme Pharma Ltd.",
    "batchNumber": "AMX-26-091",
    "expiryDate": "2028-01-01",
    "manufacturingLocation": "Hyderabad, India",
    "quantity": 10000,
    "verificationCode": "QR-9F7K-2A1C"
  }'
```

Example verification request:

```bash
curl -X POST http://localhost:3000/api/medicines/MED-2026-0001/verify \
  -H 'Content-Type: application/json' \
  -d '{
    "scannedCode": "QR-9F7K-2A1C",
    "verifier": "Central Pharmacy",
    "location": "Pune"
  }'
```

A successful match returns `GENUINE`; an incorrect code or recalled record returns `COUNTERFEIT_OR_RECALLED` and is retained in the verification history.
