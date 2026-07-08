import { SecurityLog } from "../models/securityLogModel.js";


export const logSecurityEvent = async (adminId, adminName, action, details, req) => {
  try {
    let ipAddress = "unknown";
    let userAgent = "unknown";

    if (req) {
      ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
      // Normalize IPv6 localhost
      if (ipAddress === "::1" || ipAddress === "::ffff:127.0.0.1") {
        ipAddress = "127.0.0.1";
      }
      userAgent = req.headers["user-agent"] || "unknown";
    }

    await SecurityLog.create({
      adminId,
      adminName,
      action,
      details,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error("Error logging security event:", error);
  }
};
