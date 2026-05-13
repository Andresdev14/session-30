import express from "express";
import {
  getPayments,
  getPaymentById,
  createPayment,
  deletePayment
} from "../controllers/payments.controller.js";

const router = express.Router();

router.get("/", getPayments);
router.get("/:id", getPaymentById);
router.post("/", createPayment);
router.delete("/:id", deletePayment);

export default router;