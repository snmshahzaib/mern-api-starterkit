import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import request from "supertest";

import { requestId } from "../middlewares/requestId.middleware.js";
import { errorHandler } from "../middlewares/error.middleware.js";
import { ApiError } from "../utils/ApiError.js";

function createApp() {
  const app = express();
  app.use(requestId);
  app.get("/id", (req, res) => res.status(200).json({ id: req.id }));
  app.get("/boom", (req, _res, next) => next(new ApiError(400, "Bad request")));
  app.use(errorHandler);
  return app;
}

test("requestId sets and returns X-Request-Id", async () => {
  const app = createApp();
  const res = await request(app).get("/id");

  assert.equal(res.status, 200);
  assert.ok(typeof res.headers["x-request-id"] === "string");
  assert.equal(res.body.id, res.headers["x-request-id"]);
});

test("requestId honors incoming X-Request-Id", async () => {
  const app = createApp();
  const res = await request(app).get("/id").set("X-Request-Id", "req-123");

  assert.equal(res.status, 200);
  assert.equal(res.headers["x-request-id"], "req-123");
  assert.equal(res.body.id, "req-123");
});

test("error responses include requestId when middleware is used", async () => {
  const app = createApp();
  const res = await request(app).get("/boom").set("X-Request-Id", "req-err-1");

  assert.equal(res.status, 400);
  assert.equal(res.body.code, 400);
  assert.equal(res.body.requestId, "req-err-1");
});

