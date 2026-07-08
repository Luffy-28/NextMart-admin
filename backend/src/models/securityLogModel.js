import mongoose from "mongoose";

const securityLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    adminName: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true, // e.g. "Login Success", "Password Changed", "2FA Toggle", etc.
    },
    details: {
      type: String,
      default: "",
    },
    ipAddress: {
      type: String,
      default: "unknown",
    },
    userAgent: {
      type: String,
      default: "unknown",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // Custom timestamp field is used
  }
);

export const SecurityLog = mongoose.model("SecurityLog", securityLogSchema);
