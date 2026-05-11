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

  // Check for duplicate (student_id, guardian_id)
  const [existing] = await pool.query(
    `SELECT id FROM student_guardians WHERE student_id = ? AND guardian_id = ?`,
    [student_id, guardian_id]
  );

  if (existing.length > 0) {
    throw new Error("This student-guardian relationship already exists");
  }

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
    `SELECT sg.*, g.first_name AS guardian_first_name, g.last_name AS guardian_last_name, g.phone AS guardian_phone,
            s.first_name AS student_first_name, s.last_name AS student_last_name
     FROM student_guardians sg
     JOIN guardians g ON sg.guardian_id = g.id
     JOIN students s ON sg.student_id = s.id`
  );
  return rows;
};

// 🔹 GET BY ID
export const getById = async (id) => {
  const [rows] = await pool.query(
    `SELECT sg.*, g.first_name, g.last_name, g.phone, s.first_name AS student_first_name, s.last_name AS student_last_name
     FROM student_guardians sg
     JOIN guardians g ON sg.guardian_id = g.id
     JOIN students s ON sg.student_id = s.id
     WHERE sg.id = ?`,
    [id]
  );
  return rows[0];
};

// 🔹 UPDATE RELACIÓN
export const update = async (id, data) => {
  const {
    relationship,
    is_primary,
    is_payment_responsible,
    receives_notifications
  } = data;

  const [result] = await pool.query(
    `UPDATE student_guardians SET
      relationship = COALESCE(?, relationship),
      is_primary = COALESCE(?, is_primary),
      is_payment_responsible = COALESCE(?, is_payment_responsible),
      receives_notifications = COALESCE(?, receives_notifications)
    WHERE id = ?`,
    [
      relationship || null,
      is_primary ?? null,
      is_payment_responsible ?? null,
      receives_notifications ?? null,
      id
    ]
  );

  return result.affectedRows ? { id, ...data } : null;
};

// 🔹 ELIMINAR RELACIÓN
export const remove = async (id) => {
  const [result] = await pool.query(
    "DELETE FROM student_guardians WHERE id = ?",
    [id]
  );
  return result.affectedRows > 0;
};  