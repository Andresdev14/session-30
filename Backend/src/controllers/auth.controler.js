import { findUserByEmail } from "../models/auth.models.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const TOKEN_EXPIRES_IN = "8h";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        error: "Email and password are required"
      });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        ok: false,
        error: "User not found"
      });
    }

    // TEMPORARY DEBUGGING LOGS
    console.log("INPUT PASSWORD:", password);
    console.log("HASH FROM DB:", user.password_hash);

    // Check if hash is valid bcrypt hash (starts with $2b$ or $2a$)
    const isValidHash = user.password_hash && (user.password_hash.startsWith('$2b$') || user.password_hash.startsWith('$2a$'));

    let validPassword = false;

    if (isValidHash) {
      validPassword = await bcrypt.compare(password, user.password_hash);
    } else {
      // TEMPORARY: If hash is invalid, assume it's plain text and regenerate
      console.log("INVALID HASH DETECTED - REGENERATING...");
      const newHash = await bcrypt.hash(password, 10);

      // Update DB with new hash
      await pool.query(
        "UPDATE users SET password_hash = ? WHERE email = ?",
        [newHash, email]
      );

      console.log("NEW HASH GENERATED AND UPDATED:", newHash);
      validPassword = true; // Allow login this time
    }

    if (!validPassword) {
      return res.status(401).json({
        ok: false,
        error: "Invalid password"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRES_IN }
    );

    return res.status(200).json({
      ok: true,
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({
      ok: false,
      error: err.message || "Server error"
    });
  }
};

// TEMPORARY ENDPOINT - REMOVE IN PRODUCTION
export const registerTestUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        error: "Email and password are required"
      });
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        ok: false,
        error: "User with this email already exists"
      });
    }

    // Generate bcrypt hash
    const hash = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await pool.query(
      `INSERT INTO users (id, email, password_hash, first_name, last_name, role)
       VALUES (UUID(), ?, ?, 'Admin', 'Test', 'admin')`,
      [email, hash]
    );

    return res.status(201).json({
      ok: true,
      message: "Test user created successfully",
      user: {
        email: email,
        role: "admin"
      }
    });

  } catch (error) {
    console.error("REGISTER TEST USER ERROR:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Server error"
    });
  }
};
