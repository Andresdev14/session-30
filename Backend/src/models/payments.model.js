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

  // Check current outstanding balance
  const [accountRows] = await pool.query(
    "SELECT outstanding_balance FROM accounts_receivable WHERE id = ?",
    [account_receivable_id]
  );

  if (accountRows.length === 0) {
    throw new Error("Account receivable not found");
  }

  const currentBalance = parseFloat(accountRows[0].outstanding_balance);

  if (amount_paid > currentBalance) {
    throw new Error("Payment amount exceeds outstanding balance");
  }

  const [result] = await pool.query(
    `INSERT INTO payments
    (id, account_receivable_id, recorded_by_user_id, payment_date, amount_paid, payment_method, reference)
    VALUES (UUID(), ?, ?, ?, ?, ?, ?)`,
    [account_receivable_id, recorded_by_user_id || null, payment_date, amount_paid, payment_method, reference || null]
  );

  // Update outstanding balance
  const newBalance = currentBalance - amount_paid;
  await pool.query(
    "UPDATE accounts_receivable SET outstanding_balance = ? WHERE id = ?",
    [newBalance, account_receivable_id]
  );

  // If balance is zero or less, mark as paid
  if (newBalance <= 0) {
    await pool.query(
      "UPDATE accounts_receivable SET status = 'paid' WHERE id = ?",
      [account_receivable_id]
    );
  }

  return result;
};

// 🔹 DELETE PAYMENT
export const remove = async (id) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [paymentRows] = await connection.query(
      "SELECT account_receivable_id, amount_paid FROM payments WHERE id = ?",
      [id]
    );

    if (paymentRows.length === 0) {
      await connection.commit();
      return false;
    }

    const { account_receivable_id, amount_paid } = paymentRows[0];
    await connection.query("DELETE FROM payments WHERE id = ?", [id]);

    await connection.query(
      "UPDATE accounts_receivable SET outstanding_balance = outstanding_balance + ? WHERE id = ?",
      [amount_paid, account_receivable_id]
    );

    await connection.query(
      "UPDATE accounts_receivable SET status = 'pending' WHERE id = ? AND outstanding_balance > 0",
      [account_receivable_id]
    );

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};