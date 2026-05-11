import * as accountsModel from "../models/accounts.model.js";

// 🔹 GET ACCOUNTS
export const getAccounts = async (req, res) => {
  try {
    const data = await accountsModel.getAll();
    res.json({ ok: true, data });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// 🔹 GET ACCOUNT BY ID
export const getAccountById = async (req, res) => {
  try {
    const data = await accountsModel.getById(req.params.id);

    if (!data) {
      return res.status(404).json({ ok: false, error: "Account not found" });
    }

    res.json({ ok: true, data });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// 🔹 GET ACCOUNTS BY STUDENT
export const getAccountsByStudent = async (req, res) => {
  try {
    const data = await accountsModel.getByStudent(req.params.studentId);
    res.json({ ok: true, data });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// 🔹 CREATE ACCOUNT
export const createAccount = async (req, res) => {
  try {
    const { student_id, charge_type_id, period, due_date, amount } = req.body;

    // Validate required fields
    if (!student_id || !charge_type_id || !period || !due_date || !amount) {
      return res.status(400).json({
        ok: false,
        error: "Missing required fields: student_id, charge_type_id, period, due_date, amount"
      });
    }

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        ok: false,
        error: "Amount must be a positive number"
      });
    }

    const result = await accountsModel.create(req.body);
    res.status(201).json({ ok: true, data: result });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// 🔹 UPDATE ACCOUNT
export const updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await accountsModel.update(id, req.body);

    if (!updated) {
      return res.status(404).json({ ok: false, error: "Account not found" });
    }

    res.json({ ok: true, data: updated });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// 🔹 DELETE ACCOUNT
export const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await accountsModel.remove(id);

    if (!deleted) {
      return res.status(404).json({ ok: false, error: "Account not found" });
    }

    res.json({ ok: true, message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};