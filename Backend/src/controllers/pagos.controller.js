import * as pagosModel from "../models/pagos.model.js";

// 🔹 GET PAGOS
export const getPagos = async (req, res) => {
  try {
    const data = await pagosModel.getAll();
    res.json({ ok: true, data });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// 🔹 GET PAGO BY ID
export const getPagoById = async (req, res) => {
  try {
    const data = await pagosModel.getById(req.params.id);

    if (!data) {
      return res.status(404).json({ ok: false, error: "Payment not found" });
    }

    res.json({ ok: true, data });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// 🔹 GET PAGOS BY ACCOUNT
export const getPagosByAccount = async (req, res) => {
  try {
    const data = await pagosModel.getByAccount(req.params.accountId);
    res.json({ ok: true, data });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// 🔹 CREATE PAGO
export const createPago = async (req, res) => {
  try {
    const { account_receivable_id, recorded_by_user_id, payment_date, amount_paid, payment_method } = req.body;

    // Validate required fields
    if (!account_receivable_id || !payment_date || !amount_paid || !payment_method) {
      return res.status(400).json({
        ok: false,
        error: "Missing required fields: account_receivable_id, payment_date, amount_paid, payment_method"
      });
    }

    if (isNaN(amount_paid) || amount_paid <= 0) {
      return res.status(400).json({
        ok: false,
        error: "Amount paid must be a positive number"
      });
    }

    const result = await pagosModel.create(req.body);
    res.status(201).json({ ok: true, data: result, message: "Payment recorded and outstanding balance updated" });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// 🔹 UPDATE PAGO
export const updatePago = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await pagosModel.update(id, req.body);

    if (!updated) {
      return res.status(404).json({ ok: false, error: "Payment not found" });
    }

    res.json({ ok: true, data: updated });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// 🔹 DELETE PAGO
export const deletePago = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await pagosModel.remove(id);

    if (!deleted) {
      return res.status(404).json({ ok: false, error: "Payment not found" });
    }

    res.json({ ok: true, message: "Payment deleted successfully" });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};