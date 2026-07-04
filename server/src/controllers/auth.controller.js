import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";

/*
|--------------------------------------------------------------------------
| POST /api/auth/login
|--------------------------------------------------------------------------
*/
export const login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required.",
    });
  }

  const validUsername = process.env.ADMIN_USERNAME;
  const validPassword = process.env.ADMIN_PASSWORD;

  if (username !== validUsername || password !== validPassword) {
    logger.warn(`Failed admin login attempt for username: "${username}"`);
    return res.status(401).json({
      success: false,
      message: "Invalid username or password.",
    });
  }

  const token = jwt.sign(
    { username, role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  logger.info(`Admin logged in: ${username}`);

  res.status(200).json({
    success: true,
    message: "Login successful.",
    token,
  });
};

/*
|--------------------------------------------------------------------------
| POST /api/auth/verify  — quick token validity check
|--------------------------------------------------------------------------
*/
export const verifyToken = (req, res) => {
  // If this route is reached, authMiddleware already validated the token
  res.status(200).json({ success: true, message: "Token is valid." });
};
