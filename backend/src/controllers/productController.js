import { Product } from "../models/productModel.js";

// Get all products
export const getAllProduct = async(req, res) =>{
    try {
        const {
            page=1, 
            limit=10,
            search= ""
        }= req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const filter = {
            $or: [
                { name: { $regex: search, $options: "i" } },
                {category:{$regex: search, $options: "i"}},
                
            ]
        }
        const products = await Product.find(filter).skip(skip).limit(limitNum).populate("category").exec();
        const total = await Product.countDocuments(filter);
        return res.status(200).send({
            status:"success",
            message:"Products fetched successfully",
            products,
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
            message:"error fetching products",
        })
    }
}

// create new products
export const createNewProduct = async(req,res) =>{
    try {
        const {productData} = req.body;
        if(!productData){
            return res.status(400).send({
                status:"error",
                message:"productData is required",
                
            })  
        }
        const product = await Product.insertOne(productData);
        if(!product){
            return res.status(400).send({
                status:"error",
                message:" Error creating product",
            })
        }
        return res.status(201).send({
            status:"success",
            message:"product created successfully",
            data: product,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status:"error",
            message:" Error creating product",
            
        })
    }
}

// get product by id
export const getProductById = async(req,res) =>{
    try {
        const {productId} = req.params;
        if(!productId){
            return res.status(400).send({
                status:"error",
                message:"provide a product id"
            })
        }
        const product = await Product.findById(productId).populate("category").populate("subCategory").exec();
        if(!product){
            return res.status(404).send({
                status:"error",
                message:"product not found"
            })
        }
        return res.status(200).send({
            status:"success",
            message:"product fetched successfully",
            data: product,
        })
        
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status:"error",
            message:"error getting product by id"
        })
    }
}


// update product
export const updateProduct = async(req,res) =>{
    try {
        const {productId} = req.params;
        const {updatedData} = req.body;
        if(!productId || !updatedData){
            return res.status(400).send({
                status:"error",
                message:"provide a product id and updated data"
            })
        }
    const updatedProduct = await Product.findByIdAndUpdate(productId,updatedData, {new: true});
        if(!updatedProduct){
            return res.status(404).send({
                status:"error",
                message:"product not found",
            })
        }
        return res.status(200).send({
            status:"success",
            message:"product successfully updated",
            data: updatedProduct,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status:"error",
            message:"error updating product",
        })
    }
}
// delete product
export const deleteProduct = async(req,res)=>{
    try {
        const {productId} = req.params;
         if(!productId){
            return res.status(400).send({
                status:"error",
                message:"provide a product id"
            })
        }
        const deletdProduct = await Product.findByIdAndDelete(productId);
        if(!deletdProduct){
            return res.status(404).send({
                status:"error",
                message:"product not found"
            })
        }
        return res.status(200).send({
            status:"success",
            message:"product deleted successfully",
            data: deletdProduct,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status:"error",
            message:"error deleting product",
        })
    }
}



// update a stock for the product by id
export const updateStock = async(req, res)=>{
    try {
        const {productId} = req.params;
        const {quantity} = req.body;
        const stock = parseInt(quantity); 

        if(!stock || stock <=0 || !productId || !Number.isInteger(stock)){
            return res.status(400).send({
                status:"error",
                message:"provide a stock quantity which is greater than 0"
            })
        }
        const updatedStock = await Product.findByIdAndUpdate(productId, {$inc: {stock: stock}}, {new:true});
        if(!updatedStock){
            return res.status(404).send({
                status:"error",
                message:"product not found"
            })
        }
        return res.status(200).send({
            status:"success",
            message:"stock updated successfully",
            data: updatedStock,
        })
        
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status:"error",
            message:"error updateing stock",
        })
    }
}

// update status of the product
export const updateStatus = async(req, res)=>{
    try {
        const {productId} = req.params;
        const {isAvailable} = req.body;

        if(typeof isAvailable !== "boolean" || !productId){
            return res.status(400).send({
                status:"error",
                message:"please provide isAvailable (boolean) and productId"
            })
        }
        const updatedStatus = await Product.findByIdAndUpdate(productId, {isAvailable}, {new:true});
        if(!updatedStatus){
            return res.status(404).send({
                status:"error",
                message:"product not found"
            })
        }
        return res.status(200).send({
            status:"success",
            message:"stock updated successfully",
            data: updatedStatus,
        })
        
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status:"error",
            message:"error updateing status",
        })
    }
}
