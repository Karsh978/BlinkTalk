import { Request, Response } from "express";
import User from "../models/user.model";
import Message from "../models/message.model";
import { getReceiverSocketId, io } from "../lib/socket";
import cloudinary from "../lib/cloudinary";



const isBlockedEitherWay = async (userA: string, userB: string) => {
  const [a, b] = await Promise.all([User.findById(userA), User.findById(userB)]);
  if (!a || !b) return true;
  const aBlockedB = a.blockedUsers.some((id: any) => id.toString() === userB);
  const bBlockedA = b.blockedUsers.some((id: any) => id.toString() === userA);
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
      deletedBy: { $ne: myId } // <--- YE ZAROORI HAI: Sirf private messages
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

    const messages = await Message.find({ groupId: groupId, deletedBy: { $ne: myId } }) // <--- SIRF is group ke messages
      .populate("senderId", "fullName profilePic"); 
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};



export const sendMessage = async (req: any, res: Response) => {
  try {
    const { text, image,audio  } = req.body;
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
      // Audio ko Cloudinary par upload karein (resource_type: "video" use hota hai audio ke liye)
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




export const markAsSeen = async (req: any, res: Response) => {
  try {
    const { id: senderId } = req.params; // Jiske messages humne dekhe
    const userId = req.user._id;

    await Message.updateMany(
      { senderId, receiverId: userId, isSeen: false },
      { $set: { isSeen: true } }
    );

    // Sender ko batao ki unke messages "Seen" ho gaye hain
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
      
      // Socket: Sabko batao message delete ho gaya
      io.emit("messageDeletedEveryone", messageId);
    } else {
      // 'Delete for me': User ID ko 'deletedBy' array mein daal do
      await Message.findByIdAndUpdate(messageId, {
        $addToSet: { deletedBy: userId }
      });
    }

    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting message" });
  }
};

export const sendGroupMessage = async (req: any, res: any) => {
  try {
    const { text, image } = req.body;
    const { groupId } = req.params;
    const senderId = req.user._id;

    let imageUrl = "";
    if (image) {
      // Agar image hai toh Cloudinary par upload karein (Production logic)
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      groupId, // Note: Humne Message Model mein groupId add kiya hai
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // SOCKET.IO REAL-TIME LOGIC:
    // Hum message ko us 'Room' mein bhejenge jiska naam groupId hai.
    // Jo bhi members online honge aur is room mein honge, unhe message mil jayega.
    io.to(groupId).emit("newGroupMessage", {
        ...newMessage.toObject(),
        senderId: {
            _id: req.user._id,
            fullName: req.user.fullName,
            profilePic: req.user.profilePic
        }
    });

    res.status(201).json(newMessage);
  } catch (error: any) {
    console.log("Error in sendGroupMessage: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};