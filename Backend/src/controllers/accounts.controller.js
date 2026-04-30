import * as accountsModel from "../models/accounts.model.js";

// 🔹 GET ACCOUNTS
export const getAccounts = async (req, res) => {
  try {
    const data = await accountsModel.getAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 GET ACCOUNT BY ID
export const getAccountById = async (req, res) => {
  try {
    const data = await accountsModel.getById(req.params.id);

    if (!data) {
      return res.status(404).json({ error: "Account not found" });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 GET ACCOUNTS BY STUDENT
export const getAccountsByStudent = async (req, res) => {
  try {
    const data = await accountsModel.getByStudent(req.params.studentId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 CREATE ACCOUNT
export const createAccount = async (req, res) => {
  try {
    const result = await accountsModel.create(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 UPDATE ACCOUNT
export const updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await accountsModel.update(id, req.body);

    if (!updated) {
      return res.status(404).json({ error: "Account not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 DELETE ACCOUNT
export const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await accountsModel.remove(id);

    if (!deleted) {
      return res.status(404).json({ error: "Account not found" });
    }

    res.json({ message: "Account deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};