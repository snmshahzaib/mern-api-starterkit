# MERN Starter Kit (Backend)

This repository currently contains a production-hardened Express + MongoDB backend (frontend not included yet).

## Tech

- Node.js (tested on `v24.9.0`)
- Express (REST API)
- MongoDB + Mongoose
- JWT auth (Bearer tokens)
- Joi validation (env + request validation)
- Winston logging
- Rate limiting (Redis-backed in production)

## Features

- Auth
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me` (requires `Authorization: Bearer <token>`)
- Users (requires auth)
  - `POST /api/users` (admin)
  - `GET /api/users` (admin) + pagination/search
  - `GET /api/users/:id` (self or admin)
  - `PATCH /api/users/:id` (self or admin; non-admin cannot change `role`/`isActive`)
  - `DELETE /api/users/:id` (admin)
- Health
  - `GET /health`

## Security / Hardening

- Security headers via `helmet`
- CORS allowlist via `CORS_ORIGIN`
- Body size limit via `JSON_BODY_LIMIT`
- NoSQL injection hardening via `express-mongo-sanitize`
- Parameter pollution protection via `hpp`
- Gzip compression via `compression`
- Request correlation via `X-Request-Id` (added to logs + error responses)
- Rate limiting
  - Global `/api` limiter (`API_RATE_LIMIT_*`)
  - Auth limiter for login/register (`AUTH_RATE_LIMIT_*`)
  - Store is `memory` in dev by default and `redis` in production by default

## Setup

1) Install dependencies

```bash
npm -C backend install
```

2) Configure environment

- Copy `backend/.env.example` to `backend/.env` and adjust values.

3) Start services

- Start MongoDB (local or hosted)
- Start Redis (recommended for production rate limiting)

Example Redis (Docker):

```bash
docker run --rm -p 6379:6379 redis:7-alpine
```

4) Run the backend

```bash
npm -C backend run dev
```

Server starts on `PORT` (default `5001`).

## Environment Variables

See `backend/.env.example` for the full list. Common ones:

- `NODE_ENV`: `development` | `test` | `production`
- `PORT`
- `MONGODB_URI` (required in production)
- `JWT_SECRET` (required + must be changed in production)
- `JWT_EXPIRES_IN` (e.g. `7d`)
- `CORS_ORIGIN` (comma-separated allowlist; required in production)
- `TRUST_PROXY` (set appropriately behind a proxy / load balancer)
- `RATE_LIMIT_STORE`: `auto` | `memory` | `redis`
- `REDIS_URL` (required when using Redis rate limit store)
- `API_RATE_LIMIT_WINDOW_MS`, `API_RATE_LIMIT_MAX`
- `AUTH_RATE_LIMIT_WINDOW_MS`, `AUTH_RATE_LIMIT_MAX`

## Admin Seeding

Creates or updates an admin user based on env vars:

```bash
npm -C backend run seed:admin
```

Uses:

- `ADMIN_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_FORCE_RESET_PASSWORD`

## Tests / Lint

```bash
npm -C backend run lint
npm -C backend test
```

## Project Structure (Backend)

```
backend/src/
  app.js                  # Express app + middleware
  server.js               # HTTP server + graceful shutdown
  config/                 # env/db/logger/redis
  features/               # feature modules (auth, users)
  middlewares/            # auth, validation, errors, rate limit, request id
  utils/                  # helpers (responses, tokens, pagination)
```

## Production Notes

- Use `RATE_LIMIT_STORE=redis` (or keep `auto` and set `REDIS_URL`) when running multiple instances.
- Set `TRUST_PROXY` correctly if behind a reverse proxy (otherwise IP-based rate limits may be incorrect).
- Rotate `JWT_SECRET` and keep it out of version control.

