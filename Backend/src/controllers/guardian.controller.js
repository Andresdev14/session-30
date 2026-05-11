import * as guardianModel from "../models/guardian.model.js";

// GET
export const getGuardians = async (req, res) => {
  try {
    const data = await guardianModel.getAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// GET BY ID
export const getGuardianById = async (req, res) => {
  try {
    const data = await guardianModel.getById(req.params.id);

    if (!data) {
      return res.status(404).json({ ok: false, error: "Guardian not found" });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// POST
export const createGuardian = async (req, res) => {
  try {
    const { first_name, last_name, phone, email, address } = req.body;

    // Validate required fields
    if (!first_name || !last_name) {
      return res.status(400).json({
        ok: false,
        error: "Missing required fields: first_name, last_name"
      });
    }

    const result = await guardianModel.create(req.body);
    res.status(201).json({ ok: true, data: result });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// PUT
export const updateGuardian = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await guardianModel.update(id, req.body);

    if (!updated) {
      return res.status(404).json({ ok: false, error: "Guardian not found" });
    }

    res.json({ ok: true, data: updated });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// DELETE
export const deleteGuardian = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await guardianModel.remove(id);

    if (!deleted) {
      return res.status(404).json({ ok: false, error: "Guardian not found" });
    }

    res.json({ ok: true, message: "Guardian deleted successfully" });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};