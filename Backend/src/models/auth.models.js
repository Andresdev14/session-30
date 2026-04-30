import pool from "../config/db.js";

export const findUserByEmail = async (email) => {
  const [rows] = await pool.query(
    "SELECT id, first_name, last_name, email, password_hash, role FROM users WHERE email = ?",
    [email]
  );
  return rows[0];
};
