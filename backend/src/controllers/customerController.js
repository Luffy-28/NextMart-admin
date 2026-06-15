import { Address } from "../models/addressModel";
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

        const users = await User.find(filter).select("-password -googleId -__v").skip(skip).limit(limitNum).sort();
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
export const getUserDetials = async(req,res) =>{
    try {
        const userId = req.params;
        const user = await User.findById(userId).select("-password -googleId -__v");
        if(!user){
            return res.status(404).send({
                status:"error",
                messgae:"User not found",
            })
        }
        const address = (await Address.find({user: userId})).toSorted({
            isDefault: -1,
            createdAt: -1,
        })
        return res.status(200).send({
            status:"success",
            message:"User details fetched successfully",
            data:{
                user,
                address,
            }
        })

    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status:"error",
            messgae:"Error fetching user details"
        })
    }
}






// update customer status like block unblock





// get cutomer Orders



// get cutomer Order Details with :id

