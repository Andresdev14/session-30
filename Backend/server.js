import dotenv from 'dotenv';
dotenv.config();
import bcrypt from "bcrypt";
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

 const passwordlist = [
    "joel123",
   "juan123",
   "andres123",
   "alejandro123",
    "guillermo123"
 ]

 for(let i = 0; i < passwordlist.length; i++){
   const hash = await bcrypt.hash(passwordlist[i], 10)
   console.log(` Contraseña : ${passwordlist[i]}, hash: ${hash}`)

}
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});