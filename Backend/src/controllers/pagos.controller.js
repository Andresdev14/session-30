import * as pagosModel from "../models/pagos.model.js";

// 🔹 GET PAGOS
export const getPagos = async (req, res) => {
  try {
    const data = await pagosModel.getAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 GET PAGO BY ID
export const getPagoById = async (req, res) => {
  try {
    const data = await pagosModel.getById(req.params.id);

    if (!data) {
      return res.status(404).json({ error: "Pago not found" });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 GET PAGOS BY ACCOUNT
export const getPagosByAccount = async (req, res) => {
  try {
    const data = await pagosModel.getByAccount(req.params.accountId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 CREATE PAGO
export const createPago = async (req, res) => {
  try {
    const result = await pagosModel.create(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 UPDATE PAGO
export const updatePago = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await pagosModel.update(id, req.body);

    if (!updated) {
      return res.status(404).json({ error: "Pago not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 DELETE PAGO
export const deletePago = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await pagosModel.remove(id);

    if (!deleted) {
      return res.status(404).json({ error: "Pago not found" });
    }

    res.json({ message: "Pago deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};