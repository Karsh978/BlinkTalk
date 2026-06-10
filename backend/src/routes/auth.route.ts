import express from "express";
import { login, logout, signup, updateProfile } from "../controllers/auth.controller"; // 1. Added updateProfile here
import { protectRoute } from "../middlewares/auth.middleware";
import { searchUsers,findUserByContact } from "../controllers/auth.controller";


const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);
router.get("/search", protectRoute, searchUsers);
router.get("/find-contact", protectRoute, findUserByContact);


// Ye check karne ke liye ki user logged in hai ya nahi (Frontend ke liye useful)
router.get("/check", protectRoute, (req: any, res) => {
  res.status(200).json(req.user);
});

export default router;