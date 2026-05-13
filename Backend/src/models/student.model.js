import { randomUUID } from "crypto";
import pool from "../config/db.js";

const attachGuardians = async (students) => {
  if (!students || students.length === 0) return students;
  const studentIds = students.map((student) => student.id);
  const placeholders = studentIds.map(() => "?").join(",");
  const [relations] = await pool.query(
    `SELECT sg.student_id, g.id AS guardian_id, g.first_name, g.last_name, g.phone,
            sg.relationship, sg.is_primary, sg.is_payment_responsible, sg.receives_notifications
     FROM student_guardians sg
     JOIN guardians g ON sg.guardian_id = g.id
     WHERE sg.student_id IN (${placeholders})`,
    studentIds
  );

  const relationMap = {};
  relations.forEach((relation) => {
    relationMap[relation.student_id] = relationMap[relation.student_id] || [];
    relationMap[relation.student_id].push(relation);
  });

  return students.map((student) => ({
    ...student,
    guardians: relationMap[student.id] || []
  }));
};

// 🔹 GET ALL
export const getAll = async () => {
  const [rows] = await pool.query("SELECT * FROM students");
  return attachGuardians(rows);
};

// 🔹 GET BY ID
export const getById = async (id) => {
  const [rows] = await pool.query(
    "SELECT * FROM students WHERE id = ?",
    [id]
  );
  const student = rows[0];
  if (!student) return null;

  const [relations] = await pool.query(
    `SELECT sg.student_id, g.id AS guardian_id, g.first_name, g.last_name, g.phone,
            sg.relationship, sg.is_primary, sg.is_payment_responsible, sg.receives_notifications
     FROM student_guardians sg
     JOIN guardians g ON sg.guardian_id = g.id
     WHERE sg.student_id = ?`,
    [id]
  );

  return {
    ...student,
    guardians: relations
  };
};

// 🔹 CREATE
export const create = async (data) => {
  const {
    student_code,
    first_name,
    last_name,
    document_type,
    document_number,
    birth_date,
    grade,
    school_year,
    status
  } = data;

  const id = randomUUID();
  await pool.query(
    `INSERT INTO students
    (id, student_code, first_name, last_name, document_type, document_number, birth_date, grade, school_year, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      student_code,
      first_name,
      last_name,
      document_type || null,
      document_number || null,
      birth_date || null,
      grade || null,
      school_year || null,
      status || "active"
    ]
  );

  return {
    id,
    student_code,
    first_name,
    last_name,
    document_type: document_type || null,
    document_number: document_number || null,
    birth_date: birth_date || null,
    grade: grade || null,
    school_year: school_year || null,
    status: status || "active"
  };
};

// 🔹 UPDATE
export const update = async (id, data) => {
  const {
    student_code,
    first_name,
    last_name,
    document_type,
    document_number,
    birth_date,
    grade,
    school_year,
    status
  } = data;

  const [result] = await pool.query(
    `UPDATE students SET
      student_code = COALESCE(?, student_code),
      first_name = COALESCE(?, first_name),
      last_name = COALESCE(?, last_name),
      document_type = COALESCE(?, document_type),
      document_number = COALESCE(?, document_number),
      birth_date = COALESCE(?, birth_date),
      grade = COALESCE(?, grade),
      school_year = COALESCE(?, school_year),
      status = COALESCE(?, status)
    WHERE id = ?`,
    [
      student_code || null,
      first_name || null,
      last_name || null,
      document_type || null,
      document_number || null,
      birth_date || null,
      grade || null,
      school_year || null,
      status || null,
      id
    ]
  );

  return result.affectedRows ? { id, ...data } : null;
};

// 🔹 DELETE
export const remove = async (id) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query("DELETE FROM whatsapp_notifications WHERE student_id = ?", [id]);
    await connection.query("DELETE FROM attendance WHERE student_id = ?", [id]);
    await connection.query("DELETE FROM student_guardians WHERE student_id = ?", [id]);

    const [accountRows] = await connection.query(
      "SELECT id FROM accounts_receivable WHERE student_id = ?",
      [id]
    );

    if (accountRows.length > 0) {
      const accountIds = accountRows.map((row) => row.id);
      const placeholders = accountIds.map(() => "?").join(",");
      await connection.query(
        `DELETE FROM payments WHERE account_receivable_id IN (${placeholders})`,
        accountIds
      );
      await connection.query(
        `DELETE FROM accounts_receivable WHERE student_id = ?`,
        [id]
      );
    }

    const [result] = await connection.query("DELETE FROM students WHERE id = ?", [id]);
    await connection.commit();
    return result.affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};