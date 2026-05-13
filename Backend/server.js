import dotenv from 'dotenv';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: `${__dirname}/.env` });

import app from "./src/app.js";
import pool from "./src/config/db.js";

const PORT = 3000;
pool.getConnection()
  .then(connection => {
    console.log("Conexión a la base de datos exitosa");
    connection.release();
  })
  .catch(error => {
    console.error("Error al conectar a la base de datos:", error);
  });

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});