import { config } from "../config/config.js";
import jwt from "jsonwebtoken";

export const signToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};
