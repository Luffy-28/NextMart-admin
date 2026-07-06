import mongoose from "mongoose";

const refundSchema = new mongoose.Schema(
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
    items: [
      {
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        image: { type: String },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    refundAmount: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    reasonDetail: {
      type: String,
      required: true,
    },
    refundStatus: {
      type: String,
      required: true,
    },
    adminNote: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    deliveredAt: {
      type: Date,
      required: true,
    },
    evidence: [{ type: String }],
    isApproved: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "pending",
    },
    reviewedAt: {
      type: Date,
      required: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true },
);

const Refund = mongoose.model("Refund", refundSchema);
export default Refund;
