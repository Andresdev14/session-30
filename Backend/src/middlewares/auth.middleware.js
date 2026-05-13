import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;


export default (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ ok: false, error: "No token provided" });
  }

  const [scheme, token] = authHeader.split(" ");

  if (!scheme || scheme !== "Bearer" || !token) {
    return res.status(401).json({ ok: false, error: "No token provided" });
  }

  if (!JWT_SECRET) {
    return res.status(500).json({ ok: false, error: "JWT secret not configured" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ ok: false, error: "Invalid token" });
  }
};