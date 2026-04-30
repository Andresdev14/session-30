import express from "express";
import {
  getPagos,
  getPagoById,
  getPagosByAccount,
  createPago,
  updatePago,
  deletePago
} from "../controllers/pagos.controller.js";

const router = express.Router();

router.get("/", getPagos);
router.get("/:id", getPagoById);
router.get("/account/:accountId", getPagosByAccount);
router.post("/", createPago);
router.put("/:id", updatePago);
router.delete("/:id", deletePago);

export default router;