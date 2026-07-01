import express from "express";
import { protectRoute } from "../middlewares/auth.middleware";
import { clearChat } from "../controllers/message.controller";
import { 
  getMessages, 
  getUsersForSidebar, 
  sendMessage, 
  sendGroupMessage,
  deleteMessage, 
  markAsSeen,
  getGroupMessages
} from "../controllers/message.controller";

const router = express.Router();

// ✅ Specific routes FIRST (before /:id)
router.get("/users", protectRoute, getUsersForSidebar);
router.get("/group/:groupId", protectRoute, getGroupMessages);      // ✅ moved up
router.post("/send/group/:groupId", protectRoute, sendGroupMessage); // ✅ moved up
router.post("/delete/:id", protectRoute, deleteMessage);
router.put("/seen/:id", protectRoute, markAsSeen);
router.delete("/clear/:id", protectRoute, clearChat);

// ✅ Generic /:id routes LAST
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);

export default router;