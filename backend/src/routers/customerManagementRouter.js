import express from "express";
import{getAllCustomers, getCustomerById, getOrderByUser, getOrderDetails, updateCustomerStat} from "../controllers/customerController.js"
import {authMiddleware } from "../middlewares/authMiddleware.js";
import {isAdmin} from "../middlewares/roleMiddleware.js";


const router = express.Router();

router.get("/", authMiddleware, isAdmin, getAllCustomers);
router.get("/:id", authMiddleware, isAdmin, getCustomerById);
router.get("/orders", authMiddleware, isAdmin, getOrderByUser);
router.get("/order/:id", authMiddleware, isAdmin, getOrderDetails);
router.patch("/status", authMiddleware, isAdmin, updateCustomerStat)

export default router;