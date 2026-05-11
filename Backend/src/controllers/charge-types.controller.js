import * as chargeTypesModel from "../models/chargeTypes.model.js";

// 🔹 GET CHARGE TYPES
export const getChargeTypes = async (req, res) => {
  try {
    const data = await chargeTypesModel.getAll();
    res.json({ ok: true, data });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// 🔹 GET CHARGE TYPE BY ID
export const getChargeTypeById = async (req, res) => {
  try {
    const data = await chargeTypesModel.getById(req.params.id);

    if (!data) {
      return res.status(404).json({ ok: false, error: "Charge type not found" });
    }

    res.json({ ok: true, data });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// 🔹 CREATE CHARGE TYPE
export const createChargeType = async (req, res) => {
  try {
    const { name } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        ok: false,
        error: "Missing required field: name"
      });
    }

    const result = await chargeTypesModel.create(req.body);
    res.status(201).json({ ok: true, data: result });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// 🔹 UPDATE CHARGE TYPE
export const updateChargeType = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await chargeTypesModel.update(id, req.body);

    if (!updated) {
      return res.status(404).json({ ok: false, error: "Charge type not found" });
    }

    res.json({ ok: true, data: updated });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// 🔹 DELETE CHARGE TYPE
export const deleteChargeType = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await chargeTypesModel.remove(id);

    if (!deleted) {
      return res.status(404).json({ ok: false, error: "Charge type not found" });
    }

    res.json({ ok: true, message: "Charge type deleted successfully" });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};