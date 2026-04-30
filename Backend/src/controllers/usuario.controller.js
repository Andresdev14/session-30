import pool from "../config/db.js";

export const getUsuarios = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM usuarios");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener usuario" });
  }
};

export const postUsuarios = async (req, res) => {
  try {
    const { nombres, apellidos, correo} = req.body;
    const [result] = await pool.query("INSERT INTO acudientes (id,nombres, apellidos,correo) VALUES (UUID(), ?, ?,?)", [nombres, apellidos,correo]);
    res.json(result);
    res.json({ message: "Usuario creado" });
} catch (error) {
  console.error("ERROR REAL:", error);
  res.status(500).json({ error: error.message });
}
};