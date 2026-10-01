import { Order } from "../models/orderModel.js";
import { sendOrderStatusEmail } from "../helpers/emailHelper.js";

// Get all orders — paginated and searchable by order number
export const getAllOrder = async (req, res) => {
    try {
        const { page = 1, limit = 10, query = "" } = req.query;
        const pageNum  = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Search by order number
        const filter = query
            ? { orderNumber: { $regex: query, $options: "i" } }
            : {};

        const orders = await Order.find(filter)
            .skip(skip)
            .limit(limitNum)
            .sort({ createdAt: -1 })
            .populate("user", "name email")
            .populate("shippingAddress");

        const totalOrder = await Order.countDocuments(filter);

        return res.status(200).send({
            status: "success",
            message: "Orders fetched successfully",
            data: orders,
            pagination: {
                totalOrder,
                page: pageNum,
                limit: limitNum,
                totalPage: Math.ceil(totalOrder / limitNum),
            },
        });

    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status: "error",
            message: "Failed to get orders",
        });
    }
};

// Get a single order with full details (items, address, user)
export const getOrderDetails = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!orderId) {
            return res.status(400).send({
                status: "error",
                message: "Order ID is required",
            });
        }

        const order = await Order.findById(orderId)
            .populate("user", "name email")
            .populate("shippingAddress")
            .populate("items.product", "name images");

        if (!order) {
            return res.status(404).send({
                status: "error",
                message: "Order not found",
            });
        }

        return res.status(200).send({
            status: "success",
            message: "Order fetched successfully",
            data: order,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status: "error",
            message: "Failed to get order details",
        });
    }
};

// Update order status — sends an email to the customer after every change
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { orderStatus } = req.body;

        if (!orderId || !orderStatus) {
            return res.status(400).send({
                status: "error",
                message: "Order ID and orderStatus are required",
            });
        }

        // Fetch the order and populate user so we have their email + name
        const order = await Order.findByIdAndUpdate(
            orderId,
            { orderStatus },
            { new: true }
        ).populate("user", "name email");

        if (!order) {
            return res.status(404).send({
                status: "error",
                message: "Order not found",
            });
        }

        // Send status update email to the customer (non-blocking — won't fail the request)
        if (order.user?.email) {
            sendOrderStatusEmail({
                customerEmail: order.user.email,
                customerName:  order.user.name || "Customer",
                orderNumber:   order.orderNumber,
                newStatus:     orderStatus,
            });
        }

        return res.status(200).send({
            status: "success",
            message: "Order status updated successfully",
            data: order,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status: "error",
            message: "Failed to update order status",
        });
    }
};
