import express from "express";
import {
  createRelation,
  getRelations,
  getRelationsByStudent,
  deleteRelation
} from "../controllers/studentGuardian.controller.js";

const router = express.Router();

// crear relación
router.post("/", createRelation);

// obtener todas las relaciones
router.get("/", getRelations);

// obtener acudientes de un estudiante
router.get("/student/:student_id", getRelationsByStudent);

router.delete("/:id", deleteRelation);

export default router;