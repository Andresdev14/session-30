import * as chargeTypesModel from "../models/chargeTypes.model.js";

// 🔹 GET CHARGE TYPES
export const getChargeTypes = async (req, res) => {
  try {
    const data = await chargeTypesModel.getAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 GET CHARGE TYPE BY ID
export const getChargeTypeById = async (req, res) => {
  try {
    const data = await chargeTypesModel.getById(req.params.id);

    if (!data) {
      return res.status(404).json({ error: "Charge type not found" });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 CREATE CHARGE TYPE
export const createChargeType = async (req, res) => {
  try {
    const result = await chargeTypesModel.create(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 UPDATE CHARGE TYPE
export const updateChargeType = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await chargeTypesModel.update(id, req.body);

    if (!updated) {
      return res.status(404).json({ error: "Charge type not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 DELETE CHARGE TYPE
export const deleteChargeType = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await chargeTypesModel.remove(id);

    if (!deleted) {
      return res.status(404).json({ error: "Charge type not found" });
    }

    res.json({ message: "Charge type deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};