import Stripe from "stripe";
import { RefundRequest } from "../models/refundRequestModel.js";
import { Order } from "../models/orderModel.js";
import { config } from "../config/config.js";
import { sendRefundEmail } from "../helpers/emailHelper.js";

const stripe = new Stripe(config.stripe.secretKey);

/* ─────────────────────────────────────────────────────────────────
  GET /api/v1/refunds
  Returns all refund requests — filterable by status
  Query: status=pending|approved|partial|rejected, page, limit
───────────────────────────────────────────────────────────────────*/
export const getAllRefundRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const pageNum  = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (status && ["pending", "approved", "partial", "rejected"].includes(status)) {
      filter.status = status;
    }

    const [requests, total] = await Promise.all([
      RefundRequest.find(filter)
        .populate("user", "name email")
        .populate({
          path: "order",
          select: "orderNumber totalAmount orderStatus paymentIntentId paymentStatus paymentMethod items deliveredAt cancelledAt createdAt",
        })
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 }),
      RefundRequest.countDocuments(filter),
    ]);

    // Counts for tab badges
    const [pendingCount, approvedCount, partialCount, rejectedCount] = await Promise.all([
      RefundRequest.countDocuments({ status: "pending" }),
      RefundRequest.countDocuments({ status: "approved" }),
      RefundRequest.countDocuments({ status: "partial" }),
      RefundRequest.countDocuments({ status: "rejected" }),
    ]);

    return res.status(200).send({
      status: "success",
      message: "Refund requests fetched",
      data: requests,
      counts: { pending: pendingCount, approved: approvedCount, partial: partialCount, rejected: rejectedCount },
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: "error", message: "Failed to fetch refund requests" });
  }
};

/* ─────────────────────────────────────────────────────────────────
  PATCH /api/v1/refunds/process/:requestId
  Admin approves with full or partial refund, or rejects.
  Body: { action: "approve"|"partial"|"reject", refundAmount?, adminNote? }

  For approve/partial:
    - Issues a Stripe refund using the order's paymentIntentId
    - Updates the order paymentStatus to "refunded"
    - Sends an email to the customer
───────────────────────────────────────────────────────────────────*/
export const processRefundRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action, refundAmount, adminNote = "" } = req.body;

    if (!["approve", "partial", "reject"].includes(action)) {
      return res.status(400).send({
        status: "error",
        message: "action must be 'approve', 'partial', or 'reject'",
      });
    }

    // Fetch the refund request with its linked order and user
    const refundRequest = await RefundRequest.findById(requestId)
      .populate("user", "name email")
      .populate("order", "orderNumber totalAmount paymentIntentId paymentStatus orderStatus");

    if (!refundRequest) {
      return res.status(404).send({ status: "error", message: "Refund request not found" });
    }

    if (refundRequest.status !== "pending") {
      return res.status(400).send({
        status: "error",
        message: `This request is already ${refundRequest.status}. Cannot process again.`,
      });
    }

    const order = refundRequest.order;

    if (action === "reject") {
      // ── REJECT ─────────────────────────────────────────────────
      refundRequest.status     = "rejected";
      refundRequest.adminNote  = adminNote;
      refundRequest.resolvedAt = new Date();
      await refundRequest.save();

      if (refundRequest.user?.email) {
        sendRefundEmail({
          customerEmail: refundRequest.user.email,
          customerName:  refundRequest.user.name,
          orderNumber:   order.orderNumber,
          action:        "rejected",
          adminNote,
        });
      }

      return res.status(200).send({
        status: "success",
        message: "Refund request rejected",
        data: refundRequest,
      });
    }

    // ── APPROVE or PARTIAL ──────────────────────────────────────
    const orderTotal = order.totalAmount;
    let amountToRefund;

    if (action === "approve") {
      amountToRefund = orderTotal; // full refund
    } else {
      amountToRefund = parseFloat(refundAmount);
      if (isNaN(amountToRefund) || amountToRefund <= 0) {
        return res.status(400).send({
          status: "error",
          message: "For partial refunds, provide a valid refundAmount greater than 0",
        });
      }
      if (amountToRefund > orderTotal) {
        return res.status(400).send({
          status: "error",
          message: `Refund amount cannot exceed the order total of $${orderTotal.toFixed(2)}`,
        });
      }
    }

    // Issue Stripe refund if payment was made online
    let stripeRefundId = null;
    if (order.paymentIntentId && order.paymentStatus === "paid") {
      try {
        const stripeRefund = await stripe.refunds.create({
          payment_intent: order.paymentIntentId,
          amount: Math.round(amountToRefund * 100), // Stripe uses cents
        });
        stripeRefundId = stripeRefund.id;
      } catch (stripeError) {
        console.error("Stripe refund error:", stripeError.message);
        return res.status(502).send({
          status: "error",
          message: `Stripe refund failed: ${stripeError.message}`,
        });
      }
    }

    // Update refund request
    refundRequest.status         = action === "approve" ? "approved" : "partial";
    refundRequest.refundAmount   = amountToRefund;
    refundRequest.adminNote      = adminNote;
    refundRequest.stripeRefundId = stripeRefundId;
    refundRequest.resolvedAt     = new Date();
    await refundRequest.save();

    // Update order payment status
    await Order.findByIdAndUpdate(order._id, { paymentStatus: "refunded" });

    // Notify customer via email
    if (refundRequest.user?.email) {
      sendRefundEmail({
        customerEmail: refundRequest.user.email,
        customerName:  refundRequest.user.name,
        orderNumber:   order.orderNumber,
        action:        refundRequest.status,
        refundAmount:  amountToRefund,
        adminNote,
      });
    }

    return res.status(200).send({
      status: "success",
      message: `Refund of $${amountToRefund.toFixed(2)} processed successfully`,
      data: refundRequest,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: "error", message: "Failed to process refund" });
  }
};
