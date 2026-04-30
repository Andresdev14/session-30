import bcrypt from "bcrypt";
import pool from "../config/db.js";

const seedDatabase = async () => {
  try {
    console.log("🧹 Clearing existing data...");

    // Clear tables in correct order (respecting foreign keys)
    await pool.query("SET FOREIGN_KEY_CHECKS = 0");
    await pool.query("TRUNCATE TABLE payments");
    await pool.query("TRUNCATE TABLE accounts_receivable");
    await pool.query("TRUNCATE TABLE student_guardians");
    await pool.query("TRUNCATE TABLE charge_types");
    await pool.query("TRUNCATE TABLE students");
    await pool.query("TRUNCATE TABLE guardians");
    await pool.query("TRUNCATE TABLE users");
    await pool.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("🌱 Starting database seeding...");

    // 1. USERS
    console.log("📝 Seeding users...");
    const hashedPassword1 = await bcrypt.hash("123456", 10);
    const hashedPassword2 = await bcrypt.hash("admin123", 10);

    await pool.query(`
      INSERT INTO users (id, first_name, last_name, email, password_hash, phone, role, is_active) VALUES
      (UUID(), 'Admin', 'User', 'admin@test.com', ?, '555-0101', 'admin', 1),
      (UUID(), 'John', 'Doe', 'john@test.com', ?, '555-0102', 'admin', 1)
    `, [hashedPassword1, hashedPassword2]);

    // 2. GUARDIANS
    console.log("👨‍👩‍👧‍👦 Seeding guardians...");
    const [guardianResults] = await pool.query(`
      INSERT INTO guardians (id, first_name, last_name, phone, email, address, whatsapp_active) VALUES
      (UUID(), 'Maria', 'Garcia', '555-1001', 'maria@email.com', '123 Main St', 1),
      (UUID(), 'Carlos', 'Garcia', '555-1002', 'carlos@email.com', '123 Main St', 1),
      (UUID(), 'Ana', 'Rodriguez', '555-1003', 'ana@email.com', '456 Oak Ave', 1),
      (UUID(), 'Luis', 'Martinez', '555-1004', 'luis@email.com', '789 Pine St', 1),
      (UUID(), 'Carmen', 'Lopez', '555-1005', 'carmen@email.com', '321 Elm St', 1)
    `);

    // 3. STUDENTS
    console.log("🎓 Seeding students...");
    const [studentResults] = await pool.query(`
      INSERT INTO students (id, student_code, first_name, last_name, document_type, document_number, birth_date, grade, school_year, status) VALUES
      (UUID(), 'STU001', 'Juan', 'Garcia', 'DNI', '12345678', '2010-05-15', '5th Grade', 2024, 'active'),
      (UUID(), 'STU002', 'Maria', 'Garcia', 'DNI', '12345679', '2011-03-20', '4th Grade', 2024, 'active'),
      (UUID(), 'STU003', 'Pedro', 'Rodriguez', 'DNI', '12345680', '2009-08-10', '6th Grade', 2024, 'active'),
      (UUID(), 'STU004', 'Lucia', 'Martinez', 'DNI', '12345681', '2012-01-05', '3rd Grade', 2024, 'active'),
      (UUID(), 'STU005', 'Miguel', 'Lopez', 'DNI', '12345682', '2010-11-30', '5th Grade', 2024, 'active'),
      (UUID(), 'STU006', 'Sofia', 'Hernandez', 'DNI', '12345683', '2008-07-22', '7th Grade', 2024, 'active')
    `);

    // Get inserted IDs for relationships
    const [guardians] = await pool.query("SELECT id, first_name, last_name FROM guardians ORDER BY id");
    const [students] = await pool.query("SELECT id, first_name, last_name FROM students ORDER BY id");

    // 4. STUDENT_GUARDIANS
    console.log("🔗 Seeding student-guardian relationships...");
    await pool.query(`
      INSERT INTO student_guardians (id, student_id, guardian_id, relationship, is_primary, is_payment_responsible, receives_notifications) VALUES
      (UUID(), ?, ?, 'Mother', 1, 1, 1),
      (UUID(), ?, ?, 'Father', 0, 0, 1),
      (UUID(), ?, ?, 'Mother', 1, 1, 1),
      (UUID(), ?, ?, 'Father', 0, 1, 1),
      (UUID(), ?, ?, 'Mother', 1, 1, 1),
      (UUID(), ?, ?, 'Father', 0, 0, 1),
      (UUID(), ?, ?, 'Mother', 1, 1, 1),
      (UUID(), ?, ?, 'Mother', 1, 1, 1)
    `, [
      students[0].id, guardians[0].id, // Juan - Maria Garcia
      students[0].id, guardians[1].id, // Juan - Carlos Garcia
      students[1].id, guardians[0].id, // Maria - Maria Garcia
      students[1].id, guardians[1].id, // Maria - Carlos Garcia
      students[2].id, guardians[2].id, // Pedro - Ana Rodriguez
      students[3].id, guardians[3].id, // Lucia - Luis Martinez
      students[4].id, guardians[4].id, // Miguel - Carmen Lopez
      students[5].id, guardians[4].id  // Sofia - Carmen Lopez
    ]);

    // 5. CHARGE_TYPES
    console.log("💰 Seeding charge types...");
    await pool.query(`
      INSERT INTO charge_types (id, name, description, is_active) VALUES
      (UUID(), 'Tuition', 'Monthly tuition fee', 1),
      (UUID(), 'Transport', 'School transportation fee', 1),
      (UUID(), 'Materials', 'Educational materials and supplies', 1),
      (UUID(), 'Lunch', 'School lunch program', 1)
    `);

    // Get charge types
    const [chargeTypes] = await pool.query("SELECT id, name FROM charge_types ORDER BY id");

    // 6. ACCOUNTS_RECEIVABLE
    console.log("📊 Seeding accounts receivable...");
    await pool.query(`
      INSERT INTO accounts_receivable (id, student_id, charge_type_id, period, due_date, amount, outstanding_balance, status) VALUES
      (UUID(), ?, ?, 'September 2024', '2024-09-30', 500.00, 500.00, 'pending'),
      (UUID(), ?, ?, 'September 2024', '2024-09-30', 500.00, 500.00, 'pending'),
      (UUID(), ?, ?, 'September 2024', '2024-09-30', 500.00, 250.00, 'partial'),
      (UUID(), ?, ?, 'September 2024', '2024-09-30', 500.00, 0.00, 'paid'),
      (UUID(), ?, ?, 'October 2024', '2024-10-30', 500.00, 500.00, 'pending'),
      (UUID(), ?, ?, 'October 2024', '2024-10-30', 500.00, 500.00, 'pending'),
      (UUID(), ?, ?, 'September 2024', '2024-09-15', 50.00, 50.00, 'pending'),
      (UUID(), ?, ?, 'September 2024', '2024-09-15', 50.00, 0.00, 'paid'),
      (UUID(), ?, ?, 'September 2024', '2024-09-20', 30.00, 30.00, 'pending'),
      (UUID(), ?, ?, 'September 2024', '2024-09-20', 30.00, 30.00, 'pending')
    `, [
      students[0].id, chargeTypes[0].id, // Juan - Tuition
      students[1].id, chargeTypes[0].id, // Maria - Tuition
      students[2].id, chargeTypes[0].id, // Pedro - Tuition (partial)
      students[3].id, chargeTypes[0].id, // Lucia - Tuition (paid)
      students[4].id, chargeTypes[0].id, // Miguel - Tuition
      students[5].id, chargeTypes[0].id, // Sofia - Tuition
      students[0].id, chargeTypes[1].id, // Juan - Transport
      students[1].id, chargeTypes[1].id, // Maria - Transport (paid)
      students[2].id, chargeTypes[2].id, // Pedro - Materials
      students[3].id, chargeTypes[2].id  // Lucia - Materials
    ]);

    // Get accounts for payments
    const [accounts] = await pool.query("SELECT id, student_id, outstanding_balance FROM accounts_receivable ORDER BY id");

    // 7. PAYMENTS
    console.log("💳 Seeding payments...");
    await pool.query(`
      INSERT INTO payments (id, account_receivable_id, recorded_by_user_id, payment_date, amount_paid, payment_method, reference) VALUES
      (UUID(), ?, (SELECT id FROM users WHERE email = 'admin@test.com' LIMIT 1), '2024-09-15', 250.00, 'Cash', 'Payment 001'),
      (UUID(), ?, (SELECT id FROM users WHERE email = 'admin@test.com' LIMIT 1), '2024-09-20', 500.00, 'Transfer', 'Payment 002'),
      (UUID(), ?, (SELECT id FROM users WHERE email = 'john@test.com' LIMIT 1), '2024-09-10', 50.00, 'Cash', 'Payment 003'),
      (UUID(), ?, (SELECT id FROM users WHERE email = 'admin@test.com' LIMIT 1), '2024-09-25', 100.00, 'Check', 'Payment 004'),
      (UUID(), ?, (SELECT id FROM users WHERE email = 'admin@test.com' LIMIT 1), '2024-09-28', 30.00, 'Cash', 'Payment 005')
    `, [
      accounts[2].id, // Pedro's tuition (partial payment)
      accounts[3].id, // Lucia's tuition (full payment)
      accounts[7].id, // Maria's transport (full payment)
      accounts[2].id, // Pedro's tuition (additional payment)
      accounts[8].id  // Pedro's materials (full payment)
    ]);

    console.log("✅ Database seeding completed successfully!");
    console.log("\n📋 Test Credentials:");
    console.log("Email: admin@test.com | Password: 123456");
    console.log("Email: john@test.com | Password: admin123");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    process.exit();
  }
};

// Run the seed function
seedDatabase();