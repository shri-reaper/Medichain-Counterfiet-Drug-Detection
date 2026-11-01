# MediChain Backend API

Express REST API that talks to the `MediChain.sol` contract on Ethereum Sepolia using `ethers` v6.

## Environment variables (see `.env.example`)

| Variable | Description |
| --- | --- |
| `PORT` | HTTP port (default `3000`) |
| `RPC_URL` | Sepolia JSON-RPC endpoint (default: free public node) |
| `CONTRACT_ADDRESS` | Deployed `MediChain` contract address |
| `PRIVATE_KEY` | Throwaway operator wallet key (needs a little Sepolia ETH) |
| `CODE_PEPPER` | Secret used to HMAC verification codes before they go on-chain. Never change it after registering medicines |

If any of the last three are missing the server still starts; `/api/health` reports `NOT_CONFIGURED` and the API returns 503.

## Endpoints

- `GET /api/health`
- `POST /api/medicines`, `GET /api/medicines`, `GET /api/medicines/:id`
- `POST /api/medicines/:id/verify`, `/transfer`, `/recall`
- `GET /api/medicines/:id/verification-history`, `/custody-history`

Write responses include `txHash` (viewable on https://sepolia.etherscan.io). If a built frontend exists in `../frontend/dist`, it is served from `/`.
