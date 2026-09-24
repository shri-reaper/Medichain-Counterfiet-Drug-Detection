# MediChain Verify Frontend

React, Vite, and Tailwind frontend for the MediChain counterfeit drug detection ledger.

## Dashboard capabilities

- View registered medicine records and current custodians.
- Search by medicine ID, medicine name, manufacturer, batch number, or custodian.
- Register a new medicine batch with its serialized verification code.
- Submit a scan for on-chain genuine or counterfeit/recalled classification.
- Transfer custody between pharmaceutical supply-chain organizations.
- Commit recall decisions and review immutable verification history.

## Run locally

The backend should be running on port `3000` and connected to the `medichainchannel` Fabric channel.

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. Configure a different backend URL with `VITE_API_URL` in a `.env` file.

## Production build

```bash
npm run build
npm run preview
```
