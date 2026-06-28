import { Server } from "socket.io";
import http from "http";
import express from "express";
import User from "../models/user.model";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "https://blink-talk-ruddy.vercel.app", // ✅ frontend URL
    methods: ["GET", "POST"],
    credentials: true, // ✅ needed for cookie auth
  },
});

export const userSocketMap: any = {};

export const getReceiverSocketId = (userId: string) => userSocketMap[userId];

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId as string;
  if (userId) userSocketMap[userId] = socket.id;
  socket.setMaxListeners(20);

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("joinGroup", (groupId) => {
    socket.join(groupId);
  });

  // In socket.ts, update the disconnect handler:
socket.on("disconnect", async () => {
  delete userSocketMap[userId];
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // ✅ Update lastSeen in DB when user goes offline
  if (userId) {
    try {
      await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
    } catch (e) {}
  }
});
});

export { io, app, server };