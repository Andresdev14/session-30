import pool from "../config/db.js";

// 🔹 CREAR RELACIÓN
export const create = async (data) => {
  const {
    student_id,
    guardian_id,
    relationship,
    is_primary,
    is_payment_responsible,
    receives_notifications
  } = data;

  const [result] = await pool.query(
    `INSERT INTO student_guardians
    (id, student_id, guardian_id, relationship, is_primary, is_payment_responsible, receives_notifications)
    VALUES (UUID(), ?, ?, ?, ?, ?, ?)`,
    [
      student_id,
      guardian_id,
      relationship || null,
      is_primary ?? 0,
      is_payment_responsible ?? 1,
      receives_notifications ?? 1
    ]
  );

  return result;
};

// 🔹 OBTENER RELACIONES DE UN ESTUDIANTE
export const getByStudent = async (student_id) => {
  const [rows] = await pool.query(
    `SELECT sg.*, g.first_name, g.last_name, g.phone
     FROM student_guardians sg
     JOIN guardians g ON sg.guardian_id = g.id
     WHERE sg.student_id = ?`,
    [student_id]
  );

  return rows;
};

// 🔹 OBTENER TODAS LAS RELACIONES
export const getAll = async () => {
  const [rows] = await pool.query(
    `SELECT sg.*, g.first_name AS guardian_first_name, g.last_name AS guardian_last_name, g.phone AS guardian_phone
     FROM student_guardians sg
     JOIN guardians g ON sg.guardian_id = g.id`
  );
  return rows;
};

// 🔹 ELIMINAR RELACIÓN
export const remove = async (id) => {
  const [result] = await pool.query(
    "DELETE FROM student_guardians WHERE id = ?",
    [id]
  );
  return result.affectedRows > 0;
};  