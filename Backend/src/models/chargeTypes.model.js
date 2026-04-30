import pool from "../config/db.js";

// 🔹 GET ALL CHARGE TYPES
export const getAll = async () => {
  const [rows] = await pool.query("SELECT * FROM charge_types WHERE is_active = 1");
  return rows;
};

// 🔹 GET BY ID
export const getById = async (id) => {
  const [rows] = await pool.query(
    "SELECT * FROM charge_types WHERE id = ? AND is_active = 1",
    [id]
  );
  return rows[0];
};

// 🔹 CREATE CHARGE TYPE
export const create = async (data) => {
  const { name, description, is_active } = data;

  const [result] = await pool.query(
    `INSERT INTO charge_types
    (id, name, description, is_active)
    VALUES (UUID(), ?, ?, ?)`,
    [name, description || null, is_active ?? 1]
  );

  return result;
};

// 🔹 UPDATE CHARGE TYPE
export const update = async (id, data) => {
  const { name, description, is_active } = data;

  const [result] = await pool.query(
    `UPDATE charge_types SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      is_active = COALESCE(?, is_active)
    WHERE id = ?`,
    [name || null, description || null, is_active ?? null, id]
  );

  return result.affectedRows ? { id, ...data } : null;
};

// 🔹 DELETE CHARGE TYPE (soft delete)
export const remove = async (id) => {
  const [result] = await pool.query(
    "UPDATE charge_types SET is_active = 0 WHERE id = ?",
    [id]
  );
  return result.affectedRows > 0;
};