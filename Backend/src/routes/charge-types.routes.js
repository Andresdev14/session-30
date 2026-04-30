import express from "express";
import {
  getChargeTypes,
  getChargeTypeById,
  createChargeType,
  updateChargeType,
  deleteChargeType
} from "../controllers/charge-types.controller.js";

const router = express.Router();

router.get("/", getChargeTypes);
router.get("/:id", getChargeTypeById);
router.post("/", createChargeType);
router.put("/:id", updateChargeType);
router.delete("/:id", deleteChargeType);

export default router;