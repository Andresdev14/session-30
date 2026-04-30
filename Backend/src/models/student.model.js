import pool from "../config/db.js";

// 🔹 GET ALL
export const getAll = async () => {
  const [rows] = await pool.query("SELECT * FROM students");
  return rows;
};

// 🔹 GET BY ID
export const getById = async (id) => {
  const [rows] = await pool.query(
    "SELECT * FROM students WHERE id = ?",
    [id]
  );
  return rows[0];
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

  const [result] = await pool.query(
    `INSERT INTO students
    (id, student_code, first_name, last_name, document_type, document_number, birth_date, grade, school_year, status)
    VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
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

  return result;
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
  const [result] = await pool.query("DELETE FROM students WHERE id = ?", [id]);
  return result.affectedRows > 0;
};