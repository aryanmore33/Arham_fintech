# Arham Fintech take-home

This repository contains the mock BSE service and the internal incentive portal. The portal is deliberately data-first: its UI only reads the local PostgreSQL projection, never BSE directly.


For an immediate presentation database, run `npm run seed:demo` from `backend`. It upserts 300 clients, 5,000 trades, 20 employees, and their mappings. Managers can use **Add live demo trade**: it inserts a new BSE trade, begins a sync, and every connected portal refreshes automatically when the sync is atomically promoted.


## Demo accounts and authorization

After the first successful sync, use password `password123` with `manager@arham.com` for the manager account or `rahul@arham.com` / `priya@arham.com` / (any email of employee from manager's dashboard)for employee accounts using same password as `password123`. The API enforces authorization server-side: managers can view every employee, mapped client, trade, brokerage total, and incentive; employees can only retrieve their own mapped clients, trades, and incentive. BSE refreshes are manager-only.

On a fresh database, the first manager login bootstraps `manager@arham.com` with password `password123`. In **All Employees**, the manager can add employee accounts and choose each employee's email and temporary password.

## Reliability design

The worker starts a BSE export job, then polls short status/page requests with a 25-second client timeout, retry/backoff, and pagination. This means the source may take ten minutes without holding any HTTP request open past the network limit. A worker stores every page under a unique sync run and promotes staging rows to the read model in one database transaction only after all client and trade pages arrive. Therefore a failed pull (including a mid-pull 503) leaves the previously complete portal snapshot untouched; upserts make retries idempotent. Screens query indexed local tables and are independent of BSE availability. The server broadcasts `data:updated` through Socket.IO after a successful promotion, so open screens refresh themselves.

## At 100× volume

Use a durable queue with one lease per source and a worker pool, partition trades by trade date, and bulk-load staged files using PostgreSQL `COPY`. Maintain date/client composite indexes and pre-aggregate incentives by employee/day rather than summing raw trades per request. Run the API and WebSocket nodes stateless behind a load balancer with a shared Socket.IO adapter. For a real ten-minute source extraction, make BSE expose a job/export handle and poll/download fixed-size pages; no single HTTP request is held for ten minutes.
