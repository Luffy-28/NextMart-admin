import {Order}  from "../models/orderModel.js"
// all orders sorted by date 
export const getAllOrder = async(req, res)=>{
    try {
        const {page=1, limit =10, query = ""} = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip =(pageNum-1)*limitNum;

        // orderNumber is a string field in the schema — search on it
        const filter = query
          ? { orderNumber: { $regex: query, $options: "i" } }
          : {};

        const orders = await Order.find(filter)
          .skip(skip)
          .limit(limitNum)
          .sort({createdAt: -1})
          .populate("user", "name email")
          .populate("shippingAddress");

        const totalOrder = await Order.countDocuments(filter);

        return res.status(200).send({
            status:"success",
            message:"Orders fetched successfully",
            data:orders,
            pagination:{
                totalOrder,
                page: pageNum,
                limit: limitNum,
                totalPage: Math.ceil(totalOrder/limitNum),
            }
        })
        
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            status:"error",
            message:"failed to get orders"
        })
    }
}

// get order details
export const getOrderDetails = async(req,res)=>{
    try {
        const {orderId} = req.params;
        if(!orderId){
            return res.status(400).send({
                status:"error",
                message:"Order ID is required",
            })
        }
        const order = await Order.findById(orderId)
          .populate("user", "name email")
          .populate("shippingAddress")
          .populate("items.product", "name images");
        if(!order){
            return res.status(404).send({
                status:"error",
                message:"Order not found",
            })
        }
        return res.status(200).send({
            status:"success",
            message:"Order fetched successfully",
            data:order,
        })
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            status:"error",
            message:"failed to get order details"
        })
    }
}


// update order status
export const updateOrderStatus = async(req,res)=>{
    try {
        const {orderId} = req.params;
        const {orderStatus} = req.body;   // field in schema is "orderStatus"
        if(!orderId || !orderStatus){
            return res.status(400).send({
                status:"error",
                message:"Order ID and orderStatus are required",
            })
        }
        const order = await Order.findByIdAndUpdate(orderId, {orderStatus}, {new:true});
        if(!order){
            return res.status(404).send({
                status:"error",
                message:"Order not found",
            })
        }
        return res.status(200).send({
            status:"success",
            message:"Order status updated successfully",
            data:order,
        })
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            status:"error",
            message:"failed to update order status"
        })
    }
}

