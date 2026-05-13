import * as pagosModel from "../models/payments.model.js";

// 🔹 GET PAYMENTS
export const getPayments = async (req, res) => {
  try {
    const data = await pagosModel.getAll();
    res.json({ ok: true, data });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// 🔹 GET PAYMENT BY ID
export const getPaymentById = async (req, res) => {
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

// 🔹 CREATE PAYMENT
export const createPayment = async (req, res) => {
  try {
    const { account_receivable_id, payment_date, amount_paid, payment_method, reference } = req.body;

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

    const result = await pagosModel.create({
      ...req.body,
      recorded_by_user_id: req.user.id
    });
    res.status(201).json({ ok: true, data: result, message: "Payment recorded and outstanding balance updated" });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// 🔹 DELETE PAYMENT
export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await pagosModel.remove(id);

    if (!deleted) {
      return res.status(404).json({ ok: false, error: "Payment not found" });
    }

    res.json({ ok: true, message: "Payment deleted successfully" });
  } catch (error) {
    console.error("Failed to delete payment:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
};