import express from "express";
import {
  getDashboard,
  getDashboardStats,
  getRecentActivity
} from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/", getDashboard);
router.get("/stats", getDashboardStats);
router.get("/activity", getRecentActivity);

export default router;