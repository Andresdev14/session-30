import * as guardianModel from "../models/guardian.model.js";

// GET
export const getGuardians = async (req, res) => {
  try {
    const data = await guardianModel.getAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET BY ID
export const getGuardianById = async (req, res) => {
  try {
    const data = await guardianModel.getById(req.params.id);

    if (!data) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST
export const createGuardian = async (req, res) => {
  try {
    const result = await guardianModel.create(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT
export const updateGuardian = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await guardianModel.update(id, req.body);

    if (!updated) {
      return res.status(404).json({ error: "Guardian not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE
export const deleteGuardian = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await guardianModel.remove(id);

    if (!deleted) {
      return res.status(404).json({ error: "Guardian not found" });
    }

    res.json({ message: "Guardian deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};