import express from "express";
import { protectRoute } from "../middlewares/auth.middleware";
import { createStatus, getStatuses, viewStatus, deleteStatus } from "../controllers/status.controller";

const router = express.Router();

router.post("/",              protectRoute, createStatus);
router.get("/",               protectRoute, getStatuses);
router.put("/view/:statusId", protectRoute, viewStatus);
router.delete("/:statusId",   protectRoute, deleteStatus);

export default router;