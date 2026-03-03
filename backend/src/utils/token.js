import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

export function signAccessToken(userId) {
  return jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}
