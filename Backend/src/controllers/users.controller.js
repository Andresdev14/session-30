import * as userModel from "../models/user.model.js";
import bcrypt from "bcrypt";

// 🔹 GET USERS
export const getUsers = async (req, res) => {
  try {
    const data = await userModel.getAll();
    res.json({ ok: true, data });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// 🔹 GET USER BY ID
export const getUserById = async (req, res) => {
  try {
    const data = await userModel.getById(req.params.id);

    if (!data) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }

    res.json({ ok: true, data });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// 🔹 CREATE USER
export const createUser = async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone, role } = req.body;

    // Validate required fields
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({
        ok: false,
        error: "Missing required fields: email, password, first_name, last_name"
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        ok: false,
        error: "Invalid email format"
      });
    }

    const body = req.body;
    body.password_hash = await bcrypt.hash(password, 10);

    const result = await userModel.create(body);
    res.status(201).json({ ok: true, data: result, message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// 🔹 UPDATE USER
export const updateUser = async (req, res) => {
  try {
    const body = req.body;
    const { id } = req.params;

    if (body.password) {
      body.password_hash = await bcrypt.hash(body.password, 10);
      delete body.password;
    }

    const updated = await userModel.update(id, body);

    if (!updated) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }

    res.json({ ok: true, data: updated });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// 🔹 DELETE USER
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await userModel.remove(id);

    if (!deleted) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }

    res.json({ ok: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};