import * as sgModel from "../models/studentGuardian.model.js";

// 🔹 CREAR RELACIÓN
export const createRelation = async (req, res) => {
  try {
    const { student_id, guardian_id, relationship, is_primary, is_payment_responsible, receives_notifications } = req.body;

    // Validate required fields
    if (!student_id || !guardian_id) {
      return res.status(400).json({
        ok: false,
        error: "Missing required fields: student_id, guardian_id"
      });
    }

    const result = await sgModel.create(req.body);
    res.status(201).json({ ok: true, data: result });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
};

// 🔹 OBTENER TODAS LAS RELACIONES
export const getRelations = async (req, res) => {
  try {
    const data = await sgModel.getAll();
    res.json({ ok: true, data });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// 🔹 OBTENER POR ID
export const getRelationById = async (req, res) => {
  try {
    const data = await sgModel.getById(req.params.id);

    if (!data) {
      return res.status(404).json({ ok: false, error: "Relation not found" });
    }

    res.json({ ok: true, data });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// 🔹 OBTENER POR ESTUDIANTE
export const getRelationsByStudent = async (req, res) => {
  try {
    const data = await sgModel.getByStudent(req.params.student_id);
    res.json({ ok: true, data });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// 🔹 ACTUALIZAR RELACIÓN
export const updateRelation = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await sgModel.update(id, req.body);

    if (!updated) {
      return res.status(404).json({ ok: false, error: "Relation not found" });
    }

    res.json({ ok: true, data: updated });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// 🔹 ELIMINAR RELACIÓN
export const deleteRelation = async (req, res) => {
  try {
    const deleted = await sgModel.remove(req.params.id);

    if (!deleted) {
      return res.status(404).json({ ok: false, error: "Relation not found" });
    }

    res.json({ ok: true, message: "Relation deleted successfully" });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};