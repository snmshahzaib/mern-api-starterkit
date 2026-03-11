import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import request from "supertest";

import { createUsersRouter } from "../features/users/routes.js";
import { errorHandler } from "../middlewares/error.middleware.js";

function createTestApp(router) {
  const app = express();
  app.use(express.json());
  app.use("/api/users", router);
  app.use(errorHandler);
  return app;
}

const authRequired = (req, _res, next) => {
  req.user = { _id: "507f1f77bcf86cd799439011", role: "admin", id: "507f1f77bcf86cd799439011" };
  next();
};

const authorizeRoles = () => (_req, _res, next) => next();
const authorizeSelfOrAdmin = () => (_req, _res, next) => next();

test("POST /api/users validates required fields", async () => {
  const handlers = {
    createUserHandler: async (_req, res) => res.status(201).json({ ok: true }),
    getUsersHandler: async (_req, res) => res.status(200).json({ ok: true }),
    getUserByIdHandler: async (_req, res) => res.status(200).json({ ok: true }),
    updateUserHandler: async (_req, res) => res.status(200).json({ ok: true }),
    deleteUserHandler: async (_req, res) => res.status(200).json({ ok: true }),
  };

  const app = createTestApp(
    createUsersRouter({ handlers, authRequired, authorizeRoles, authorizeSelfOrAdmin }),
  );

  const res = await request(app).post("/api/users").send({ email: "a@b.com" });
  assert.equal(res.status, 400);
  assert.equal(res.body?.code, 400);
});

test("PATCH /api/users/:id rejects empty body", async () => {
  const handlers = {
    createUserHandler: async (_req, res) => res.status(201).json({ ok: true }),
    getUsersHandler: async (_req, res) => res.status(200).json({ ok: true }),
    getUserByIdHandler: async (_req, res) => res.status(200).json({ ok: true }),
    updateUserHandler: async (_req, res) => res.status(200).json({ ok: true }),
    deleteUserHandler: async (_req, res) => res.status(200).json({ ok: true }),
  };

  const app = createTestApp(
    createUsersRouter({ handlers, authRequired, authorizeRoles, authorizeSelfOrAdmin }),
  );

  const res = await request(app).patch("/api/users/507f1f77bcf86cd799439011").send({});
  assert.equal(res.status, 400);
  assert.equal(res.body?.code, 400);
});

test("GET /api/users/:id rejects invalid id param", async () => {
  const handlers = {
    createUserHandler: async (_req, res) => res.status(201).json({ ok: true }),
    getUsersHandler: async (_req, res) => res.status(200).json({ ok: true }),
    getUserByIdHandler: async (_req, res) => res.status(200).json({ ok: true }),
    updateUserHandler: async (_req, res) => res.status(200).json({ ok: true }),
    deleteUserHandler: async (_req, res) => res.status(200).json({ ok: true }),
  };

  const app = createTestApp(
    createUsersRouter({ handlers, authRequired, authorizeRoles, authorizeSelfOrAdmin }),
  );

  const res = await request(app).get("/api/users/not-an-objectid");
  assert.equal(res.status, 400);
  assert.equal(res.body?.code, 400);
});
