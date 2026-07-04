import { Router } from "express";
import { login, verifyToken } from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| POST /api/auth/login
|--------------------------------------------------------------------------
*/
router.post("/login", login);

/*
|--------------------------------------------------------------------------
| GET /api/auth/verify  — protected; client calls this to re-check token
|--------------------------------------------------------------------------
*/
router.get("/verify", authMiddleware, verifyToken);

export default router;
