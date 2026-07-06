import express from "express"
import { updateStatus, getPaymentById, getAllPayments} from "../controllers/paymentcontroller.js";

const router = express.Router();


router.get("/", getAllPayments)
router.get("/:paymentId", getPaymentById)
router.patch("/status/:paymentId", updateStatus)


export default router