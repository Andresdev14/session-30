import pool from "../config/db.js";

// 🔹 GET ALL GUARDIANS
export const getAll = async () => {
  const [rows] = await pool.query("SELECT * FROM guardians");
  return rows;
};

// 🔹 GET BY ID
export const getById = async (id) => {
  const [rows] = await pool.query(
    "SELECT * FROM guardians WHERE id = ?",
    [id]
  );
  return rows[0];
};

// 🔹 CREATE GUARDIAN
export const create = async (data) => {
  const {
    first_name,
    last_name,
    phone,
    email,
    address,
    relationship
  } = data;

  const [result] = await pool.query(
    `INSERT INTO guardians
    (id, first_name, last_name, phone, email, address, relationship)
    VALUES (UUID(), ?, ?, ?, ?, ?, ?)`,
    [
      first_name,
      last_name,
      phone || null,
      email || null,
      address || null,
      relationship || null
    ]
  );

  return result;
};

// 🔹 UPDATE GUARDIAN
export const update = async (id, data) => {
  const {
    first_name,
    last_name,
    phone,
    email,
    address,
    relationship
  } = data;

  const [result] = await pool.query(
    `UPDATE guardians SET
      first_name = COALESCE(?, first_name),
      last_name = COALESCE(?, last_name),
      phone = COALESCE(?, phone),
      email = COALESCE(?, email),
      address = COALESCE(?, address),
      relationship = COALESCE(?, relationship)
    WHERE id = ?`,
    [
      first_name || null,
      last_name || null,
      phone || null,
      email || null,
      address || null,
      relationship || null,
      id
    ]
  );

  return result.affectedRows ? { id, ...data } : null;
};

// 🔹 DELETE GUARDIAN
export const remove = async (id) => {
  const [result] = await pool.query("DELETE FROM guardians WHERE id = ?", [id]);
  return result.affectedRows > 0;
};