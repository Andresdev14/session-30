import pool from "../config/db.js";

export const getDashboard = async (limit = 5) => {
  const [[studentsRow]] = await pool.query("SELECT COUNT(*) AS total_students FROM students");
  const [[guardiansRow]] = await pool.query("SELECT COUNT(*) AS total_guardians FROM guardians");
  const [[paymentsRow]] = await pool.query("SELECT COUNT(*) AS total_payments FROM payments");
  const [[pendingRow]] = await pool.query("SELECT COUNT(*) AS pending_accounts FROM accounts_receivable WHERE status = 'pending'");

  const [recentStudentsRows] = await pool.query(
    `SELECT id, first_name, last_name, created_at FROM students ORDER BY created_at DESC LIMIT ?`,
    [limit]
  );

  const [recentPaymentsRows] = await pool.query(
    `SELECT id, amount_paid, payment_method, payment_date FROM payments ORDER BY payment_date DESC LIMIT ?`,
    [limit]
  );

  return {
    total_students: studentsRow.total_students || 0,
    total_guardians: guardiansRow.total_guardians || 0,
    total_payments: paymentsRow.total_payments || 0,
    pending_accounts: pendingRow.pending_accounts || 0,
    recent_students: recentStudentsRows,
    recent_payments: recentPaymentsRows,
  };
};

export const getStats = async () => {
  const dashboard = await getDashboard(5);
  return {
    totalStudents: dashboard.total_students,
    totalGuardians: dashboard.total_guardians,
    totalPayments: dashboard.total_payments,
    pendingAccounts: dashboard.pending_accounts,
  };
};

export const getRecentActivity = async (limit = 10) => {
  const [recentStudentsRows] = await pool.query(
    `SELECT id, first_name, last_name, created_at FROM students ORDER BY created_at DESC LIMIT ?`,
    [limit]
  );

  const [recentPaymentsRows] = await pool.query(
    `SELECT id, amount_paid, payment_method, payment_date FROM payments ORDER BY payment_date DESC LIMIT ?`,
    [limit]
  );

  return {
    recent_students: recentStudentsRows,
    recent_payments: recentPaymentsRows,
  };
};