import pool from "../config/db.js";

// 🔹 GET ALL USERS
export const getAll = async () => {
  const [rows] = await pool.query("SELECT * FROM users");
  return rows;
};

// 🔹 GET BY ID
export const getById = async (id) => {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE id = ?",
    [id]
  );
  return rows[0];
};

// 🔹 CREATE USER
export const create = async (data) => {
  const {
    first_name,
    last_name,
    email,
    password_hash,
    phone,
    role,
    is_active
  } = data;

  const [result] = await pool.query(
    `INSERT INTO users 
    (id, first_name, last_name, email, password_hash, phone, role, is_active)
    VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)`,
    [
      first_name,
      last_name,
      email,
      password_hash,
      phone || null,
      role || "admin",
      is_active ?? 1
    ]
  );

  return result;
};

// 🔹 UPDATE USER
export const update = async (id, data) => {
  const {
    first_name,
    last_name,
    email,
    password_hash,
    phone,
    role,
    is_active
  } = data;

  const [result] = await pool.query(
    `UPDATE users SET
      first_name = ?,
      last_name = ?,
      email = ?,
      password_hash = COALESCE(?, password_hash),
      phone = ?,
      role = ?,
      is_active = ?
    WHERE id = ?`,
    [
      first_name,
      last_name,
      email,
      password_hash || null,
      phone || null,
      role || null,
      is_active ?? null,
      id
    ]
  );

  return result.affectedRows ? { id, ...data } : null;
};

// 🔹 DELETE USER
export const remove = async (id) => {
  const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);
  return result.affectedRows > 0;
};