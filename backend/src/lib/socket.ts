import { Server } from "socket.io";
import http from "http";
import express from "express";
import User from "../models/user.model";
import { clear } from "console";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "https://blink-talk-ruddy.vercel.app",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// 🔑 userId -> Set of active socketIds (multi-device support)
export const userSocketMap: Record<string, Set<string>> = {};

// Returns ALL active socketIds for a user (empty array if offline)
export const getReceiverSocketIds = (userId: string): string[] => {
  return userSocketMap[userId] ? Array.from(userSocketMap[userId]) : [];
};

// Backward-compat helper: returns first/any one socketId (use only where
// single-target is truly fine, e.g. quick checks). Prefer getReceiverSocketIds.
export const getReceiverSocketId = (userId: string): string | undefined => {
  const ids = userSocketMap[userId];
  return ids ? ids.values().next().value : undefined;
};

const addSocket = (userId: string, socketId: string) => {
  if (!userSocketMap[userId]) userSocketMap[userId] = new Set();
  userSocketMap[userId].add(socketId);
};

const removeSocket = (userId: string, socketId: string) => {
  const set = userSocketMap[userId];
  if (!set) return;
  set.delete(socketId);
  if (set.size === 0) delete userSocketMap[userId]; // fully offline only when no devices left
};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId as string;
  if (userId) addSocket(userId, socket.id);
  socket.setMaxListeners(20);

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("joinGroup", (groupId) => socket.join(groupId));

  // ✅ WebRTC Signaling Events (multi-device aware)

  // Caller → Receiver: ring on ALL of receiver's active devices
  socket.on("callUser", ({ to, offer, callType, callerName, callerPic }) => {
    const receiverSocketIds = getReceiverSocketIds(to);
    receiverSocketIds.forEach((socketId) => {
      io.to(socketId).emit("incomingCall", {
        from: userId,
        offer,
        callType,      // "audio" | "video"
        callerName,
        callerPic,
      });
    });
  });

  // Receiver → Caller: call accepted with answer.
  // Also tell caller's OTHER devices + receiver's OTHER devices that the
  // call was picked up elsewhere, so they can stop ringing.
  socket.on("answerCall", ({ to, answer }) => {
    const callerSocketIds = getReceiverSocketIds(to);
    callerSocketIds.forEach((socketId) => {
      io.to(socketId).emit("callAnswered", { answer, answeredBy: socket.id });
    });

    // stop ringing on this same user's other devices (if they also got incomingCall)
    if (userId) {
      getReceiverSocketIds(userId)
        .filter((id) => id !== socket.id)
        .forEach((socketId) => io.to(socketId).emit("callEnded"));
    }
  });

  // Both sides: ICE candidates — send to all target's active devices
  socket.on("iceCandidate", ({ to, candidate }) => {
    getReceiverSocketIds(to).forEach((socketId) => {
      io.to(socketId).emit("iceCandidate", { candidate });
    });
  });

  // Either side: call ended/rejected — notify all target's devices
  socket.on("endCall", ({ to }) => {
    getReceiverSocketIds(to).forEach((socketId) => {
      io.to(socketId).emit("callEnded");
    });
  });

  // Receiver rejects call — notify all of caller's devices
  socket.on("rejectCall", ({ to }) => {
    getReceiverSocketIds(to).forEach((socketId) => {
      io.to(socketId).emit("callRejected");
    });
  });

  socket.on("disconnect", async () => {
    if (userId) {
      const wasOnline = !!userSocketMap[userId];
      removeSocket(userId, socket.id);
      const stillOnline = !!userSocketMap[userId];

      // Only broadcast + update lastSeen when user has NO devices left online
      if (wasOnline && !stillOnline) {
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
        try {
          await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
        } catch (e) {
          console.error("Failed to update lastSeen:", e);
        }
      }
    }
  });
});

export { io, app, server };