import pool from "../config/db";

export const getAcudientes = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM acudientes");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener acudientes" });
  }
};

export const postAcudientes = async (req, res) => {
  try {
    const { nombres, apellidos, codigo_Acudiente} = req.body;
    const [result] = await pool.query("INSERT INTO estudiantes (id,nombres, apellidos,codigo_Acudiente) VALUES (UUID(), ?, ?,?)", [nombres, apellidos,codigo_Acudiente]);
    res.json(result);
    res.json({ message: "Acudiente creado" });
} catch (error) {
  console.error("ERROR REAL:", error);
  res.status(500).json({ error: error.message });
}
};