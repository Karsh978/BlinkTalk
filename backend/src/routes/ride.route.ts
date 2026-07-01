import express from "express";
import { protectRoute } from "../middlewares/auth.middleware";
import { createRide, getRides, deleteRide, getMyRides } from "../controllers/ride.controller";

const router = express.Router();

router.post("/",     protectRoute, createRide);
router.get("/",      protectRoute, getRides);
router.get("/mine",  protectRoute, getMyRides);
router.delete("/:id",protectRoute, deleteRide);

export default router;