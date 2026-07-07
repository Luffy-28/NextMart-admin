  import { SubCategory } from "../models/subCategoryModel.js";
import { Category } from "../models/categoryModel.js";

// ─── Dedicated image-upload endpoint for sub-categories ──────────────────
// POST /subcategories/upload-image  (multipart, field: "image", single file)
export const uploadSubCategoryImageHandler = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: "error", message: "No image file provided" });
    }
    return res.status(200).json({
      status: "success",
      message: "Sub-category image uploaded successfully",
      url: req.file.location, // S3 URL from multer-s3
    });
  } catch (error) {
    console.error("uploadSubCategoryImageHandler error:", error);
    return res.status(500).json({ status: "error", message: "Error uploading image" });
  }
};


// get all subcategories
export const getAllSubCategories = async (req, res) => {
 try {
   const { page = 1, limit = 50, search = "", categoryId } = req.query;
   const pageNum = parseInt(page, 10);
   const limitNum = parseInt(limit, 10);
   const skip = (pageNum - 1) * limitNum;


   const filter = {};


   // Optional parent-category filter 
   if (categoryId) {
     filter.category = categoryId;
   }


   // Search by name
   if (search) {
     filter.name = { $regex: search, $options: "i" };
   }


   const [subCategories, total] = await Promise.all([
     SubCategory.find(filter)
       .populate("category", "name slug image isActive")
       .skip(skip)
       .limit(limitNum)
       .sort({ createdAt: -1 }),
     SubCategory.countDocuments(filter),
   ]);


   return res.status(200).json({
     status: "success",
     message: "Sub-categories fetched successfully",
     subCategories,
     pagination: {
       total,
       page: pageNum,
       limit: limitNum,
       totalPages: Math.ceil(total / limitNum),
     },
   });
 } catch (error) {
   console.error("getAllSubCategories error:", error);
   return res.status(500).json({
     status: "error",
     message: "Error fetching sub-categories",
   });
 }
};


// get subcategory with id
export const getSubCategoryById = async (req, res) => {
 try {
   const { subCatId } = req.params;
   const subCategory = await SubCategory.findById(subCatId).populate(
     "category",
     "name slug"
   );
   if (!subCategory) {
     return res.status(404).json({
       status: "error",
       message: "Sub-category not found",
     });
   }
   return res.status(200).json({
     status: "success",
     data: subCategory,
   });
 } catch (error) {
   console.error("getSubCategoryById error:", error);
   return res.status(500).json({
     status: "error",
     message: "Error fetching sub-category",
   });
 }
};



// create sub category 
export const createSubCategory = async (req, res) => {
 try {
   const { name, category, isActive } = req.body;
   // Image can come from multipart upload (req.file) or JSON body (req.body.image)
   const image = req.file ? req.file.location : (req.body.image || "");


   if (!name || !category) {
     return res.status(400).json({
       status: "error",
       message: "Name and category are required",
     });
   }


   // Verify parent category exists
   const parentCategory = await Category.findById(category);
   if (!parentCategory) {
     return res.status(404).json({
       status: "error",
       message: "Parent category not found",
     });
   }


   // Check for duplicate name within the same category (slug uniqueness enforced by index)
   const existing = await SubCategory.findOne({
     category,
     name: { $regex: `^${name.trim()}$`, $options: "i" },
   });
   if (existing) {
     return res.status(400).json({
       status: "error",
       message: "A sub-category with this name already exists in that category",
     });
   }


   const subCategory = new SubCategory({
     name: name.trim(),
     image,
     category,
     isActive: isActive !== undefined ? isActive : true,
   });


   await subCategory.save();
   await subCategory.populate("category", "name slug");


   return res.status(201).json({
     status: "success",
     message: "Sub-category created successfully",
     data: subCategory,
   });
 } catch (error) {
   console.error("createSubCategory error:", error);
   // Unique index violation (duplicate slug within same category)
   if (error.code === 11000) {
     return res.status(400).json({
       status: "error",
       message: "A sub-category with this name already exists in that category",
     });
   }
   return res.status(500).json({
     status: "error",
     message: "Error creating sub-category",
   });
 } 
};



// update sub category
export const updateSubCategory = async (req, res) => {
 try {
   const { subCatId } = req.params;
   const { name, category, isActive } = req.body;
   // Image can come from multipart upload (req.file) or JSON body (req.body.image)
   const image = req.file ? req.file.location : req.body.image;


   const subCategory = await SubCategory.findById(subCatId);
   if (!subCategory) {
     return res.status(404).json({
       status: "error",
       message: "Sub-category not found",
     });
   }


   // If category is being changed, verify new parent exists
   if (category && category !== String(subCategory.category)) {
     const parentCategory = await Category.findById(category);
     if (!parentCategory) {
       return res.status(404).json({
         status: "error",
         message: "Parent category not found",
       });
     }
     subCategory.category = category;
   }


   if (name !== undefined) subCategory.name = name.trim();
   if (image !== undefined) subCategory.image = image;
   if (isActive !== undefined) subCategory.isActive = isActive;


   await subCategory.save(); // triggers slug pre-save hook if name changed
   await subCategory.populate("category", "name slug");


   return res.status(200).json({
     status: "success",
     message: "Sub-category updated successfully",
     data: subCategory,
   });
 } catch (error) {
   console.error("updateSubCategory error:", error);
   if (error.code === 11000) {
     return res.status(400).json({
       status: "error",
       message: "A sub-category with this name already exists in that category",
     });
   }
   return res.status(500).json({
     status: "error",
     message: "Error updating sub-category",
   });
 } 
};


// update sub category status
export const toggleSubCategoryStatus = async (req, res) => {
 try {
   const { subCatId } = req.params;
   const { isActive } = req.body;


   if (typeof isActive !== "boolean") {
     return res.status(400).json({
       status: "error",
       message: "isActive (boolean) is required",
     });
   }


   const updated = await SubCategory.findByIdAndUpdate(
     subCatId,
     { isActive },
     { new: true }
   ).populate("category", "name slug");


   if (!updated) {
     return res.status(404).json({ status: "error", message: "Sub-category not found" });
   }


   return res.status(200).json({
     status: "success",
     message: `Sub-category ${isActive ? "activated" : "deactivated"} successfully`,
     data: updated,
   });
 } catch (error) {
   console.error("toggleSubCategoryStatus error:", error);
   return res.status(500).json({
     status: "error",
     message: "Error updating sub-category status",
   });
 }
};


// delete the subCategroy
export const deleteSubCategory = async (req, res) => {
 try {
   const { subCatId } = req.params;
   const deleted = await SubCategory.findByIdAndDelete(subCatId);
   if (!deleted) {
     return res.status(404).json({ status: "error", message: "Sub-category not found" });
   }
   return res.status(200).json({
     status: "success",
     message: "Sub-category deleted successfully",
     data: deleted,
   });
 } catch (error) {
   console.error("deleteSubCategory error:", error);
   return res.status(500).json({
     status: "error",
     message: "Error deleting sub-category",
   });
 }
};



