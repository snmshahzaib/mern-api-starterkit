import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import request from "supertest";

import { createAuthRouter } from "../features/auth/routes.js";
import { errorHandler } from "../middlewares/error.middleware.js";
import { createRateLimiter } from "../middlewares/rateLimit.middleware.js";

function createTestApp(router) {
  const app = express();
  app.use(express.json());
  app.use("/api/auth", router);
  app.use(errorHandler);
  return app;
}

test("POST /api/auth/register validates body", async () => {
  const handlers = {
    registerHandler: async (_req, res) => res.status(201).json({ ok: true }),
    loginHandler: async (_req, res) => res.status(200).json({ ok: true }),
    meHandler: async (_req, res) => res.status(200).json({ ok: true }),
  };

  const app = createTestApp(createAuthRouter({ handlers }));

  const res = await request(app).post("/api/auth/register").send({});
  assert.equal(res.status, 400);
  assert.equal(res.body?.code, 400);
});

test("POST /api/auth/register rate-limits repeated attempts", async () => {
  const handlers = {
    registerHandler: async (_req, res) => res.status(201).json({ ok: true }),
    loginHandler: async (_req, res) => res.status(200).json({ ok: true }),
    meHandler: async (_req, res) => res.status(200).json({ ok: true }),
  };

  const app = createTestApp(
    createAuthRouter({
      handlers,
      authLimiter: createRateLimiter({
        windowMs: 10_000,
        max: 2,
      }),
    }),
  );

  const payload = { name: "Test User", email: "test@example.com", password: "password123" };

  const r1 = await request(app).post("/api/auth/register").send(payload);
  const r2 = await request(app).post("/api/auth/register").send(payload);
  const r3 = await request(app).post("/api/auth/register").send(payload);

  assert.equal(r1.status, 201);
  assert.equal(r2.status, 201);
  assert.equal(r3.status, 429);
  assert.equal(r3.body?.code, 429);
});

test("GET /api/auth/me can be wired with injected auth middleware", async () => {
  const handlers = {
    registerHandler: async (_req, res) => res.status(201).json({ ok: true }),
    loginHandler: async (_req, res) => res.status(200).json({ ok: true }),
    meHandler: async (req, res) => res.status(200).json({ userId: req.user._id }),
  };

  const authRequired = (req, _res, next) => {
    req.user = { _id: "user123" };
    next();
  };

  const app = createTestApp(createAuthRouter({ handlers, authRequired }));

  const res = await request(app).get("/api/auth/me");
  assert.equal(res.status, 200);
  assert.equal(res.body?.userId, "user123");
});
