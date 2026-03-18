import express from "express";
import estudiantesRoutes from "./routes/estudiantes.routes.js";

const app = express();
app.use("/estudiantes", estudiantesRoutes);
app.get("/", (req, res) => {
  res.send("API funcionando");
});

export default app;