import Product from "../models/productModel.js";
import { createEmbedding } from "../helpers/geminaiHelper.js";



export const getProductTextForEmbedding = (product) => `
Name: ${product.name}
Brand: ${product.brand || ""}
Category: ${product.category || ""}
Subcategory: ${product.subCategory || ""}
Description: ${product.description || ""}
Tags: ${product.tags?.join(", ") || ""}
Color: ${product.color || ""}
Size: ${product.size || ""}
Price: ${product.discountedPrice || product.basePrice}
Rating: ${product.rating || 0}
`;

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
        // category is an ObjectId — cannot $regex on it; search by name and brand only
        const filter = search
          ? {
              $or: [
                { name: { $regex: search, $options: "i" } },
                { brand: { $regex: search, $options: "i" } },
              ]
            }
          : {};
        const products = await Product.find(filter).skip(skip).limit(limitNum).populate("category").populate("subCategory").exec();
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

// ─── Dedicated image-upload endpoint for products ─────────────────────────────
// POST /products/upload-image  (multipart, field: "image", single file)
export const uploadProductImageHandler = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: "error", message: "No image file provided" });
        }
        return res.status(200).json({
            status: "success",
            message: "Image uploaded successfully",
            url: req.file.location, // S3 URL from multer-s3
        });
    } catch (error) {
        console.error("uploadProductImageHandler error:", error);
        return res.status(500).json({ status: "error", message: "Error uploading image" });
    }
};

// create new products
export const createNewProduct = async(req,res) =>{
    try {
        const productData = req.body;
        if(!productData){
            return res.status(400).send({
                status:"error",
                message:"productData is required",
                
            })  
        }
        // If an image was uploaded via multipart (multer), attach the S3 URL
        if (req.file) {
            productData.image = req.file.location;
        }
        // generate embedding for the product
        const bookText = getProductTextForEmbedding(productData);
        const embedding = await createEmbedding(bookText);
        if(embedding){
            productData.embedding = embedding;
        }
        const product = await Product.create(productData);
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
        const updatedData = req.body;
        if(!productId || !updatedData){
            return res.status(400).send({
                status:"error",
                message:"provide a product id and updated data"
            })
        }
        const oldProduct = await Product.findById(productId);
        if(!oldProduct){
            return res.status(404).send({
                status:"error",
                message:"product not found",
            })
        }
        // If a new image was uploaded via multipart, replace the image
        if (req.file) {
            updatedData.image = req.file.location;
        }
        const mergedBook = {...oldProduct.toObject(), ...updatedData};
        const bookText  = getProductTextForEmbedding(mergedBook);
        const embedding = await createEmbedding(bookText);
        if(embedding){
            updatedData.embedding = embedding;
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
        // schema field is isActive, not isAvailable
        const {isActive} = req.body;

        if(typeof isActive !== "boolean" || !productId){
            return res.status(400).send({
                status:"error",
                message:"please provide isActive (boolean) and productId"
            })
        }
        const updatedStatus = await Product.findByIdAndUpdate(productId, {isActive}, {new:true});
        if(!updatedStatus){
            return res.status(404).send({
                status:"error",
                message:"product not found"
            })
        }
        return res.status(200).send({
            status:"success",
            message:"product status updated successfully",
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
