import nodemailer from "nodemailer";
import { config } from "../config/config.js";

// Create the mail transporter once and reuse it
const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.secure,
  auth: {
    user: config.smtp.auth.user,
    pass: config.smtp.auth.pass,
  },
});

// Human-readable label and icon for each order status
const STATUS_INFO = {
  confirmed: {
    label: "Order Confirmed",
    icon: "✅",
    color: "#16a34a",
    message: "Great news! Your order has been confirmed and is being prepared.",
  },
  processing: {
    label: "Order Processing",
    icon: "⚙️",
    color: "#d97706",
    message: "Your order is currently being packed and processed at our warehouse.",
  },
  shipped: {
    label: "Order Shipped",
    icon: "🚚",
    color: "#2563eb",
    message: "Your order is on its way! It has been handed over to the courier.",
  },
  delivered: {
    label: "Order Delivered",
    icon: "📦",
    color: "#16a34a",
    message: "Your order has been delivered successfully. Enjoy your purchase!",
  },
  cancelled: {
    label: "Order Cancelled",
    icon: "❌",
    color: "#dc2626",
    message: "Your order has been cancelled. If you paid, a refund will be processed shortly.",
  },
  returned: {
    label: "Return Processed",
    icon: "↩️",
    color: "#7c3aed",
    message: "Your return has been processed. We will update you once the refund is issued.",
  },
};

/**
 * Send an order status update email to the customer.
 *
 * @param {object} options
 * @param {string} options.customerEmail  - Customer email address
 * @param {string} options.customerName   - Customer name
 * @param {string} options.orderNumber    - e.g. "ORD-94821"
 * @param {string} options.newStatus      - The new order status
 */
export const sendOrderStatusEmail = async ({ customerEmail, customerName, orderNumber, newStatus }) => {
  const info = STATUS_INFO[newStatus];

  // If the status has no email template (e.g. "pending"), skip silently
  if (!info) return;

  const mailOptions = {
    from: `"${config.appName || "NextMart"}" <${config.smtp.auth.user}>`,
    to: customerEmail,
    subject: `${info.icon} ${info.label} — ${orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .wrapper { background: #f4f4f4; padding: 40px 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; }
          .header { background: ${info.color}; color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .header p  { margin: 8px 0 0; font-size: 14px; opacity: 0.9; }
          .body   { padding: 30px; }
          .order-box { background: #f9f9f9; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 20px; margin: 20px 0; }
          .order-box p { margin: 0; font-size: 14px; color: #6b7280; }
          .order-box h2 { margin: 4px 0 0; font-size: 22px; color: #111827; }
          .status-badge { display: inline-block; background: ${info.color}; color: #fff; padding: 6px 16px; border-radius: 99px; font-size: 13px; font-weight: 700; }
          .footer { text-align: center; padding: 20px 30px; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <h1>${info.icon} ${info.label}</h1>
              <p>${config.appName || "NextMart"} Order Update</p>
            </div>
            <div class="body">
              <p>Hi <strong>${customerName}</strong>,</p>
              <p>${info.message}</p>

              <div class="order-box">
                <p>Order Number</p>
                <h2>${orderNumber}</h2>
              </div>

              <p>Current Status: <span class="status-badge">${info.label}</span></p>

              <p>If you have any questions, please contact our support team by replying to this email.</p>

              <p>Thank you for shopping with us!</p>
              <p>Best regards,<br/><strong>The ${config.appName || "NextMart"} Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply directly.</p>
              <p>© ${new Date().getFullYear()} ${config.appName || "NextMart"}. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log(`Order status email sent to ${customerEmail} — messageId: ${result.messageId}`);
    return { success: true };
  } catch (error) {
    // Log the error but do NOT throw — a failed email should not break the status update
    console.error("Failed to send order status email:", error.message);
    return { success: false };
  }
};

/**
 * Send a refund decision email to the customer.
 * Called after admin approves (full/partial) or rejects a refund request.
 *
 * @param {object} options
 * @param {string} options.customerEmail
 * @param {string} options.customerName
 * @param {string} options.orderNumber
 * @param {string} options.action        - "approved" | "partial" | "rejected"
 * @param {number} [options.refundAmount]
 * @param {string} [options.adminNote]
 */
export const sendRefundEmail = async ({ customerEmail, customerName, orderNumber, action, refundAmount, adminNote }) => {
  const REFUND_INFO = {
    approved: {
      icon:    "💸",
      label:   "Refund Approved",
      color:   "#16a34a",
      message: `Great news! Your full refund of <strong>$${refundAmount?.toFixed(2)}</strong> has been approved and processed. It will appear in your account within 5–10 business days.`,
    },
    partial: {
      icon:    "💰",
      label:   "Partial Refund Approved",
      color:   "#d97706",
      message: `A partial refund of <strong>$${refundAmount?.toFixed(2)}</strong> has been approved and processed. It will appear in your account within 5–10 business days.`,
    },
    rejected: {
      icon:    "❌",
      label:   "Refund Request Declined",
      color:   "#dc2626",
      message: "Unfortunately, your refund request could not be approved at this time. Please see the note below for details.",
    },
  };

  const info = REFUND_INFO[action];
  if (!info) return;

  const adminNoteSection = adminNote
    ? `<div style="background:#f9f9f9;border-left:4px solid ${info.color};padding:12px 16px;margin:16px 0;border-radius:4px;font-size:14px;"><strong>Note from our team:</strong><br/>${adminNote}</div>`
    : "";

  const mailOptions = {
    from: `"${config.appName || "NextMart"}" <${config.smtp.auth.user}>`,
    to: customerEmail,
    subject: `${info.icon} ${info.label} — ${orderNumber}`,
    html: `<!DOCTYPE html><html><head><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;margin:0;padding:0}.wrapper{background:#f4f4f4;padding:40px 20px}.container{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden}.header{background:${info.color};color:white;padding:30px;text-align:center}.header h1{margin:0;font-size:24px}.body{padding:30px}.order-box{background:#f9f9f9;border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;margin:20px 0}.order-box p{margin:0;font-size:14px;color:#6b7280}.order-box h2{margin:4px 0 0;font-size:22px;color:#111827}.footer{text-align:center;padding:20px 30px;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb}</style></head><body><div class="wrapper"><div class="container"><div class="header"><h1>${info.icon} ${info.label}</h1><p>${config.appName || "NextMart"} Refund Update</p></div><div class="body"><p>Hi <strong>${customerName}</strong>,</p><p>${info.message}</p><div class="order-box"><p>Order Number</p><h2>${orderNumber}</h2></div>${adminNoteSection}<p>If you have any questions, please contact our support team.</p><p>Best regards,<br/><strong>The ${config.appName || "NextMart"} Team</strong></p></div><div class="footer"><p>© ${new Date().getFullYear()} ${config.appName || "NextMart"}. All rights reserved.</p></div></div></div></body></html>`,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log(`Refund email sent to ${customerEmail} — messageId: ${result.messageId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to send refund email:", error.message);
    return { success: false };
  }
};
