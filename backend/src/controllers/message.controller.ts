import { Request, Response } from "express";
import User from "../models/user.model";
import Message from "../models/message.model";
import { getReceiverSocketId, io } from "../lib/socket";
import cloudinary from "../lib/cloudinary";

const isBlockedEitherWay = async (userA: string, userB: string) => {
  const [a, b] = await Promise.all([User.findById(userA), User.findById(userB)]);
  if (!a || !b) return true;
  const aBlockedB = a.blockedUsers?.some((id: any) => id.toString() === userB) || false;
  const bBlockedA = b.blockedUsers?.some((id: any) => id.toString() === userA) || false;
  return aBlockedB || bBlockedA;
};

export const getUsersForSidebar = async (req: any, res: Response) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    res.status(200).json(filteredUsers);
  } catch (error: any) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req: any, res: Response) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
      groupId: null,
      deletedBy: { $ne: myId }
    });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getGroupMessages = async (req: any, res: Response) => {
  try {
    const { groupId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({ groupId: groupId, deletedBy: { $ne: myId } })
      .populate("senderId", "fullName profilePic"); 
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req: any, res: Response) => {
  try {
    const { text, image, audio } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    
    const blocked = await isBlockedEitherWay(senderId.toString(), receiverId);
    if (blocked) {
      return res.status(403).json({ message: "Cannot send message — you or this user has blocked the other" });
    }

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    let audioUrl = null;
    if (audio) {
      const uploadResponse = await cloudinary.uploader.upload(audio, {
        resource_type: "video", 
      });
      audioUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      audio: audioUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error: any) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const clearChat = async (req: any, res: Response) => {
  try {
    const { id: otherUserId } = req.params;
    const myId = req.user._id;

    await Message.updateMany(
      {
        $or: [
          { senderId: myId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: myId },
        ],
        groupId: null,
      },
      { $addToSet: { deletedBy: myId } }
    );

    res.status(200).json({ message: "Chat cleared" });
  } catch (error: any) {
    console.log("Error in clearChat:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getStorageStats = async (req: any, res: Response) => {
  try {
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [{ senderId: myId }, { receiverId: myId }],
      groupId: null,
      deletedBy: { $ne: myId },
    });

    const totalMessages = messages.length;
    const imageMessages = messages.filter((m: any) => m.image).length;
    const audioMessages = messages.filter((m: any) => m.audio).length;
    const textMessages = messages.filter((m: any) => m.text && !m.image && !m.audio).length;
    const deletedMessages = messages.filter((m: any) => m.isDeleted).length;

    res.status(200).json({
      totalMessages,
      imageMessages,
      audioMessages,
      textMessages,
      deletedMessages,
    });
  } catch (error: any) {
    console.log("Error in getStorageStats:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const toggleReaction = async (req: any, res: Response) => {
  try {
    const { id: messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    const existingIndex = message.reactions.findIndex(
      (r: any) => r.userId.toString() === userId.toString() && r.emoji === emoji
    );

    if (existingIndex !== -1) {
      message.reactions.splice(existingIndex, 1);
    } else {
      const myReactionIndex = message.reactions.findIndex(
        (r: any) => r.userId.toString() === userId.toString()
      );
      if (myReactionIndex !== -1) message.reactions.splice(myReactionIndex, 1);
      message.reactions.push({ emoji, userId });
    }

    await message.save();

    const receiverId = message.receiverId?.toString();
    const senderId = message.senderId?.toString();

    [receiverId, senderId].forEach((id) => {
      if (id) {
        const socketId = getReceiverSocketId(id);
        if (socketId) {
          io.to(socketId).emit("reactionUpdated", {
            messageId,
            reactions: message.reactions,
          });
        }
      }
    });

    res.status(200).json({ reactions: message.reactions });
  } catch (error: any) {
    console.log("Error in toggleReaction:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markAsSeen = async (req: any, res: Response) => {
  try {
    const { id: senderId } = req.params;
    const userId = req.user._id;

    await Message.updateMany(
      { senderId, receiverId: userId, isSeen: false },
      { $set: { isSeen: true } }
    );

    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesSeen", { seenBy: userId });
    }

    res.status(200).json({ message: "Marked as seen" });
  } catch (error) {
    res.status(500).json({ message: "Error updating status" });
  }
};

export const deleteMessage = async (req: any, res: Response) => {
  try {
    const { id: messageId } = req.params;
    const { type } = req.body; // 'me' or 'everyone'
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (type === "everyone") {
      if (message.senderId.toString() !== userId.toString()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      await Message.findByIdAndUpdate(messageId, {
        text: "This message was deleted",
        image: null,
        audio: null,
        isDeleted: true,
      });

      // Notify both parties in the room/chat
      const receiverSocketId = getReceiverSocketId(message.receiverId?.toString() || "");
      const senderSocketId = getReceiverSocketId(message.senderId.toString());

      if (receiverSocketId) io.to(receiverSocketId).emit("messageDeletedEveryone", messageId);
      if (senderSocketId) io.to(senderSocketId).emit("messageDeletedEveryone", messageId);

      return res.status(200).json({ message: "Message deleted for everyone" });
    } else {
      // Logic for 'Delete for me'
      await Message.findByIdAndUpdate(messageId, {
        $addToSet: { deletedBy: userId }
      });
      return res.status(200).json({ message: "Message deleted for you" });
    }
  } catch (error: any) {
    console.log("Error in deleteMessage:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
