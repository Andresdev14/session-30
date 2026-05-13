import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import guardianRoutes from "./routes/guardian.routes.js";
import studentRoutes from "./routes/student.routes.js";
import studentGuardianRoutes from "./routes/studentGuardian.routes.js";
import chargeTypesRoutes from "./routes/charge-types.routes.js";
import accountsRoutes from "./routes/accounts.routes.js";
import paymentsRoutes from "./routes/payments.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import usuariosRoutes from "./routes/usuarios.routes.js";
import authMiddleware from "./middlewares/auth.middleware.js";
import whatsappRoutes from "./modules/whatsapp/whatsapp.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/users", authMiddleware, usersRoutes);
app.use("/students", authMiddleware, studentRoutes);
app.use("/guardians", authMiddleware, guardianRoutes);
app.use("/student.guardians", authMiddleware, studentGuardianRoutes);
app.use("/student-guardians", authMiddleware, studentGuardianRoutes);
app.use("/charge-types", authMiddleware, chargeTypesRoutes);
app.use("/accounts", authMiddleware, accountsRoutes);
app.use("/payments", authMiddleware, paymentsRoutes);
app.use("/dashboard", authMiddleware, dashboardRoutes);
app.use("/whatsapp", authMiddleware, whatsappRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;
