import { Order } from "../models/orderModel.js";
import { User } from "../models/userModel.js";
import Product from "../models/productModel.js";
import { Review } from "../models/reviewModel.js";
import {capitaliseFirst} from "../helpers/helper.js"

//GET stats
export const getDashboardStats = async (req, res) => {
 try {
   const dayCount = Math.min(parseInt(req.query.days, 10) || 30, 365);
   const startDate = new Date(Date.now() - dayCount * 24 * 60 * 60 * 1000);
   const prevStartDate = new Date(Date.now() - dayCount * 2 * 24 * 60 * 60 * 1000);

   // Revenue & order count in the selected window
   const revenueAgg = await Order.aggregate([
     { $match: { paymentStatus: "paid", createdAt: { $gte: startDate } } },
     {
       $group: {
         _id: null,
         totalRevenue: { $sum: "$totalAmount" },
         totalOrders: { $sum: 1 },
       },
     },
   ]);

   const totalRevenue = revenueAgg[0]?.totalRevenue ?? 0;
   const totalOrders  = revenueAgg[0]?.totalOrders  ?? 0;

   // Active users — unique buyers in the selected window
   const activeUsersAgg = await Order.aggregate([
     { $match: { createdAt: { $gte: startDate } } },
     { $group: { _id: "$user" } },
     { $count: "count" },
   ]);
   const activeUsers = activeUsersAgg[0]?.count ?? 0;

   // Pending reviews (always all-time)
   const pendingReviews = await Review.countDocuments({ isApproved: "pending" });

   // Previous equivalent period revenue for trend %
   const prevRevenueAgg = await Order.aggregate([
     {
       $match: {
         paymentStatus: "paid",
         createdAt: { $gte: prevStartDate, $lt: startDate },
       },
     },
     { $group: { _id: null, total: { $sum: "$totalAmount" } } },
   ]);
   const prevRevenue  = prevRevenueAgg[0]?.total ?? 0;
   const revenueTrend = prevRevenue > 0
     ? (((totalRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1)
     : null;

   return res.status(200).json({
     status: "success",
     data: {
       totalRevenue,
       totalOrders,
       activeUsers,
       pendingReviews,
       revenueTrend: revenueTrend ? parseFloat(revenueTrend) : null,
       days: dayCount,
     },
   });
 } catch (error) {
   console.error("getDashboardStats error:", error);
   return res.status(500).json({
     status: "error",
     message: "Error fetching dashboard stats",
   });
 }
};




//GET revenue over time
export const getRevenueOverTime = async (req, res) => {
 try {
   const { period = "daily", days = 30 } = req.query;
   const dayCount = Math.min(parseInt(days, 10) || 30, 365);
   const startDate = new Date(Date.now() - dayCount * 24 * 60 * 60 * 1000);


   let groupId;
   if (period === "monthly") {
     groupId = {
       year: { $year: "$createdAt" },
       month: { $month: "$createdAt" },
     };
   } else if (period === "weekly") {
     groupId = {
       year: { $isoWeekYear: "$createdAt" },
       week: { $isoWeek: "$createdAt" },
     };
   } else {
     // daily (default)
     groupId = {
       year: { $year: "$createdAt" },
       month: { $month: "$createdAt" },
       day: { $dayOfMonth: "$createdAt" },
     };
   }


   const data = await Order.aggregate([
     {
       $match: {
         paymentStatus: "paid",
         createdAt: { $gte: startDate },
       },
     },
     {
       $group: {
         _id: groupId,
         revenue: { $sum: "$totalAmount" },
         orders: { $sum: 1 },
       },
     },
     { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.week": 1 } },
   ]);


   // Format dates for frontend
   const formatted = data.map((d) => {
     let date;
     if (period === "monthly") {
       date = `${d._id.year}-${String(d._id.month).padStart(2, "0")}`;
     } else if (period === "weekly") {
       date = `${d._id.year}-W${String(d._id.week).padStart(2, "0")}`;
     } else {
       date = `${d._id.year}-${String(d._id.month).padStart(2, "0")}-${String(
         d._id.day
       ).padStart(2, "0")}`;
     }
     return {
       date,
       revenue: parseFloat(d.revenue.toFixed(2)),
       orders: d.orders,
     };
   });


   return res.status(200).json({
     status: "success",
     data: formatted,
   });
 } catch (error) {
   console.error("getRevenueOverTime error:", error);
   return res.status(500).json({
     status: "error",
     message: "Error fetching revenue data",
   });
 }
};



//GET best selling products
export const getBestSellingProducts = async (req, res) => {
 try {
   const limitNum = Math.min(parseInt(req.query.limit, 10) || 5, 20);


   const results = await Order.aggregate([
     { $match: { paymentStatus: "paid" } },
     { $unwind: "$items" },
     {
       $group: {
         _id: "$items.product",
         name: { $first: "$items.name" },
         image: { $first: "$items.image" },
         unitsSold: { $sum: "$items.quantity" },
         revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
       },
     },
     { $sort: { unitsSold: -1 } },
     { $limit: limitNum },
     {
       $lookup: {
         from: "products",
         localField: "_id",
         foreignField: "_id",
         as: "productDetails",
       },
     },
      {
        $project: {
          _id: 1,
          name: 1,
          // image is now a plain string on each product doc
          image: {
            $ifNull: [
              { $arrayElemAt: ["$productDetails.image", 0] },
              "$image",
            ],
          },
          unitsSold: 1,
          revenue: { $round: ["$revenue", 2] },
          rating: { $arrayElemAt: ["$productDetails.rating", 0] },
          stock: { $arrayElemAt: ["$productDetails.stock", 0] },
        },
      },
   ]);


   return res.status(200).json({
     status: "success",
     data: results,
   });
 } catch (error) {
   console.error("getBestSellingProducts error:", error);
   return res.status(500).json({
     status: "error",
     message: "Error fetching best-selling products",
   });
 }
};



//GET latest order
export const getLatestOrders = async (req, res) => {
 try {
   const limitNum = Math.min(parseInt(req.query.limit, 10) || 5, 50);


   const orders = await Order.find()
     .sort({ createdAt: -1 })
     .limit(limitNum)
     .populate("user", "name email image")
     .select("orderNumber user totalAmount orderStatus paymentStatus createdAt");


   const shaped = orders.map((o) => {
     const fullName = o.user?.name ?? "Unknown";
     const initials = fullName
       .split(" ")
       .slice(0, 2)
       .map((n) => n[0]?.toUpperCase() ?? "")
       .join("");


     return {
       id: o._id,
       orderNumber: o.orderNumber,
       customer: fullName,
       email: o.user?.email ?? "",
       amount: `$${o.totalAmount.toFixed(2)}`,
       status: capitaliseFirst(o.orderStatus),
       paymentStatus: capitaliseFirst(o.paymentStatus),
       initials,
       createdAt: o.createdAt,
     };
   });


   return res.status(200).json({
     status: "success",
     data: shaped,
   });
 } catch (error) {
   console.error("getLatestOrders error:", error);
   return res.status(500).json({
     status: "error",
     message: "Error fetching latest orders",
   });
 }
};

