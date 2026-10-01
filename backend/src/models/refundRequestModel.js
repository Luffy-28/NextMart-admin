import mongoose from "mongoose";

// A refund request is created by the customer when they cancel or return an order.
// The admin then reviews it and issues a full or partial refund.
const refundRequestSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // "cancel" = order not yet shipped, "return" = item already arrived
    type: {
      type: String,
      enum: ["cancel", "return"],
      required: true,
    },

    // Reason the customer gave
    reason: {
      type: String,
      required: true,
      trim: true,
    },

    // Photos uploaded by customer (required for returns, optional for cancels)
    images: [
      {
        type: String, // URL strings
      },
    ],

    // pending → admin reviews, approved → full refund issued,
    // partial → partial refund issued, rejected → denied
    status: {
      type: String,
      enum: ["pending", "approved", "partial", "rejected"],
      default: "pending",
    },

    // Amount to refund — set by admin (full = order.totalAmount, partial = less)
    refundAmount: {
      type: Number,
      default: 0,
    },

    // Admin's note explaining the decision
    adminNote: {
      type: String,
    },

    // Stripe refund ID — stored once refund is issued via Stripe API
    stripeRefundId: {
      type: String,
    },

    // When admin made the decision
    resolvedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const RefundRequest = mongoose.model("RefundRequest", refundRequestSchema);
