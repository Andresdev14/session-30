import * as userModel from "../models/user.model.js";
import bcrypt from "bcrypt";

// 🔹 GET USERS
export const getUsers = async (req, res) => {
  try {
    const data = await userModel.getAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 GET USER BY ID
export const getUserById = async (req, res) => {
  try {
    const data = await userModel.getById(req.params.id);

    if (!data) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 CREATE USER
export const createUser = async (req, res) => {
  try {
    const body = req.body;

    if (!body.email || !body.password || !body.first_name || !body.last_name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    body.password_hash = await bcrypt.hash(body.password, 10);

    const result = await userModel.create(body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 UPDATE USER
export const updateUser = async (req, res) => {
  try {
    const body = req.body;
    const { id } = req.params;

    if (body.password) {
      body.password_hash = await bcrypt.hash(body.password, 10);
    }

    const updated = await userModel.update(id, body);

    if (!updated) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 DELETE USER
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await userModel.remove(id);

    if (!deleted) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};