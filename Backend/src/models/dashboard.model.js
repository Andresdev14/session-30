import pool from "../config/db.js";

// 🔹 GET DASHBOARD STATS
export const getStats = async () => {
  // Total students
  const [studentsResult] = await pool.query("SELECT COUNT(*) as total FROM students WHERE status = 'active'");
  const totalStudents = studentsResult[0].total;

  // Total guardians
  const [guardiansResult] = await pool.query("SELECT COUNT(*) as total FROM guardians");
  const totalGuardians = guardiansResult[0].total;

  // Total pending accounts
  const [pendingAccountsResult] = await pool.query("SELECT COUNT(*) as total FROM accounts_receivable WHERE status = 'pending'");
  const totalPendingAccounts = pendingAccountsResult[0].total;

  // Total outstanding balance
  const [outstandingResult] = await pool.query("SELECT SUM(outstanding_balance) as total FROM accounts_receivable WHERE status != 'paid'");
  const totalOutstanding = outstandingResult[0].total || 0;

  // Recent payments (last 30 days)
  const [recentPaymentsResult] = await pool.query(`
    SELECT COUNT(*) as total, SUM(amount_paid) as amount
    FROM payments
    WHERE payment_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  `);
  const recentPayments = {
    count: recentPaymentsResult[0].total,
    amount: recentPaymentsResult[0].amount || 0
  };

  return {
    totalStudents,
    totalGuardians,
    totalPendingAccounts,
    totalOutstanding,
    recentPayments
  };
};

// 🔹 GET RECENT ACTIVITY
export const getRecentActivity = async (limit = 10) => {
  const [rows] = await pool.query(`
    SELECT
      'payment' as type,
      p.id,
      p.payment_date as date,
      CONCAT('Payment of $', p.amount_paid, ' for ', s.first_name, ' ', s.last_name) as description,
      p.amount_paid as amount
    FROM payments p
    JOIN accounts_receivable ar ON p.account_receivable_id = ar.id
    JOIN students s ON ar.student_id = s.id
    ORDER BY p.payment_date DESC
    LIMIT ?

    UNION ALL

    SELECT
      'account' as type,
      ar.id,
      ar.created_at as date,
      CONCAT('New charge for ', s.first_name, ' ', s.last_name, ' - ', ct.name) as description,
      ar.amount as amount
    FROM accounts_receivable ar
    JOIN students s ON ar.student_id = s.id
    JOIN charge_types ct ON ar.charge_type_id = ct.id
    ORDER BY ar.created_at DESC
    LIMIT ?
  `, [limit, limit]);

  return rows;
};