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

export const signRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwtRefresh.secret, {
    expiresIn: config.jwtRefresh.expiresIn,
  });
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwtRefresh.secret);
};

