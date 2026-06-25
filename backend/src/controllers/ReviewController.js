import {Review} from "../models/reviewModel.js"

// get all reviews (admin sees all, filtered by status)
export const getAllApprovedReviews = async(req, res) =>{
    try {
        const { status = "approved", page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        const filter = {};
        // Allow filtering by isApproved status; default to "approved"
        if (["pending", "approved", "rejected"].includes(status)) {
            filter.isApproved = status;
        }

        const [reviews, total] = await Promise.all([
            Review.find(filter)
                .populate("user", "name email image")
                .populate("product", "name images")
                .skip(skip)
                .limit(limitNum)
                .sort({ createdAt: -1 }),
            Review.countDocuments(filter),
        ]);

        return res.status(200).send({
            status:"success",
            message:"Reviews fetched successfully",
            reviews,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        })
        
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status:"error",
            message:"failed to get reviews"
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
        const review = await Review.findById(id)
            .populate("user", "name email image")
            .populate("product", "name images");
        if(!review){
            return res.status(404).send({
                status:"error",
                message:"review not found",
            })
        }
        return res.status(200).send({
            status:"success",
            message:"review fetched successfully",
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


// approve review status
export const updateReviewStatus = async(req,res) =>{
  try {
    const {id} = req.params;    
    if(!id){
        return res.status(400).send({
            status:"error",
            message:"provide a review id",
        })
    }
    const review = await Review.findByIdAndUpdate(id, {isApproved: "approved"}, {new:true});
    if(!review){
        return res.status(404).send({
            status:"error",
            message:"review not found",
        })
    }
    return res.status(200).send({
        status:"success",
        message:"review approved successfully",
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

// Reject the review 
export const rejectReview = async(req,res) =>{
  try {
    const {id} = req.params;
    if(!id){
        return res.status(400).send({
            status:"error",
            message:"provide a review id",
        })
    }
    // Schema enum is "rejected" not "reject"
    const review = await Review.findByIdAndUpdate(id, {isApproved: "rejected"}, {new:true});
    if(!review){
        return res.status(404).send({
            status:"error",
            message:"review not found",
        })
    }
    return res.status(200).send({
        status:"success",
        message:"review rejected successfully",
        review,
    })
    
  } catch (error) {
    console.log(error);
    return res.status(500).send({
        status:"error",
        message:"failed to reject review",
    })
  }
}
