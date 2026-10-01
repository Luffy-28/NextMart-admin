import { Deal } from "../models/dealsModel.js";
import Product from "../models/productModel.js";
import { Category } from "../models/categoryModel.js";

/* ─────────────────────────────────────────────────────────────────
  GET /api/v1/deals
  Query params: page, limit, search (title/description), isActive
  Returns paginated deals with products and categories populated.
───────────────────────────────────────────────────────────────────*/
export const getAllDeals = async (req, res) => {
 try {
   const { page = 1, limit = 10, search = "", isActive } = req.query;
   const pageNum = parseInt(page, 10);
   const limitNum = parseInt(limit, 10);
   const skip = (pageNum - 1) * limitNum;

   const filter = {};

   if (search) {
     filter.$or = [
       { title: { $regex: search, $options: "i" } },
       { description: { $regex: search, $options: "i" } },
     ];
   }

   if (isActive !== undefined && isActive !== "") {
     filter.isActive = isActive === "true" || isActive === true;
   }

   const [deals, total] = await Promise.all([
     Deal.find(filter)
       .populate("products", "name images basePrice discountedPrice category brand")
       .populate("categories", "name image slug")
       .skip(skip)
       .limit(limitNum)
       .sort({ createdAt: -1 }),
     Deal.countDocuments(filter),
   ]);

   const [totalDeals, activeCount] = await Promise.all([
     Deal.countDocuments(),
     Deal.countDocuments({ isActive: true }),
   ]);

   const allActiveDeals = await Deal.find({ isActive: true }).select("products");
   const uniqueProductIds = new Set(
     allActiveDeals.flatMap((d) => d.products.map((id) => String(id)))
   );

   return res.status(200).json({
     status: "success",
     message: "Deals fetched successfully",
     deals,
     stats: {
       totalDeals,
       activeDeals: activeCount,
       inactiveDeals: totalDeals - activeCount,
       productsOnDeal: uniqueProductIds.size,
     },
     pagination: {
       total,
       page: pageNum,
       limit: limitNum,
       totalPages: Math.ceil(total / limitNum),
     },
   });
 } catch (error) {
   console.error("getAllDeals error:", error);
   return res.status(500).json({ status: "error", message: "Error fetching deals" });
 }
};


/* ─────────────────────────────────────────────────────────────────
  GET /api/v1/deals/:dealId
───────────────────────────────────────────────────────────────────*/
export const getDealById = async (req, res) => {
 try {
   const { dealId } = req.params;
   const deal = await Deal.findById(dealId)
     .populate("products", "name images basePrice discountedPrice category brand stock")
     .populate("categories", "name image slug");
   if (!deal) {
     return res.status(404).json({ status: "error", message: "Deal not found" });
   }
   return res.status(200).json({ status: "success", data: deal });
 } catch (error) {
   console.error("getDealById error:", error);
   return res.status(500).json({ status: "error", message: "Error fetching deal" });
 }
};


/* ─────────────────────────────────────────────────────────────────
  POST /api/v1/deals/create
  Body: title, description, bannerImage, products[], categories[],
        discountType, discountValue, startsAt, endsAt, isActive
  Admin can target:
    - Individual products (products array)
    - Whole categories   (categories array)
    - Both at the same time
───────────────────────────────────────────────────────────────────*/
export const createDeal = async (req, res) => {
 try {
   const {
     title,
     description,
     bannerImage,
     products,
     categories,
     discountType,
     discountValue,
     startsAt,
     endsAt,
     isActive,
   } = req.body;

   // Required fields validation
   if (!title || !discountType || discountValue === undefined || !startsAt || !endsAt) {
     return res.status(400).json({
       status: "error",
       message: "title, discountType, discountValue, startsAt and endsAt are required",
     });
   }

   if (!["percentage", "fixed"].includes(discountType)) {
     return res.status(400).json({
       status: "error",
       message: "discountType must be 'percentage' or 'fixed'",
     });
   }

   const value = parseFloat(discountValue);
   if (isNaN(value) || value < 0) {
     return res.status(400).json({
       status: "error",
       message: "discountValue must be a non-negative number",
     });
   }

   if (discountType === "percentage" && value > 100) {
     return res.status(400).json({
       status: "error",
       message: "Percentage discount cannot exceed 100",
     });
   }

   const startDate = new Date(startsAt);
   const endDate   = new Date(endsAt);
   if (isNaN(startDate) || isNaN(endDate)) {
     return res.status(400).json({ status: "error", message: "Invalid date format" });
   }
   if (endDate < startDate) {
     return res.status(400).json({
       status: "error",
       message: "endsAt must be on or after startsAt",
     });
   }

   // Must have at least products OR categories
   const hasProducts   = Array.isArray(products)   && products.length > 0;
   const hasCategories = Array.isArray(categories) && categories.length > 0;
   if (!hasProducts && !hasCategories) {
     return res.status(400).json({
       status: "error",
       message: "A deal must have at least one product or one category",
     });
   }

   // Validate product IDs
   let productIds = [];
   if (hasProducts) {
     const found = await Product.find({ _id: { $in: products } }).select("_id");
     if (found.length !== products.length) {
       return res.status(400).json({
         status: "error",
         message: "One or more product IDs are invalid",
       });
     }
     productIds = found.map((p) => p._id);
   }

   // Validate category IDs
   let categoryIds = [];
   if (hasCategories) {
     const found = await Category.find({ _id: { $in: categories } }).select("_id");
     if (found.length !== categories.length) {
       return res.status(400).json({
         status: "error",
         message: "One or more category IDs are invalid",
       });
     }
     categoryIds = found.map((c) => c._id);
   }

   const deal = await Deal.create({
     title: title.trim(),
     description: description?.trim() || "",
     bannerImage: bannerImage || "",
     products: productIds,
     categories: categoryIds,
     discountType,
     discountValue: value,
     startsAt: startDate,
     endsAt: endDate,
     isActive: isActive !== undefined ? isActive : true,
   });

   await deal.populate([
     { path: "products",   select: "name images basePrice discountedPrice" },
     { path: "categories", select: "name image slug" },
   ]);

   return res.status(201).json({
     status: "success",
     message: "Deal created successfully",
     data: deal,
   });
 } catch (error) {
   console.error("createDeal error:", error);
   return res.status(500).json({ status: "error", message: "Error creating deal" });
 }
};


/* ─────────────────────────────────────────────────────────────────
  PATCH /api/v1/deals/update/:dealId
───────────────────────────────────────────────────────────────────*/
export const updateDeal = async (req, res) => {
 try {
   const { dealId } = req.params;
   const {
     title,
     description,
     bannerImage,
     products,
     categories,
     discountType,
     discountValue,
     startsAt,
     endsAt,
     isActive,
   } = req.body;

   const deal = await Deal.findById(dealId);
   if (!deal) {
     return res.status(404).json({ status: "error", message: "Deal not found" });
   }

   if (discountType !== undefined) {
     if (!["percentage", "fixed"].includes(discountType)) {
       return res.status(400).json({
         status: "error",
         message: "discountType must be 'percentage' or 'fixed'",
       });
     }
     deal.discountType = discountType;
   }

   if (discountValue !== undefined) {
     const value = parseFloat(discountValue);
     if (isNaN(value) || value < 0) {
       return res.status(400).json({
         status: "error",
         message: "discountValue must be a non-negative number",
       });
     }
     const effectiveType = discountType || deal.discountType;
     if (effectiveType === "percentage" && value > 100) {
       return res.status(400).json({
         status: "error",
         message: "Percentage discount cannot exceed 100",
       });
     }
     deal.discountValue = value;
   }

   if (startsAt !== undefined) {
     const d = new Date(startsAt);
     if (isNaN(d)) return res.status(400).json({ status: "error", message: "Invalid startsAt date" });
     deal.startsAt = d;
   }
   if (endsAt !== undefined) {
     const d = new Date(endsAt);
     if (isNaN(d)) return res.status(400).json({ status: "error", message: "Invalid endsAt date" });
     deal.endsAt = d;
   }
   if (deal.endsAt < deal.startsAt) {
     return res.status(400).json({
       status: "error",
       message: "endsAt must be on or after startsAt",
     });
   }

   // Update products if provided
   if (products !== undefined) {
     if (Array.isArray(products) && products.length > 0) {
       const found = await Product.find({ _id: { $in: products } }).select("_id");
       if (found.length !== products.length) {
         return res.status(400).json({
           status: "error",
           message: "One or more product IDs are invalid",
         });
       }
       deal.products = found.map((p) => p._id);
     } else {
       deal.products = [];
     }
   }

   // Update categories if provided
   if (categories !== undefined) {
     if (Array.isArray(categories) && categories.length > 0) {
       const found = await Category.find({ _id: { $in: categories } }).select("_id");
       if (found.length !== categories.length) {
         return res.status(400).json({
           status: "error",
           message: "One or more category IDs are invalid",
         });
       }
       deal.categories = found.map((c) => c._id);
     } else {
       deal.categories = [];
     }
   }

   if (title       !== undefined) deal.title       = title.trim();
   if (description !== undefined) deal.description = description.trim();
   if (bannerImage !== undefined) deal.bannerImage = bannerImage;
   if (isActive    !== undefined) deal.isActive    = isActive;

   await deal.save();
   await deal.populate([
     { path: "products",   select: "name images basePrice discountedPrice" },
     { path: "categories", select: "name image slug" },
   ]);

   return res.status(200).json({
     status: "success",
     message: "Deal updated successfully",
     data: deal,
   });
 } catch (error) {
   console.error("updateDeal error:", error);
   return res.status(500).json({ status: "error", message: "Error updating deal" });
 }
};


/* ─────────────────────────────────────────────────────────────────
  PATCH /api/v1/deals/toggle-status/:dealId
───────────────────────────────────────────────────────────────────*/
export const toggleDealStatus = async (req, res) => {
 try {
   const { dealId } = req.params;
   const { isActive } = req.body;

   if (typeof isActive !== "boolean") {
     return res.status(400).json({
       status: "error",
       message: "isActive (boolean) is required",
     });
   }

   const updated = await Deal.findByIdAndUpdate(
     dealId,
     { isActive },
     { new: true }
   )
     .populate("products",   "name images basePrice discountedPrice")
     .populate("categories", "name image slug");

   if (!updated) {
     return res.status(404).json({ status: "error", message: "Deal not found" });
   }

   return res.status(200).json({
     status: "success",
     message: `Deal ${isActive ? "activated" : "deactivated"} successfully`,
     data: updated,
   });
 } catch (error) {
   console.error("toggleDealStatus error:", error);
   return res.status(500).json({ status: "error", message: "Error toggling deal status" });
 }
};


/* ─────────────────────────────────────────────────────────────────
  DELETE /api/v1/deals/delete/:dealId
───────────────────────────────────────────────────────────────────*/
export const deleteDeal = async (req, res) => {
 try {
   const { dealId } = req.params;
   const deleted = await Deal.findByIdAndDelete(dealId);
   if (!deleted) {
     return res.status(404).json({ status: "error", message: "Deal not found" });
   }
   return res.status(200).json({
     status: "success",
     message: "Deal deleted successfully",
     data: deleted,
   });
 } catch (error) {
   console.error("deleteDeal error:", error);
   return res.status(500).json({ status: "error", message: "Error deleting deal" });
 }
};
