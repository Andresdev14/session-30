import express from "express";
import { getUsuarios, postUsuarios } from "../controllers/usuario.controller.js";

const router = express.Router();

router.get("/", getUsuarios);
router.post("/", postUsuarios);

export default router;