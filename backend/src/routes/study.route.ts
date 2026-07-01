import express from "express";
import { protectRoute } from "../middlewares/auth.middleware";
import {
  createStudyGroup, getStudyGroups, joinStudyGroup, leaveStudyGroup,
  createMaterial, getMaterials, likeMaterial,
} from "../controllers/study.controller";

const router = express.Router();

// Groups
router.post("/groups",           protectRoute, createStudyGroup);
router.get("/groups",            protectRoute, getStudyGroups);
router.put("/groups/:id/join",   protectRoute, joinStudyGroup);
router.put("/groups/:id/leave",  protectRoute, leaveStudyGroup);

// Materials
router.post("/materials",        protectRoute, createMaterial);
router.get("/materials",         protectRoute, getMaterials);
router.put("/materials/:id/like",protectRoute, likeMaterial);

export default router;