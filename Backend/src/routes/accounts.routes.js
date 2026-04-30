import express from "express";
import {
  getAccounts,
  getAccountById,
  getAccountsByStudent,
  createAccount,
  updateAccount,
  deleteAccount
} from "../controllers/accounts.controller.js";

const router = express.Router();

router.get("/", getAccounts);
router.get("/:id", getAccountById);
router.get("/student/:studentId", getAccountsByStudent);
router.post("/", createAccount);
router.put("/:id", updateAccount);
router.delete("/:id", deleteAccount);

export default router;