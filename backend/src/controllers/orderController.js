import {Order}  from "../models/orderModel.js"
// all orders sorted by date 
export const getAllOrder = async(req, res)=>{
    try {
        const {page=1, limit =10, query = ""} = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip =(pageNum-1)*limitNum;

        const filter = {
            $or:[
                {orderId:{$regex:query, $options:"i"}},
            ]
        }
        const orders = await Order.find(filter).skip(skip).limit(limitNum).sort({createdAt: -1});
        const totalOrder = await Order.countDocuments(filter)
        if(!order){
            return res.status(404).send({
                status:"errror",
                message:"Order not found",
            })
        }
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

// get order detials
export const getOrderDetails = async(req,res)=>{
    try {
        const {orderId} = req.params;
        if(!orderId){
            return res.status(400).send({
                status:"error",
                message:"Order ID is required",
            })
        }
        const order = await Order.findById(orderId).populate("user").populate("items.product").exec();
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
        const {status} = req.body;
        if(!orderId || !status){
            return res.status(400).send({
                status:"error",
                message:"Order ID and status are required",
            })
        }
        const order = await Order.findByIdAndUpdate(orderId,{status},{new:true});
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

