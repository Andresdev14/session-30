import { randomUUID } from "crypto";
import pool from "../config/db.js";

const attachStudents = async (guardians) => {
  if (!guardians || guardians.length === 0) return guardians;
  const guardianIds = guardians.map((guardian) => guardian.id);
  const placeholders = guardianIds.map(() => "?").join(",");
  const [relations] = await pool.query(
    `SELECT sg.guardian_id, s.id AS student_id, s.student_code, s.first_name, s.last_name,
            sg.relationship, sg.is_primary, sg.is_payment_responsible, sg.receives_notifications
     FROM student_guardians sg
     JOIN students s ON sg.student_id = s.id
     WHERE sg.guardian_id IN (${placeholders})`,
    guardianIds
  );

  const relationMap = {};
  relations.forEach((relation) => {
    relationMap[relation.guardian_id] = relationMap[relation.guardian_id] || [];
    relationMap[relation.guardian_id].push(relation);
  });

  return guardians.map((guardian) => ({
    ...guardian,
    students: relationMap[guardian.id] || []
  }));
};

// 🔹 GET ALL GUARDIANS
export const getAll = async () => {
  const [rows] = await pool.query("SELECT * FROM guardians");
  return attachStudents(rows);
};

// 🔹 GET BY ID
export const getById = async (id) => {
  const [rows] = await pool.query(
    "SELECT * FROM guardians WHERE id = ?",
    [id]
  );
  const guardian = rows[0];
  if (!guardian) return null;

  const [relations] = await pool.query(
    `SELECT sg.guardian_id, s.id AS student_id, s.student_code, s.first_name, s.last_name,
            sg.relationship, sg.is_primary, sg.is_payment_responsible, sg.receives_notifications
     FROM student_guardians sg
     JOIN students s ON sg.student_id = s.id
     WHERE sg.guardian_id = ?`,
    [id]
  );

  return {
    ...guardian,
    students: relations
  };
};

// 🔹 CREATE GUARDIAN
export const create = async (data) => {
  const {
    first_name,
    last_name,
    phone,
    email,
    address,
    whatsapp_active
  } = data;

  const id = randomUUID();
  await pool.query(
    `INSERT INTO guardians
    (id, first_name, last_name, phone, email, address, whatsapp_active)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      first_name,
      last_name,
      phone || null,
      email || null,
      address || null,
      whatsapp_active ?? 0
    ]
  );

  return {
    id,
    first_name,
    last_name,
    phone: phone || null,
    email: email || null,
    address: address || null,
    whatsapp_active: whatsapp_active ?? 0
  };
};

// 🔹 UPDATE GUARDIAN
export const update = async (id, data) => {
  const {
    first_name,
    last_name,
    phone,
    email,
    address,
    whatsapp_active
  } = data;

  const [result] = await pool.query(
    `UPDATE guardians SET
      first_name = COALESCE(?, first_name),
      last_name = COALESCE(?, last_name),
      phone = COALESCE(?, phone),
      email = COALESCE(?, email),
      address = COALESCE(?, address),
      whatsapp_active = COALESCE(?, whatsapp_active)
    WHERE id = ?`,
    [
      first_name || null,
      last_name || null,
      phone || null,
      email || null,
      address || null,
      whatsapp_active ?? null,
      id
    ]
  );

  return result.affectedRows ? { id, ...data } : null;
};

// 🔹 DELETE GUARDIAN
export const remove = async (id) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query("DELETE FROM whatsapp_notifications WHERE guardian_id = ?", [id]);
    await connection.query("DELETE FROM student_guardians WHERE guardian_id = ?", [id]);

    const [result] = await connection.query("DELETE FROM guardians WHERE id = ?", [id]);
    await connection.commit();
    return result.affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};