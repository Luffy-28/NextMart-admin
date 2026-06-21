import express from "express"
import { updateStatus, getPaymentById, getAllPayments} from "../controllers/paymentcontroller.js";

const router = express.Router();


router.get("/", getAllPayments)
router.get("/:id", getPaymentById)
router.patch("/status/:id", updateStatus)


export default router