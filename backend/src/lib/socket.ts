import { Server } from "socket.io";
import http from "http";
import express from "express";
import User from "../models/user.model";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "https://blink-talk-ruddy.vercel.app",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

export const userSocketMap: any = {};
export const getReceiverSocketId = (userId: string) => userSocketMap[userId];

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId as string;
  if (userId) userSocketMap[userId] = socket.id;
  socket.setMaxListeners(20);

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("joinGroup", (groupId) => socket.join(groupId));

  // ✅ WebRTC Signaling Events

  // Caller → Receiver: incoming call
  socket.on("callUser", ({ to, offer, callType, callerName, callerPic }) => {
    const receiverSocketId = userSocketMap[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incomingCall", {
        from: userId,
        offer,
        callType,      // "audio" | "video"
        callerName,
        callerPic,
      });
    }
  });

  // Receiver → Caller: call accepted with answer
  socket.on("answerCall", ({ to, answer }) => {
    const callerSocketId = userSocketMap[to];
    if (callerSocketId) {
      io.to(callerSocketId).emit("callAnswered", { answer });
    }
  });

  // Both sides: ICE candidates exchange
  socket.on("iceCandidate", ({ to, candidate }) => {
    const targetSocketId = userSocketMap[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit("iceCandidate", { candidate });
    }
  });

  // Either side: call ended/rejected
  socket.on("endCall", ({ to }) => {
    const targetSocketId = userSocketMap[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit("callEnded");
    }
  });

  // Receiver rejects call
  socket.on("rejectCall", ({ to }) => {
    const targetSocketId = userSocketMap[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit("callRejected");
    }
  });

  socket.on("disconnect", async () => {
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    if (userId) {
      try {
        await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
      } catch (e) {}
    }
  });
});

export { io, app, server };