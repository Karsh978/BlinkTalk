import express from "express";
import { protectRoute } from "../middlewares/auth.middleware";
import { createPost, getPosts, resolvePost, deletePost } from "../controllers/lostfound.controller";

const router = express.Router();

router.post("/",            protectRoute, createPost);
router.get("/",             protectRoute, getPosts);
router.put("/:id/resolve",  protectRoute, resolvePost);
router.delete("/:id",       protectRoute, deletePost);

export default router;