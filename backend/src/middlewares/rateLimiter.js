import rateLimit from "express-rate-limit";
import { config } from "../config/config.js";

export const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs || 15 * 60 * 1000, // default 15 min
  max: config.rateLimit.maxRequests || 20, // default 20 requests per window
  message: {
    status: "error",
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
