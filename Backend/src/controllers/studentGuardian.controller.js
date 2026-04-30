import * as sgModel from "../models/studentGuardian.model.js";

// 🔹 CREAR RELACIÓN
export const createRelation = async (req, res) => {
  try {
    const result = await sgModel.create(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 OBTENER TODAS LAS RELACIONES
export const getRelations = async (req, res) => {
  try {
    const data = await sgModel.getAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 OBTENER POR ESTUDIANTE
export const getRelationsByStudent = async (req, res) => {
  try {
    const data = await sgModel.getByStudent(req.params.student_id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 ELIMINAR RELACIÓN
export const deleteRelation = async (req, res) => {
  try {
    const deleted = await sgModel.remove(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Relation not found" });
    }

    res.json({ message: "Relation deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};