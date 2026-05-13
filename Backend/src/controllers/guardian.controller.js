import * as guardianModel from "../models/guardian.model.js";
import * as studentGuardianModel from "../models/studentGuardian.model.js";

// GET ALL GUARDIANS
export const getGuardians = async (req, res) => {
  try {
    const data = await guardianModel.getAll();
    res.json({ ok: true, data });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// GET GUARDIAN BY ID
export const getGuardianById = async (req, res) => {
  try {
    const data = await guardianModel.getById(req.params.id);

    if (!data) {
      return res.status(404).json({ ok: false, error: "Guardian not found" });
    }

    res.json({ ok: true, data });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// CREATE GUARDIAN
export const createGuardian = async (req, res) => {
  try {
    const { first_name, last_name, phone, email, address, whatsapp_active } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !phone) {
      return res.status(400).json({
        ok: false,
        error: "Missing required fields: first_name, last_name, phone"
      });
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        ok: false,
        error: "Invalid email format"
      });
    }

    const result = await guardianModel.create(req.body);
    if (Array.isArray(req.body.student_ids)) {
      await studentGuardianModel.replaceRelationsForGuardian(result.id, req.body.student_ids);
    }
    res.status(201).json({ ok: true, data: result });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// UPDATE GUARDIAN
export const updateGuardian = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        ok: false,
        error: "Invalid email format"
      });
    }

    const updated = await guardianModel.update(id, req.body);

    if (!updated) {
      return res.status(404).json({ ok: false, error: "Guardian not found" });
    }

    if (Array.isArray(req.body.student_ids)) {
      await studentGuardianModel.replaceRelationsForGuardian(id, req.body.student_ids);
    }

    res.json({ ok: true, data: updated });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// DELETE GUARDIAN
export const deleteGuardian = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await guardianModel.remove(id);

    if (!deleted) {
      return res.status(404).json({ ok: false, error: "Guardian not found" });
    }

    res.json({ ok: true, message: "Guardian deleted successfully" });
  } catch (error) {
    console.error("Failed to delete guardian:", error);
    const message = error.message.includes("Cannot delete")
      ? "No se puede eliminar este acudiente porque tiene registros relacionados. Elimina primero las relaciones o notificaciones asociadas."
      : error.message;
    res.status(500).json({ ok: false, error: message });
  }
};