// all orders sorted by date 
export const getAllOrder = async(req, res)=>{
    try {
        
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            status:"error",
            message:"failed to get orders"
        })
    }
}



// get order detials


// update order status




// initiate refund



//cancel orde