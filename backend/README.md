# AGRICHAIN Backend API

Backend REST API for **AGRICHAIN** built with Node.js, Express, and the official Hyperledger Fabric Gateway SDK (`@hyperledger/fabric-gateway`).

---

## Architecture Overview

The backend acts as an intermediary between client applications / frontends and the Hyperledger Fabric blockchain network.

```
+------------------+         HTTP / JSON         +-----------------------+
|  Frontend / App  |  ------------------------>  |  AGRICHAIN Express    |
|     (Client)     |  <------------------------  |     Backend API       |
+------------------+                             +-----------------------+
                                                             |
                                                             | gRPC (TLS)
                                                             v
                                                 +-----------------------+
                                                 |  Fabric Gateway Peer  |
                                                 | (peer0.org1...:7051)  |
                                                 +-----------------------+
                                                             |
                                                             v
                                                 +-----------------------+
                                                 | Channel: agrichannel  |
                                                 | Chaincode: agrichain  |
                                                 +-----------------------+
```

### How It Connects to Fabric:
1. **Fabric Gateway API (`@hyperledger/fabric-gateway`)**: Modern Fabric 2.5+ client library connecting to the Gateway peer endpoint.
2. **Identity**: Uses the **Org1 Admin** X.509 certificate and ECDSA private key located in the Fabric test-network crypto store (`test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp`).
3. **Mutual TLS**: Connects to `peer0.org1.example.com` (port `7051`) using the peer's TLS CA certificate (`ca.crt`) and hostname override.
4. **Channel & Contract**: Interacts with the `agrichain` smart contract deployed on the `agrichannel` channel.

---

## Prerequisites

- Node.js (v18 or v20+)
- Running Hyperledger Fabric network with `agrichannel` and `agrichain` chaincode deployed.

---

## Installation

Navigate to the backend directory and install dependencies (**do not use sudo**):

```bash
cd ~/fabric-samples/agrichain/backend
npm install
```

---

## Environment Variables

Configuration is loaded from `.env`. A default `.env` is already configured for this environment.

| Variable | Description | Default Value |
|---|---|---|
| `PORT` | HTTP port for the Express backend | `3000` |
| `CHANNEL_NAME` | Fabric channel name | `agrichannel` |
| `CHAINCODE_NAME` | Deployed chaincode name | `agrichain` |
| `MSP_ID` | Membership Service Provider ID | `Org1MSP` |
| `CRYPTO_PATH` | Path to Org1 crypto material | `/home/praveen/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com` |
| `KEY_DIRECTORY_PATH` | Path to Admin private keystore | `.../users/Admin@org1.example.com/msp/keystore` |
| `CERT_DIRECTORY_PATH` | Path to Admin signcerts | `.../users/Admin@org1.example.com/msp/signcerts` |
| `TLS_CERT_PATH` | Path to Peer TLS root CA cert | `.../peers/peer0.org1.example.com/tls/ca.crt` |
| `PEER_ENDPOINT` | Gateway peer gRPC address | `localhost:7051` |
| `PEER_HOST_ALIAS` | Peer TLS certificate hostname | `peer0.org1.example.com` |

To override any settings, edit `.env` or set environment variables before starting the application.

---

## Starting the Backend

### Production Mode:
```bash
npm start
```

### Development Mode (auto-reloads on code changes):
```bash
npm run dev
```

---

## API Endpoints & Examples

### 1. Health Check

Checks if the Express backend is running.

- **Method**: `GET`
- **Path**: `/api/health`

**Example Request:**
```bash
curl -s http://localhost:3000/api/health
```

**Example Response:**
```json
{
  "status": "UP",
  "message": "AgriChain backend is running",
  "timestamp": "2026-09-12T10:30:00.000Z"
}
```

---

### 2. Create a Batch

Creates a new agricultural batch on the blockchain ledger.

- **Method**: `POST`
- **Path**: `/api/batches`
- **Content-Type**: `application/json`

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/batches \
  -H "Content-Type: application/json" \
  -d '{
    "batchId": "B002",
    "crop": "Rice",
    "farmer": "Farmer_B",
    "location": "Chennai",
    "quantity": 200
  }'
```

**Example Response (HTTP 201):**
```json
{
  "batchId": "B002",
  "crop": "Rice",
  "farmer": "Farmer_B",
  "location": "Chennai",
  "quantity": 200,
  "temperature": 0,
  "humidity": 0,
  "storageStatus": "NOT_MONITORED",
  "createdAt": "2026-09-12T10:31:00.000Z"
}
```

---

### 3. Read Batch by ID

Retrieves details of a specific batch from the ledger.

- **Method**: `GET`
- **Path**: `/api/batches/:batchId`

**Example Request:**
```bash
curl -s http://localhost:3000/api/batches/B001
```

**Example Response (HTTP 200):**
```json
{
  "batchId": "B001",
  "crop": "Tomato",
  "farmer": "Farmer_A",
  "location": "Chennai",
  "quantity": 100,
  "temperature": 5,
  "humidity": 50,
  "storageStatus": "SAFE",
  "createdAt": "2026-09-12T04:47:25.687Z"
}
```

---

### 4. Get All Batches

Retrieves all batches stored in the blockchain state database.

- **Method**: `GET`
- **Path**: `/api/batches`

**Example Request:**
```bash
curl -s http://localhost:3000/api/batches
```

**Example Response (HTTP 200):**
```json
[
  {
    "batchId": "B001",
    "crop": "Tomato",
    "farmer": "Farmer_A",
    "location": "Chennai",
    "quantity": 100,
    "temperature": 5,
    "humidity": 50,
    "storageStatus": "SAFE",
    "createdAt": "2026-09-12T04:47:25.687Z"
  },
  {
    "batchId": "B002",
    "crop": "Rice",
    "farmer": "Farmer_B",
    "location": "Chennai",
    "quantity": 200,
    "temperature": 0,
    "humidity": 0,
    "storageStatus": "NOT_MONITORED",
    "createdAt": "2026-09-12T10:31:00.000Z"
  }
]
```

---

### 5. Update Storage Conditions

Submits sensor readings (temperature and humidity) to update the batch storage status on the ledger.
- `storageStatus` becomes `SAFE` when `temperature >= 2 && temperature <= 8` and `humidity >= 40 && humidity <= 60`.
- Otherwise `storageStatus` becomes `CONDITION_FAILED`.

- **Method**: `PUT`
- **Path**: `/api/batches/:batchId/storage`
- **Content-Type**: `application/json`

**Example Request:**
```bash
curl -X PUT http://localhost:3000/api/batches/B002/storage \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 5,
    "humidity": 50
  }'
```

**Example Response (HTTP 200):**
```json
{
  "batchId": "B002",
  "crop": "Rice",
  "farmer": "Farmer_B",
  "location": "Chennai",
  "quantity": 200,
  "temperature": 5,
  "humidity": 50,
  "storageStatus": "SAFE",
  "createdAt": "2026-09-12T10:31:00.000Z"
}
```

---

## Error Handling

The API returns standard HTTP status codes and structured JSON errors:

- `400 Bad Request`: Validation failure (missing required fields, non-numeric values).
- `404 Not Found`: Batch does not exist.
- `409 Conflict`: Batch already exists.
- `500 Internal Server Error`: Blockchain connection or runtime error.

**Error Response Format:**
```json
{
  "error": "Batch B002 already exists"
}
```
