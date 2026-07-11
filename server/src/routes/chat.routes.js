import { Router } from "express";
import { handleChat, handleImageChat } from "../controllers/chat.controller.js";

const router = Router();

router.post("/chat", handleChat);
router.post("/chat/image", handleImageChat);

export default router;
