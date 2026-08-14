# Arham Fintech take-home

This repository contains the mock BSE service and the internal incentive portal. The portal is deliberately data-first: its UI only reads the local PostgreSQL projection, never BSE directly.

## Run locally

1. Start PostgreSQL and copy `backend/.env.example` to `backend/.env`, filling the `PG*` values. Do not commit database credentials.
2. In `mock-bse`, run `npm install` then `npm run dev` (default `http://localhost:4000`). Set `BSE_DELAY_MS=100` while developing; use `BSE_FAILURE_RATE=0.2` to exercise retries.
3. In `backend`, run `npm install`, `npm run migrate`, then `npm run dev` (default `http://localhost:3000`).
4. In `frontend`, run `npm install` then `npm run dev`. Open `http://localhost:5173`, click **Sync BSE**, and keep the portal open to see the WebSocket update when the sync completes.

The React portal URL is `http://localhost:5173`; the API is `http://localhost:3000`; the mock API is `http://localhost:4000`.

For an immediate presentation database, run `npm run seed:demo` from `backend`. It upserts 300 clients, 5,000 trades, 20 employees, and their mappings. Managers can use **Add live demo trade**: it inserts a new BSE trade, begins a sync, and every connected portal refreshes automatically when the sync is atomically promoted.

For a single deployed service, run `npm run build` in `frontend`; the backend detects `frontend/dist` and serves that React build at `http://localhost:3000`.

## API

* `GET /api/bse/clients?offset=0&limit=500`
* `GET /api/bse/trades?clientId=C001&from=2026-08-01&to=2026-08-31&offset=0&limit=500`
* `GET /api/internal/employees`, `GET /api/internal/mappings`
* Cached portal APIs are under `http://localhost:3000/api`; `POST /api/sync` begins a non-blocking BSE refresh.

## Demo accounts and authorization

After the first successful sync, use password `password123` with `manager@arham.com` for the manager account or `rahul@arham.com` / `priya@arham.com` for employee accounts. Login returns an 8-hour JWT. The API enforces authorization server-side: managers can view every employee, mapped client, trade, brokerage total, and incentive; employees can only retrieve their own mapped clients, trades, and incentive. BSE refreshes are manager-only.

On a fresh database, the first manager login bootstraps `manager@arham.com` with password `password123`. In **All Employees**, the manager can add employee accounts and choose each employee's email and temporary password. In a real deployment, set `BOOTSTRAP_MANAGER_EMAIL`, `BOOTSTRAP_MANAGER_PASSWORD`, and a strong `JWT_SECRET` as environment secrets before first startup.

## Reliability design

The worker starts a BSE export job, then polls short status/page requests with a 25-second client timeout, retry/backoff, and pagination. This means the source may take ten minutes without holding any HTTP request open past the network limit. A worker stores every page under a unique sync run and promotes staging rows to the read model in one database transaction only after all client and trade pages arrive. Therefore a failed pull (including a mid-pull 503) leaves the previously complete portal snapshot untouched; upserts make retries idempotent. Screens query indexed local tables and are independent of BSE availability. The server broadcasts `data:updated` through Socket.IO after a successful promotion, so open screens refresh themselves.

## At 100× volume

Use a durable queue with one lease per source and a worker pool, partition trades by trade date, and bulk-load staged files using PostgreSQL `COPY`. Maintain date/client composite indexes and pre-aggregate incentives by employee/day rather than summing raw trades per request. Run the API and WebSocket nodes stateless behind a load balancer with a shared Socket.IO adapter. For a real ten-minute source extraction, make BSE expose a job/export handle and poll/download fixed-size pages; no single HTTP request is held for ten minutes.
