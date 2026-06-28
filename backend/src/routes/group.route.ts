import express from "express";
import { protectRoute } from "../middlewares/auth.middleware";
import { createGroup, getGroups } from "../controllers/group.controller";

const router = express.Router();

router.post("/create", protectRoute, createGroup);
router.get("/", protectRoute, getGroups);

export default router;