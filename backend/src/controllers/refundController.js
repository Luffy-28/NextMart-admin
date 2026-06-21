import {Payment} from "../models/paymentModel.js"
// get all paymemnts
export const getAllPayments = async (req, res) => {
    try {
        const {page=1, limit=10, search=""}= req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum-1)
        const filter = [
            {$or:[
              {orderNumber:{$regex: search, $options: "i"} },
              {paymentStatus:{$regex: search, $options: "i"} },
              {name:{$regex: search, $options:"i"}},
              
            ]}
        ]
        const payments = await Payment.find(filter).skip(skip).limit(limitNum).populate("user").populate("order");
        const total = await Payment.countDocuments(filter);
        return res.status(200).send({
            status:"success",
            message:"Payments fetched successfully",
            payments,
            pagination:{
                total,
                page:pageNum,
                limit:limitNum,
                totalPages: Math.ceil(total/limitNum),
            }
        })

    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status:"error",
            message:"failed to get payments",
        })
    }
}



// get payments by id
export const getPaymentById = async(req,res) =>{
    try {
        const {paymentid} = req.params;
        if(!paymentId){
            return res.status(400).send({
                status:"error",
                message:"provude a paymentId"
            })
        }
        const payment = await Payment.findById(paymentId).populate("user").populate("order");
        if(!payment){
            return res.status(404).send({
                status:"error",
                message:"payment not found",
            })
        }
        return res.status(200).send({
            status:"success",
            message:"Payment fetched successfully",
            data:payment,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status:"error",
            message:"faile to get payment by id"
        })
    }
}

// update status apis
export const updateStatus = async(req,res) =>{
    try {
        const {paymentID} = req.params;
        const {status} = req.body;
        if(!paymentID || !status){
            return res.status(400).send({
                status:"error",
                message:"provide a paymentId and status"
            })
        }

        const payment = await Payment.findByIdAndUpdate(paymentID,{status: status}, {new:true});
        if(!payment){
            return res.status(404).send({
                status:"error",
                message:"payment id not found",
            })
        }
        return res.status(200).send({
            status:"success",
            message:"Payment status updated successfully",
            data:payment,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status:"error",
            message:"faile to update status"
        })
    }
}

