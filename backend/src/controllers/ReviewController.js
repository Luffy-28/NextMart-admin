import {Review} from "../models/reviewModel.js"
// get all approve reviews

export const getAllApprovedReviews = async(req, res) =>{
    try {
        const reviews = await Review.find().populate("user").populate("product");
        if(!reviews){
            return res.status(404).send({
                status:"error",
                message:"no reviews found",
            })
        }
        return res.status(200).send({
            status:"success",
            message:"approved reviews fatched successfully",
            reviews,
        })
        
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status:"error",
            message:"failed to get approved reviews"
        })
    }
}

// get review by id
export const getReviewById = async(req,res) =>{
    try {
        const {id} = req.params;
        if(!id){
            return res.status(400).send({
                status:"error",
                message:"provide a review id",
            })
        }
        const review = await Review.findById(id).populate("user").populate("product");
        if(!review){
            return res.status(404).send({
                status:"error",
                message:"review not found",
            })
        }
        return res.status(200).send({
            status:"success",
            message:"review fatched successfully",
            review,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status:"error",
            message:"failed to get review by id"
        })
    }
}




// update reviews status

export const updateReviewStatus = async(req,res) =>{
  try {
    const {id} = req.params;    
    if(!id){
        return res.status(400).send({
            status:"error",
            message:"provide a review id",
        })
    }
    const review = await Review.findByIdAndUpdate(id,{isApproved: "approved"}, {new:true});
    if(!review){
        return res.status(404).send({
            status:"error",
            message:"review not found",
        })
    }
    return res.status(200).send({
        status:"success",
        message:"review status updated successfully",
        review,
    })
    
  } catch (error) {
    console.log(error);
    return res.status(500).send({
        status:"error",
        message:"failed to update review status",
    })
  }
}

//Reject the review 

export const rejectReview = async(req,res) =>{
  try {
    const {id} = req.params;
    if(!id){
        return res.status(400).send({
            status:"error",
            message:"provide a review id",
        })
    }
    const review = await Review.findByIdAndUpdate(id,{isApproved: "reject"}, {new:true});
    if(!review){
        return res.status(404).send({
            status:"error",
            message:"review not found",
        })
    }
    return res.status(200).send({
        status:"success",
        message:"review status updated successfully",
        review,
    })
    
  } catch (error) {
    console.log(error);
    return res.status(500).send({
        status:"error",
        message:"failed to remove review",
    })
  }
}
