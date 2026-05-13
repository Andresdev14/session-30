import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: ".",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        login: resolve(__dirname, "src/pages/auth/login.html"),
        dashboard: resolve(__dirname, "src/pages/dashboard/dashboard.html"),
        students: resolve(__dirname, "src/pages/students/students.html"),
        guardians: resolve(__dirname, "src/pages/guardians/guardians.html"),
        payments: resolve(__dirname, "src/pages/payments/payments.html"),
        attendance: resolve(__dirname, "src/pages/attendance/index.html"),
        whatsapp: resolve(__dirname, "src/pages/whatsapp/whatsapp.html"),
      },
    },
  },
});
