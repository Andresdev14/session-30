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

export const postEstudiante = async (req, res) => {
  try {
    const { nombres, apellidos, codigo_estudiante} = req.body;
    const [result] = await pool.query("INSERT INTO estudiantes (id,nombres, apellidos,codigo_estudiante) VALUES (UUID(), ?, ?,?)", [nombres, apellidos,codigo_estudiante]);
    res.json(result);
    res.json({ message: "Estudiante creado" });
} catch (error) {
  console.error("ERROR REAL:", error);
  res.status(500).json({ error: error.message });
}
};