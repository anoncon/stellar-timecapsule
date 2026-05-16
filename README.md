# Stellar TimeCapsule

Stellar TimeCapsule is a minimal but polished Stellar MVP for sending time-locked digital gifts.

It includes:
- A React + Vite frontend with a premium capsule dashboard
- A Node.js + Express backend with JSON persistence
- A Soroban contract scaffold for future on-chain locking and claiming

## What it does

A creator seals a capsule with:
- recipient wallet address
- title and personal message
- asset code and amount
- unlock time

The recipient can open the capsule after the unlock time. Before then, the creator can cancel it.

## Architecture

Frontend (`frontend`, port `3000`)
- React + TypeScript + Vite
- Hero dashboard, capsule board, and detail panel

Backend (`backend`, port `3001`)
- Express REST API
- JSON file storage in `backend/data/capsules.json`
- Validation with Zod

Contract (`contracts`)
- Soroban Rust scaffold
- Models create, claim, cancel, and read capsule lifecycle

## API

- `GET /api/health`
- `GET /api/capsules`
- `GET /api/capsules/:id`
- `POST /api/capsules`
- `POST /api/capsules/:id/open`
- `POST /api/capsules/:id/cancel`

## Run locally

```bash
npm run install:all
npm run dev:backend
npm run dev:frontend
```

Open:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`

## Product direction

This is intentionally minimal so you can later add:
- Freighter wallet signing
- real Stellar asset transfers
- Soroban event indexing
- public share links for capsules
- themed capsule templates
