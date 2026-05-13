import bcrypt from "bcrypt";
import pool from "../config/db.js";

const seedDatabase = async () => {
  try {
    console.log("⚙️ Limpiando datos existentes...");
    await pool.query("SET FOREIGN_KEY_CHECKS = 0");
    await pool.query("TRUNCATE TABLE whatsapp_notifications");
    await pool.query("TRUNCATE TABLE attendance");
    await pool.query("TRUNCATE TABLE payments");
    await pool.query("TRUNCATE TABLE accounts_receivable");
    await pool.query("TRUNCATE TABLE student_guardians");
    await pool.query("TRUNCATE TABLE charge_types");
    await pool.query("TRUNCATE TABLE students");
    await pool.query("TRUNCATE TABLE guardians");
    await pool.query("TRUNCATE TABLE users");
    await pool.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("🚀 Insertando datos de usuarios...");
    const userData = [
      { first_name: "Admin", last_name: "Manager", email: "admin@test.com", password: "admin123", phone: "300-100-2000", role: "admin" },
      { first_name: "Carla", last_name: "Sanchez", email: "cashier@test.com", password: "cashier123", phone: "300-100-2001", role: "cashier" },
      { first_name: "Lorena", last_name: "Rivera", email: "secretary@test.com", password: "secretary123", phone: "300-100-2002", role: "secretary" },
      { first_name: "Samuel", last_name: "Herrera", email: "assistant@test.com", password: "assistant123", phone: "300-100-2003", role: "assistant" },
      { first_name: "Diego", last_name: "Morales", email: "operator@test.com", password: "operator123", phone: "300-100-2004", role: "operator" }
    ];

    for (const user of userData) {
      user.password_hash = await bcrypt.hash(user.password, 10);
    }

    const userValues = userData.map(() => "(UUID(), ?, ?, ?, ?, ?, ?, 1)").join(", ");
    await pool.query(
      `INSERT INTO users (id, first_name, last_name, email, password_hash, phone, role, is_active) VALUES ${userValues}`,
      userData.flatMap((user) => [user.first_name, user.last_name, user.email, user.password_hash, user.phone, user.role])
    );

    console.log("🚸 Insertando tutores...");
    const guardianData = [
      { first_name: "Mariana", last_name: "Alvarez", phone: "300-200-1001", email: "mariana.alvarez@test.com", address: "Calle 45 # 12-34" },
      { first_name: "Carlos", last_name: "Gonzalez", phone: "300-200-1002", email: "carlos.gonzalez@test.com", address: "Carrera 7 # 45-67" },
      { first_name: "Laura", last_name: "Castro", phone: "300-200-1003", email: "laura.castro@test.com", address: "Calle 78 # 10-12" },
      { first_name: "Miguel", last_name: "Ortiz", phone: "300-200-1004", email: "miguel.ortiz@test.com", address: "Carrera 9 # 14-20" },
      { first_name: "Valeria", last_name: "Diaz", phone: "300-200-1005", email: "valeria.diaz@test.com", address: "Calle 3 # 56-78" },
      { first_name: "Jorge", last_name: "Ramirez", phone: "300-200-1006", email: "jorge.ramirez@test.com", address: "Carrera 15 # 22-30" },
      { first_name: "Patricia", last_name: "Molina", phone: "300-200-1007", email: "patricia.molina@test.com", address: "Calle 12 # 34-56" },
      { first_name: "Natalia", last_name: "Vargas", phone: "300-200-1008", email: "natalia.vargas@test.com", address: "Carrera 22 # 18-40" },
      { first_name: "José", last_name: "Cortes", phone: "300-200-1009", email: "jose.cortes@test.com", address: "Calle 20 # 11-10" },
      { first_name: "Daniela", last_name: "Ruiz", phone: "300-200-1010", email: "daniela.ruiz@test.com", address: "Carrera 11 # 15-25" }
    ];

    const guardianValues = guardianData.map(() => "(UUID(), ?, ?, ?, ?, ?, 1)").join(", ");
    await pool.query(
      `INSERT INTO guardians (id, first_name, last_name, phone, email, address, whatsapp_active) VALUES ${guardianValues}`,
      guardianData.flatMap((guardian) => [guardian.first_name, guardian.last_name, guardian.phone, guardian.email, guardian.address])
    );

    console.log("🎒 Insertando estudiantes...");
    const studentData = [
      { student_code: "STU001", first_name: "Santiago", last_name: "Pérez", document_type: "DNI", document_number: "1001001", birth_date: "2010-04-22", grade: "5th Grade", school_year: 2024, status: "active" },
      { student_code: "STU002", first_name: "Catalina", last_name: "Ramírez", document_type: "DNI", document_number: "1001002", birth_date: "2011-08-11", grade: "4th Grade", school_year: 2024, status: "active" },
      { student_code: "STU003", first_name: "Mateo", last_name: "Rodríguez", document_type: "DNI", document_number: "1001003", birth_date: "2009-12-03", grade: "6th Grade", school_year: 2024, status: "active" },
      { student_code: "STU004", first_name: "Valentina", last_name: "García", document_type: "DNI", document_number: "1001004", birth_date: "2012-01-18", grade: "3rd Grade", school_year: 2024, status: "active" },
      { student_code: "STU005", first_name: "Alejandro", last_name: "Hernández", document_type: "DNI", document_number: "1001005", birth_date: "2010-11-05", grade: "5th Grade", school_year: 2024, status: "active" },
      { student_code: "STU006", first_name: "Isabella", last_name: "Martínez", document_type: "DNI", document_number: "1001006", birth_date: "2008-07-30", grade: "7th Grade", school_year: 2024, status: "active" },
      { student_code: "STU007", first_name: "Sebastián", last_name: "Torres", document_type: "DNI", document_number: "1001007", birth_date: "2011-06-14", grade: "4th Grade", school_year: 2024, status: "active" },
      { student_code: "STU008", first_name: "Sara", last_name: "Ramírez", document_type: "DNI", document_number: "1001008", birth_date: "2009-03-05", grade: "6th Grade", school_year: 2024, status: "active" },
      { student_code: "STU009", first_name: "Diego", last_name: "Vargas", document_type: "DNI", document_number: "1001009", birth_date: "2010-09-25", grade: "5th Grade", school_year: 2024, status: "active" },
      { student_code: "STU010", first_name: "Emma", last_name: "Pineda", document_type: "DNI", document_number: "1001010", birth_date: "2012-02-08", grade: "3rd Grade", school_year: 2024, status: "active" }
    ];

    const studentValues = studentData.map(() => "(UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?)").join(", ");
    await pool.query(
      `INSERT INTO students (id, student_code, first_name, last_name, document_type, document_number, birth_date, grade, school_year, status) VALUES ${studentValues}`,
      studentData.flatMap((student) => [student.student_code, student.first_name, student.last_name, student.document_type, student.document_number, student.birth_date, student.grade, student.school_year, student.status])
    );

    const [users] = await pool.query("SELECT id, email FROM users");
    const [guardians] = await pool.query("SELECT id, email FROM guardians");
    const [students] = await pool.query("SELECT id, student_code FROM students");

    const guardianMap = Object.fromEntries(guardians.map((row) => [row.email, row.id]));
    const studentMap = Object.fromEntries(students.map((row) => [row.student_code, row.id]));
    const userMap = Object.fromEntries(users.map((row) => [row.email, row.id]));

    console.log("🔗 Insertando relaciones estudiante-tutor...");
    const studentGuardianData = [
      { student: "STU001", guardian: "mariana.alvarez@test.com", relationship: "Mother", is_primary: 1, is_payment_responsible: 1, receives_notifications: 1 },
      { student: "STU001", guardian: "carlos.gonzalez@test.com", relationship: "Father", is_primary: 0, is_payment_responsible: 0, receives_notifications: 1 },
      { student: "STU002", guardian: "laura.castro@test.com", relationship: "Mother", is_primary: 1, is_payment_responsible: 1, receives_notifications: 1 },
      { student: "STU002", guardian: "miguel.ortiz@test.com", relationship: "Father", is_primary: 0, is_payment_responsible: 0, receives_notifications: 1 },
      { student: "STU003", guardian: "valeria.diaz@test.com", relationship: "Mother", is_primary: 1, is_payment_responsible: 1, receives_notifications: 1 },
      { student: "STU004", guardian: "jorge.ramirez@test.com", relationship: "Father", is_primary: 1, is_payment_responsible: 1, receives_notifications: 1 },
      { student: "STU004", guardian: "patricia.molina@test.com", relationship: "Mother", is_primary: 0, is_payment_responsible: 0, receives_notifications: 1 },
      { student: "STU005", guardian: "natalia.vargas@test.com", relationship: "Mother", is_primary: 1, is_payment_responsible: 1, receives_notifications: 1 },
      { student: "STU006", guardian: "jose.cortes@test.com", relationship: "Father", is_primary: 1, is_payment_responsible: 1, receives_notifications: 1 },
      { student: "STU006", guardian: "daniela.ruiz@test.com", relationship: "Mother", is_primary: 0, is_payment_responsible: 0, receives_notifications: 1 },
      { student: "STU007", guardian: "mariana.alvarez@test.com", relationship: "Aunt", is_primary: 1, is_payment_responsible: 1, receives_notifications: 1 },
      { student: "STU008", guardian: "carlos.gonzalez@test.com", relationship: "Father", is_primary: 1, is_payment_responsible: 1, receives_notifications: 1 },
      { student: "STU008", guardian: "laura.castro@test.com", relationship: "Mother", is_primary: 0, is_payment_responsible: 0, receives_notifications: 1 },
      { student: "STU009", guardian: "miguel.ortiz@test.com", relationship: "Guardian", is_primary: 1, is_payment_responsible: 1, receives_notifications: 1 },
      { student: "STU010", guardian: "valeria.diaz@test.com", relationship: "Mother", is_primary: 1, is_payment_responsible: 1, receives_notifications: 1 }
    ];

    const studentGuardianValues = studentGuardianData.map(() => "(UUID(), ?, ?, ?, ?, ?, ?)").join(", ");
    await pool.query(
      `INSERT INTO student_guardians (id, student_id, guardian_id, relationship, is_primary, is_payment_responsible, receives_notifications) VALUES ${studentGuardianValues}`,
      studentGuardianData.flatMap((relation) => [studentMap[relation.student], guardianMap[relation.guardian], relation.relationship, relation.is_primary, relation.is_payment_responsible, relation.receives_notifications])
    );

    console.log("💳 Insertando tipos de cargos...");
    const chargeTypes = [
      { name: "Tuition", description: "Monthly tuition fee" },
      { name: "Transport", description: "School bus service" },
      { name: "Cafeteria", description: "Meals and cafeteria service" },
      { name: "Uniform", description: "School uniform and supplies" },
      { name: "Books", description: "Textbooks and learning materials" }
    ];

    const chargeTypeValues = chargeTypes.map(() => "(UUID(), ?, ?, 1)").join(", ");
    await pool.query(
      `INSERT INTO charge_types (id, name, description, is_active) VALUES ${chargeTypeValues}`,
      chargeTypes.flatMap((type) => [type.name, type.description])
    );

    const [chargeTypeRows] = await pool.query("SELECT id, name FROM charge_types");
    const chargeTypeMap = Object.fromEntries(chargeTypeRows.map((row) => [row.name, row.id]));

    console.log("📊 Insertando cuentas por cobrar...");
    const accountData = [
      { student: "STU001", type: "Tuition", period: "September 2024", due_date: "2024-09-30", amount: 550.0, outstanding_balance: 550.0, status: "pending" },
      { student: "STU001", type: "Transport", period: "September 2024", due_date: "2024-09-30", amount: 150.0, outstanding_balance: 0.0, status: "paid" },
      { student: "STU002", type: "Tuition", period: "September 2024", due_date: "2024-09-30", amount: 520.0, outstanding_balance: 260.0, status: "partial" },
      { student: "STU003", type: "Tuition", period: "September 2024", due_date: "2024-09-30", amount: 560.0, outstanding_balance: 560.0, status: "pending" },
      { student: "STU003", type: "Cafeteria", period: "September 2024", due_date: "2024-09-15", amount: 120.0, outstanding_balance: 0.0, status: "paid" },
      { student: "STU004", type: "Books", period: "October 2024", due_date: "2024-10-10", amount: 80.0, outstanding_balance: 80.0, status: "pending" },
      { student: "STU005", type: "Uniform", period: "October 2024", due_date: "2024-10-05", amount: 100.0, outstanding_balance: 50.0, status: "partial" },
      { student: "STU006", type: "Transport", period: "October 2024", due_date: "2024-10-20", amount: 150.0, outstanding_balance: 150.0, status: "pending" },
      { student: "STU007", type: "Tuition", period: "September 2024", due_date: "2024-09-30", amount: 500.0, outstanding_balance: 0.0, status: "paid" },
      { student: "STU008", type: "Cafeteria", period: "September 2024", due_date: "2024-09-30", amount: 105.0, outstanding_balance: 105.0, status: "pending" },
      { student: "STU009", type: "Books", period: "September 2024", due_date: "2024-09-20", amount: 70.0, outstanding_balance: 0.0, status: "paid" },
      { student: "STU010", type: "Uniform", period: "November 2024", due_date: "2024-11-05", amount: 90.0, outstanding_balance: 90.0, status: "pending" },
      { student: "STU002", type: "Transport", period: "October 2024", due_date: "2024-10-30", amount: 150.0, outstanding_balance: 150.0, status: "pending" },
      { student: "STU005", type: "Books", period: "September 2024", due_date: "2024-09-20", amount: 60.0, outstanding_balance: 60.0, status: "pending" }
    ];

    const accountValues = accountData.map(() => "(UUID(), ?, ?, ?, ?, ?, ?, ?)").join(", ");
    await pool.query(
      `INSERT INTO accounts_receivable (id, student_id, charge_type_id, period, due_date, amount, outstanding_balance, status) VALUES ${accountValues}`,
      accountData.flatMap((account) => [
        studentMap[account.student],
        chargeTypeMap[account.type],
        account.period,
        account.due_date,
        account.amount,
        account.outstanding_balance,
        account.status
      ])
    );

    const [accounts] = await pool.query("SELECT id, student_id, status, amount, outstanding_balance FROM accounts_receivable ORDER BY created_at ASC");

    console.log("💵 Insertando pagos...");
    const paymentData = [
      { accountIndex: 1, recordedBy: "cashier@test.com", payment_date: "2024-09-15 10:20:00", amount_paid: 150.0, payment_method: "Cash", reference: "Pago-001" },
      { accountIndex: 2, recordedBy: "cashier@test.com", payment_date: "2024-09-18 14:30:00", amount_paid: 260.0, payment_method: "Transfer", reference: "Pago-002" },
      { accountIndex: 4, recordedBy: "secretary@test.com", payment_date: "2024-09-12 09:05:00", amount_paid: 120.0, payment_method: "Card", reference: "Pago-003" },
      { accountIndex: 8, recordedBy: "assistant@test.com", payment_date: "2024-09-25 11:10:00", amount_paid: 500.0, payment_method: "Transfer", reference: "Pago-004" },
      { accountIndex: 10, recordedBy: "cashier@test.com", payment_date: "2024-09-21 16:40:00", amount_paid: 70.0, payment_method: "Card", reference: "Pago-005" },
      { accountIndex: 6, recordedBy: "operator@test.com", payment_date: "2024-10-02 08:45:00", amount_paid: 50.0, payment_method: "Cash", reference: "Pago-006" }
    ];

    const paymentValues = paymentData.map(() => "(UUID(), ?, ?, ?, ?, ?, ?)").join(", ");
    await pool.query(
      `INSERT INTO payments (id, account_receivable_id, recorded_by_user_id, payment_date, amount_paid, payment_method, reference) VALUES ${paymentValues}`,
      paymentData.flatMap((payment) => [
        accounts[payment.accountIndex]?.id,
        userMap[payment.recordedBy],
        payment.payment_date,
        payment.amount_paid,
        payment.payment_method,
        payment.reference
      ])
    );

    console.log("📌 Insertando registros de asistencia...");
    const attendanceData = [
      { student: "STU001", date: "2024-09-01", status: "present", check_in: "07:45:00", check_out: "13:30:00", observation: "On time", recordedBy: "secretary@test.com" },
      { student: "STU002", date: "2024-09-01", status: "absent", check_in: null, check_out: null, observation: "Sick", recordedBy: "assistant@test.com" },
      { student: "STU003", date: "2024-09-01", status: "late", check_in: "08:20:00", check_out: "13:30:00", observation: "Traffic delay", recordedBy: "secretary@test.com" },
      { student: "STU004", date: "2024-09-01", status: "present", check_in: "07:40:00", check_out: "13:30:00", observation: "", recordedBy: "operator@test.com" },
      { student: "STU005", date: "2024-09-01", status: "present", check_in: "07:50:00", check_out: "13:30:00", observation: "", recordedBy: "assistant@test.com" },
      { student: "STU006", date: "2024-09-01", status: "present", check_in: "07:55:00", check_out: "13:30:00", observation: "", recordedBy: "secretary@test.com" },
      { student: "STU001", date: "2024-09-02", status: "present", check_in: "07:42:00", check_out: "13:30:00", observation: "", recordedBy: "operator@test.com" },
      { student: "STU002", date: "2024-09-02", status: "present", check_in: "07:48:00", check_out: "13:30:00", observation: "", recordedBy: "assistant@test.com" },
      { student: "STU003", date: "2024-09-02", status: "absent", check_in: null, check_out: null, observation: "Family event", recordedBy: "secretary@test.com" },
      { student: "STU004", date: "2024-09-02", status: "late", check_in: "08:10:00", check_out: "13:30:00", observation: "Late arrival", recordedBy: "operator@test.com" },
      { student: "STU005", date: "2024-09-02", status: "present", check_in: "07:52:00", check_out: "13:30:00", observation: "", recordedBy: "assistant@test.com" },
      { student: "STU006", date: "2024-09-02", status: "present", check_in: "07:43:00", check_out: "13:30:00", observation: "", recordedBy: "secretary@test.com" },
      { student: "STU007", date: "2024-09-01", status: "present", check_in: "07:55:00", check_out: "13:30:00", observation: "", recordedBy: "assistant@test.com" },
      { student: "STU008", date: "2024-09-01", status: "absent", check_in: null, check_out: null, observation: "Medical appointment", recordedBy: "operator@test.com" },
      { student: "STU009", date: "2024-09-01", status: "late", check_in: "08:05:00", check_out: "13:30:00", observation: "Delayed transport", recordedBy: "secretary@test.com" },
      { student: "STU010", date: "2024-09-01", status: "present", check_in: "07:53:00", check_out: "13:30:00", observation: "", recordedBy: "assistant@test.com" }
    ];

    const attendanceValues = attendanceData.map(() => "(UUID(), ?, ?, ?, ?, ?, ?, ?)").join(", ");
    await pool.query(
      `INSERT INTO attendance (id, student_id, attendance_date, status, check_in_time, check_out_time, observation, recorded_by_user_id) VALUES ${attendanceValues}`,
      attendanceData.flatMap((record) => [
        studentMap[record.student],
        record.date,
        record.status,
        record.check_in,
        record.check_out,
        record.observation,
        userMap[record.recordedBy]
      ])
    );

    console.log("📲 Insertando notificaciones WhatsApp...");
    const whatsappData = [
      { student: "STU001", guardian: "mariana.alvarez@test.com", accountIndex: 0, phone: "300-200-1001", message: "Recordatorio: su pago de Tuition para septiembre está pendiente.", sent_at: null, delivery_status: "pending" },
      { student: "STU002", guardian: "laura.castro@test.com", accountIndex: 2, phone: "300-200-1003", message: "Tu saldo parcial de Tuition se encuentra en estado parcial.", sent_at: "2024-09-18 10:00:00", delivery_status: "sent" },
      { student: "STU003", guardian: "valeria.diaz@test.com", accountIndex: 3, phone: "300-200-1005", message: "Notificación de pago completo de Cafeteria.", sent_at: "2024-09-12 11:00:00", delivery_status: "sent" },
      { student: "STU004", guardian: "patricia.molina@test.com", accountIndex: 5, phone: "300-200-1007", message: "Su cuenta de Books está pendiente con fecha de vencimiento 2024-10-10.", sent_at: null, delivery_status: "pending" },
      { student: "STU005", guardian: "natalia.vargas@test.com", accountIndex: 6, phone: "300-200-1008", message: "Su pago de Uniform está parcialmente pagado.", sent_at: "2024-10-03 09:20:00", delivery_status: "failed" },
      { student: "STU009", guardian: "miguel.ortiz@test.com", accountIndex: 10, phone: "300-200-1004", message: "¡Gracias! Su pago de Books ya fue registrado.", sent_at: "2024-09-21 15:05:00", delivery_status: "sent" }
    ];

    const whatsappValues = whatsappData.map(() => "(UUID(), ?, ?, ?, ?, ?, ?, ?)").join(", ");
    await pool.query(
      `INSERT INTO whatsapp_notifications (id, student_id, guardian_id, account_receivable_id, destination_phone, message, sent_at, delivery_status) VALUES ${whatsappValues}`,
      whatsappData.flatMap((item) => [
        studentMap[item.student],
        guardianMap[item.guardian],
        accounts[item.accountIndex]?.id,
        item.phone,
        item.message,
        item.sent_at,
        item.delivery_status
      ])
    );

    console.log("✅ Base de datos sembrada con datos de prueba.");
    console.log("📋 Credenciales de demostración:");
    console.log("  - admin@test.com / admin123");
    console.log("  - cashier@test.com / cashier123");
    console.log("  - secretary@test.com / secretary123");
    console.log("  - assistant@test.com / assistant123");
    console.log("  - operator@test.com / operator123");
  } catch (error) {
    console.error("❌ Error al sembrar la base de datos:", error);
  } finally {
    await pool.end();
    process.exit(0);
  }
};

seedDatabase();
