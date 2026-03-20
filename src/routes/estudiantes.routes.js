import express from "express";
import { getEstudiantes, postEstudiante } from "../controllers/estudiantes.controllers.js";

const router = express.Router();

router.get("/", getEstudiantes);
router.post("/", postEstudiante);

export default router;