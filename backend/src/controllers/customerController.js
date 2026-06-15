import { User } from "../models/userModel.js";

//get all the customers
export const getAllCustomers = async(req, res) =>{
    try {
        const {
            page=1,
            limit=10,
            search="",
            gender,
            status,
        }=req.query;

        const pageNUm = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNUm -1)* limitNum;
    

        const filter = {
            $or:[
                {name: { $regex: search, $options:"i"}},
                {email: { $regex: search, $options:"i"}},
                {phoneNumber: { $regex: search, $options:"i"}}
            ]
        }

        if(gender){
            filter.gender = gender;
        }

        if(status){
            filter.status = status;
        }

        const users = await User.find(filter).skip(skip).limit(limitNum).sort();
        const total = await User.countDocuments(filter);

        return res.status(200).send({
            status:"success",
            messgae:"User fetched successfully",
            users,
            pagination:{
                total,
                page:pageNUm,
                limit:limitNum,
                totalPages:Math.ceil(total/limitNum)
            }
        })

        
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status:"error",
            message:"Error fetching customers"
        })
    }
}



// get cutsomer details with :id






// update customer status like block unblock



// get cutomer Orders



// get cutomer Order Details with :id

