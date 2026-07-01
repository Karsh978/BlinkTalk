import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./lib/db";
import authRoutes from "./routes/auth.route";
import messageRoutes from "./routes/message.route";
import groupRoutes from "./routes/group.route";
import { app, server } from "./lib/socket";
import statusRoutes from "./routes/status.route";
import aiRoutes from "./routes/ai.route";
import rideRoutes from "./routes/ride.route";
import studyRoutes from "./routes/study.route";
import lostFoundRoutes from "./routes/lostfound.route";
dotenv.config();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

app.use(cors({
  origin: process.env.FRONTEND_URL || "https://blink-talk-ruddy.vercel.app",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/study", studyRoutes);
app.use("/api/lostfound", lostFoundRoutes);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});