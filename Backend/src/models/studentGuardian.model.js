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

// 🔹 OBTENER POR ACUDIENTE
export const getByGuardian = async (guardian_id) => {
  const [rows] = await pool.query(
    `SELECT sg.*, s.first_name, s.last_name, s.student_code
     FROM student_guardians sg
     JOIN students s ON sg.student_id = s.id
     WHERE sg.guardian_id = ?`,
    [guardian_id]
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

// 🔹 ELIMINAR RELACIONES DE ESTUDIANTE
export const removeByStudent = async (student_id) => {
  const [result] = await pool.query(
    "DELETE FROM student_guardians WHERE student_id = ?",
    [student_id]
  );
  return result.affectedRows >= 0;
};

// 🔹 ELIMINAR RELACIONES DE ACUDIENTE
export const removeByGuardian = async (guardian_id) => {
  const [result] = await pool.query(
    "DELETE FROM student_guardians WHERE guardian_id = ?",
    [guardian_id]
  );
  return result.affectedRows >= 0;
};

// 🔹 REEMPLAZAR RELACIONES DE ESTUDIANTE
export const replaceRelationsForStudent = async (student_id, guardianIds) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query("DELETE FROM student_guardians WHERE student_id = ?", [student_id]);

    if (!Array.isArray(guardianIds) || guardianIds.length === 0) {
      await connection.commit();
      return true;
    }

    const uniqueGuardianIds = [...new Set(guardianIds.filter(Boolean))];

    for (let index = 0; index < uniqueGuardianIds.length; index += 1) {
      const guardian_id = uniqueGuardianIds[index];
      if (!guardian_id) continue;
      await connection.query(
        `INSERT INTO student_guardians
        (id, student_id, guardian_id, relationship, is_primary, is_payment_responsible, receives_notifications)
        VALUES (UUID(), ?, ?, ?, ?, ?, ?)`,
        [student_id, guardian_id, null, index === 0 ? 1 : 0, 1, 1]
      );
    }

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// 🔹 REEMPLAZAR RELACIONES DE ACUDIENTE
export const replaceRelationsForGuardian = async (guardian_id, studentIds) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query("DELETE FROM student_guardians WHERE guardian_id = ?", [guardian_id]);

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      await connection.commit();
      return true;
    }

    const uniqueStudentIds = [...new Set(studentIds.filter(Boolean))];

    for (let index = 0; index < uniqueStudentIds.length; index += 1) {
      const student_id = uniqueStudentIds[index];
      if (!student_id) continue;
      await connection.query(
        `INSERT INTO student_guardians
        (id, student_id, guardian_id, relationship, is_primary, is_payment_responsible, receives_notifications)
        VALUES (UUID(), ?, ?, ?, ?, ?, ?)`,
        [student_id, guardian_id, null, index === 0 ? 1 : 0, 1, 1]
      );
    }

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};  