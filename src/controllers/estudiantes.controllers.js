import pool from "../config/db.js";

export const getEstudiantes = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM estudiantes");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener estudiantes" });
  }
};