import pool from "../config/db.js";

// 🔹 GET ALL ACCOUNTS RECEIVABLE
export const getAll = async () => {
  const [rows] = await pool.query(`
    SELECT ar.*, s.first_name, s.last_name, ct.name as charge_type_name
    FROM accounts_receivable ar
    JOIN students s ON ar.student_id = s.id
    JOIN charge_types ct ON ar.charge_type_id = ct.id
    ORDER BY ar.due_date ASC
  `);
  return rows;
};

// 🔹 GET PENDING ACCOUNTS (outstanding_balance > 0)
export const getPending = async () => {
  const [rows] = await pool.query(`
    SELECT ar.*, s.first_name, s.last_name, ct.name as charge_type_name
    FROM accounts_receivable ar
    JOIN students s ON ar.student_id = s.id
    JOIN charge_types ct ON ar.charge_type_id = ct.id
    WHERE ar.outstanding_balance > 0
    ORDER BY ar.due_date ASC
  `);
  return rows;
};

// 🔹 GET BY ID
export const getById = async (id) => {
  const [rows] = await pool.query(`
    SELECT ar.*, s.first_name, s.last_name, ct.name as charge_type_name
    FROM accounts_receivable ar
    JOIN students s ON ar.student_id = s.id
    JOIN charge_types ct ON ar.charge_type_id = ct.id
    WHERE ar.id = ?
  `, [id]);
  return rows[0];
};

// 🔹 GET BY STUDENT
export const getByStudent = async (studentId) => {
  const [rows] = await pool.query(`
    SELECT ar.*, ct.name as charge_type_name
    FROM accounts_receivable ar
    JOIN charge_types ct ON ar.charge_type_id = ct.id
    WHERE ar.student_id = ?
    ORDER BY ar.due_date ASC
  `, [studentId]);
  return rows;
};

// 🔹 CREATE ACCOUNT RECEIVABLE
export const create = async (data) => {
  const { student_id, charge_type_id, period, due_date, amount, outstanding_balance, status } = data;

  const [result] = await pool.query(
    `INSERT INTO accounts_receivable
    (id, student_id, charge_type_id, period, due_date, amount, outstanding_balance, status)
    VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)`,
    [student_id, charge_type_id, period, due_date, amount, outstanding_balance || amount, status || "pending"]
  );

  return result;
};

// 🔹 UPDATE ACCOUNT RECEIVABLE
export const update = async (id, data) => {
  const { period, due_date, amount, outstanding_balance, status } = data;

  const [result] = await pool.query(
    `UPDATE accounts_receivable SET
      period = COALESCE(?, period),
      due_date = COALESCE(?, due_date),
      amount = COALESCE(?, amount),
      outstanding_balance = COALESCE(?, outstanding_balance),
      status = COALESCE(?, status)
    WHERE id = ?`,
    [period || null, due_date || null, amount || null, outstanding_balance || null, status || null, id]
  );

  return result.affectedRows ? { id, ...data } : null;
};

// 🔹 DELETE ACCOUNT RECEIVABLE
export const remove = async (id) => {
  const [result] = await pool.query("DELETE FROM accounts_receivable WHERE id = ?", [id]);
  return result.affectedRows > 0;
};