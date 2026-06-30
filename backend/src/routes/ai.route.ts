import express from "express";
import { protectRoute } from "../middlewares/auth.middleware";
import { chatWithAI } from "../controllers/ai.controller";

const router = express.Router();

router.post("/chat", protectRoute, chatWithAI);

export default router;