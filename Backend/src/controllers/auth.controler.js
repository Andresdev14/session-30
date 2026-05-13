import { findUserByEmail } from "../models/auth.models.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const JWT_SECRET = process.env.JWT_SECRET;
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

    if (!JWT_SECRET) {
      return res.status(500).json({
        ok: false,
        error: "JWT secret not configured"
      });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        ok: false,
        error: "User not found"
      });
    }

    const isValidHash = user.password_hash && (user.password_hash.startsWith('$2b$') || user.password_hash.startsWith('$2a$'));

    if (!isValidHash) {
      return res.status(500).json({
        ok: false,
        error: "Invalid stored password format"
      });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);

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

