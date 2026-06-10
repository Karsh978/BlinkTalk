import express from "express";
import { protectRoute } from "../middlewares/auth.middleware";
import { getMessages, getUsersForSidebar, sendMessage,sendGroupMessage } from "../controllers/message.controller";
import { deleteMessage, markAsSeen } from "../controllers/message.controller";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.delete("/:id", protectRoute, deleteMessage);
router.put("/seen/:id", protectRoute, markAsSeen);
// backend/src/routes/message.route.ts

// Purane routes ke niche ise add karein
router.post("/delete/:id", protectRoute, deleteMessage);
router.post("/send/group/:groupId", protectRoute, sendGroupMessage);

export default router;