<h1 align="center">Sui CLMM Backend</h1>

<p align="center">
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-green" />
  </a>
  <img src="https://img.shields.io/badge/status-educational-blue" />
  <img src="https://img.shields.io/badge/version-v0.1.0-blue" />
  <img src="https://img.shields.io/badge/PostgreSQL-Supabase-lightgrey" />
</p>

## ✨ Overview

This repository contains a NestJS backend and polling indexer for the Sui CLMM package on Sui Testnet.

Its purpose is intentionally narrow:

- poll Sui Testnet events emitted by the deployed CLMM package
- normalize selected CLMM events into Supabase PostgreSQL
- maintain latest pool and position snapshots
- persist swap activity as a historical transaction log
- expose REST and GraphQL APIs for frontend reads

The Sui Move package lives in [`sui-clmm-package`](https://github.com/hieutrinh02/sui-clmm-package).

## 📄 High-level Design

The backend follows a small indexing pipeline:

1. Connect to Sui Testnet using the configured `SUI_RPC_URL`
2. Poll the deployed package `events` module using `SUI_PACKAGE_ID`
3. Handle `PoolCreated`, `PositionMinted`, `PositionModified`, and `Swap`
4. Upsert latest pool and position state into Supabase PostgreSQL
5. Insert swap events as historical activity logs
6. Store the Sui event cursor in `sync_state`
7. Serve indexed data over REST, GraphQL, and Swagger

Current REST API surface:

- `GET /health`
- `GET /pools`
- `GET /pools/:poolId`
- `GET /pools/:poolId/positions`
- `GET /pools/:poolId/swaps`
- `GET /positions`
- `GET /positions?owner=0x...`
- `GET /positions/:positionId`

Current GraphQL API surface:

- `pools`
- `pool(id: String!)`
- `positions(owner: String, poolId: String)`
- `position(id: String!)`
- `swaps(poolId: String, sender: String)`

Current runtime characteristics:

- Node.js + TypeScript
- NestJS REST API
- NestJS GraphQL with Apollo
- Swagger documentation
- Supabase PostgreSQL storage
- polling-based Sui event indexer
- Docker-ready for Azure deployment

## 🛠 Run Locally

From within the backend folder:

Install dependencies:

```bash
pnpm install
```

Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL=postgresql://...
SUI_RPC_URL=https://fullnode.testnet.sui.io:443
SUI_PACKAGE_ID=0x714b99313c8d3ea296824915563ece711cf8c981c9cc93bb65550afe43ddb2d6
```

Create the Supabase PostgreSQL schema by running `database/schema.sql` in the Supabase SQL Editor.

Run in development mode:

```bash
pnpm start:dev
```

Build and run the compiled output:

```bash
pnpm build
pnpm start:prod
```

Useful local endpoints:

- `http://localhost:3000/health`
- `http://localhost:3000/pools`
- `http://localhost:3000/positions`
- `http://localhost:3000/docs`
- `http://localhost:3000/graphql`

## ⚠️ Disclaimer

This code is for educational and portfolio purposes only, has not been audited, and is provided without any warranties or guarantees.

## 📜 License

This backend project is licensed under the MIT License.
