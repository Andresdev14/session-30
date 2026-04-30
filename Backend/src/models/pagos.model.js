import pool from "../config/db.js";

// 🔹 GET ALL PAYMENTS
export const getAll = async () => {
  const [rows] = await pool.query(`
    SELECT p.*, ar.period, s.first_name, s.last_name, u.first_name as recorded_by_first_name, u.last_name as recorded_by_last_name
    FROM payments p
    JOIN accounts_receivable ar ON p.account_receivable_id = ar.id
    JOIN students s ON ar.student_id = s.id
    LEFT JOIN users u ON p.recorded_by_user_id = u.id
    ORDER BY p.payment_date DESC
  `);
  return rows;
};

// 🔹 GET BY ID
export const getById = async (id) => {
  const [rows] = await pool.query(`
    SELECT p.*, ar.period, s.first_name, s.last_name, u.first_name as recorded_by_first_name, u.last_name as recorded_by_last_name
    FROM payments p
    JOIN accounts_receivable ar ON p.account_receivable_id = ar.id
    JOIN students s ON ar.student_id = s.id
    LEFT JOIN users u ON p.recorded_by_user_id = u.id
    WHERE p.id = ?
  `, [id]);
  return rows[0];
};

// 🔹 GET BY ACCOUNT RECEIVABLE
export const getByAccount = async (accountId) => {
  const [rows] = await pool.query(`
    SELECT p.*, u.first_name as recorded_by_first_name, u.last_name as recorded_by_last_name
    FROM payments p
    LEFT JOIN users u ON p.recorded_by_user_id = u.id
    WHERE p.account_receivable_id = ?
    ORDER BY p.payment_date DESC
  `, [accountId]);
  return rows;
};

// 🔹 CREATE PAYMENT
export const create = async (data) => {
  const { account_receivable_id, recorded_by_user_id, payment_date, amount_paid, payment_method, reference } = data;

  const [result] = await pool.query(
    `INSERT INTO payments
    (id, account_receivable_id, recorded_by_user_id, payment_date, amount_paid, payment_method, reference)
    VALUES (UUID(), ?, ?, ?, ?, ?, ?)`,
    [account_receivable_id, recorded_by_user_id || null, payment_date, amount_paid, payment_method, reference || null]
  );

  // Update outstanding balance in accounts_receivable
  await pool.query(
    "UPDATE accounts_receivable SET outstanding_balance = outstanding_balance - ? WHERE id = ?",
    [amount_paid, account_receivable_id]
  );

  return result;
};

// 🔹 UPDATE PAYMENT
export const update = async (id, data) => {
  const { payment_date, amount_paid, payment_method, reference } = data;

  const [result] = await pool.query(
    `UPDATE payments SET
      payment_date = COALESCE(?, payment_date),
      amount_paid = COALESCE(?, amount_paid),
      payment_method = COALESCE(?, payment_method),
      reference = COALESCE(?, reference)
    WHERE id = ?`,
    [payment_date || null, amount_paid || null, payment_method || null, reference || null, id]
  );

  return result.affectedRows ? { id, ...data } : null;
};

// 🔹 DELETE PAYMENT
export const remove = async (id) => {
  const [result] = await pool.query("DELETE FROM payments WHERE id = ?", [id]);
  return result.affectedRows > 0;
};