CREATE DATABASE IF NOT EXISTS AdminBot;
USE AdminBot;

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(30) NOT NULL DEFAULT 'admin',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
);

CREATE TABLE guardians (
  id CHAR(36) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(120),
  address TEXT,
  whatsapp_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE students (
  id CHAR(36) NOT NULL,
  student_code VARCHAR(30) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  document_type VARCHAR(20),
  document_number VARCHAR(30),
  birth_date DATE,
  grade VARCHAR(30),
  school_year INT,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_students_student_code (student_code),
  UNIQUE KEY uq_students_document_number (document_number)
);

CREATE TABLE student_guardians (
  id CHAR(36) NOT NULL,
  student_id CHAR(36) NOT NULL,
  guardian_id CHAR(36) NOT NULL,
  relationship VARCHAR(50),
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  is_payment_responsible TINYINT(1) NOT NULL DEFAULT 1,
  receives_notifications TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_student_guardians (student_id, guardian_id),
  KEY idx_student_guardians_student (student_id),
  KEY idx_student_guardians_guardian (guardian_id),
  CONSTRAINT fk_student_guardians_student
    FOREIGN KEY (student_id) REFERENCES students(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_student_guardians_guardian
    FOREIGN KEY (guardian_id) REFERENCES guardians(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE charge_types (
  id CHAR(36) NOT NULL,
  name VARCHAR(50) NOT NULL,
  description VARCHAR(150),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_charge_types_name (name)
);

CREATE TABLE accounts_receivable (
  id CHAR(36) NOT NULL,
  student_id CHAR(36) NOT NULL,
  charge_type_id CHAR(36) NOT NULL,
  period VARCHAR(20) NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  outstanding_balance DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_accounts_receivable_student (student_id),
  KEY idx_accounts_receivable_charge_type (charge_type_id),
  CONSTRAINT fk_accounts_receivable_student
    FOREIGN KEY (student_id) REFERENCES students(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_accounts_receivable_charge_type
    FOREIGN KEY (charge_type_id) REFERENCES charge_types(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

CREATE TABLE payments (
  id CHAR(36) NOT NULL,
  account_receivable_id CHAR(36) NOT NULL,
  recorded_by_user_id CHAR(36),
  payment_date TIMESTAMP NOT NULL,
  amount_paid DECIMAL(12,2) NOT NULL,
  payment_method VARCHAR(30) NOT NULL,
  reference VARCHAR(100),
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_payments_account_receivable (account_receivable_id),
  KEY idx_payments_recorded_by_user (recorded_by_user_id),
  CONSTRAINT fk_payments_account_receivable
    FOREIGN KEY (account_receivable_id) REFERENCES accounts_receivable(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_payments_recorded_by_user
    FOREIGN KEY (recorded_by_user_id) REFERENCES users(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

CREATE TABLE whatsapp_notifications (
  id CHAR(36) NOT NULL,
  student_id CHAR(36) NOT NULL,
  guardian_id CHAR(36) NOT NULL,
  account_receivable_id CHAR(36),
  destination_phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMP NULL,
  delivery_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_whatsapp_notifications_student (student_id),
  KEY idx_whatsapp_notifications_guardian (guardian_id),
  KEY idx_whatsapp_notifications_account (account_receivable_id),
  CONSTRAINT fk_whatsapp_notifications_student
    FOREIGN KEY (student_id) REFERENCES students(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_whatsapp_notifications_guardian
    FOREIGN KEY (guardian_id) REFERENCES guardians(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_whatsapp_notifications_account
    FOREIGN KEY (account_receivable_id) REFERENCES accounts_receivable(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

CREATE TABLE attendance (
  id CHAR(36) NOT NULL,
  student_id CHAR(36) NOT NULL,
  attendance_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL,
  check_in_time TIME,
  check_out_time TIME,
  observation VARCHAR(255),
  recorded_by_user_id CHAR(36),
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_attendance_student_date (student_id, attendance_date),
  KEY idx_attendance_recorded_by_user (recorded_by_user_id),
  CONSTRAINT fk_attendance_student
    FOREIGN KEY (student_id) REFERENCES students(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_attendance_recorded_by_user
    FOREIGN KEY (recorded_by_user_id) REFERENCES users(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);