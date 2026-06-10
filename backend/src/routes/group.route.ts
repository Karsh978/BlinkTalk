import express from "express";
import { protectRoute } from "../middlewares/auth.middleware";
import { createGroup, getGroups } from "../controllers/group.controller";

const router = express.Router();

// 1. Naya group banane ke liye
router.post("/create", protectRoute, createGroup);

// 2. User jin groups ka member hai, unhe fetch karne ke liye
router.get("/", protectRoute, getGroups);

export default router;