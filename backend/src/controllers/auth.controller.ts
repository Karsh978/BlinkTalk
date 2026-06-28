import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.model";
import Message from "../models/message.model";
import { generateToken } from "../lib/utils";
import cloudinary from "../lib/cloudinary";
import { getReceiverSocketId, io } from "../lib/socket";

// ── 1. Signup ──
export const signup = async (req: Request, res: Response) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ fullName, email, password: hashedPassword });

    if (newUser) {
      generateToken(newUser._id.toString(), res);
      await newUser.save();
      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
        privacy: newUser.privacy,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error: any) {
    console.log("Error in signup:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ── 2. Login ──
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

    generateToken(user._id.toString(), res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      privacy: user.privacy,
    });
  } catch (error: any) {
    console.log("Error in login:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ── 3. Logout ──
export const logout = (req: Request, res: Response) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error: any) {
    console.log("Error in logout:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ── 4. Update Profile Picture ──
export const updateProfile = async (req: any, res: Response) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (error: any) {
    console.log("Error in updateProfile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ── 5. Search Users ──
export const searchUsers = async (req: any, res: Response) => {
  try {
    const query = (req.query.query as string) || "";
    if (!query.trim()) return res.status(200).json([]);

    const users = await User.find({
      $or: [
        { fullName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
      _id: { $ne: req.user._id },
    })
      .select("-password")
      .limit(10);

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error searching users" });
  }
};

// ── 6. Find User By Contact (email or phone) ──
export const findUserByContact = async (req: any, res: Response) => {
  try {
    const { contact } = req.query;
    const userId = req.user._id;

    if (!contact) {
      return res.status(400).json({ message: "Contact parameter is required" });
    }

    const user = await User.findOne({
      $or: [{ email: contact }, { phoneNumber: contact }],
      _id: { $ne: userId },
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found with this email/number" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ── 7. Add Contact ──
export const addContact = async (req: any, res: Response) => {
  try {
    const { contactId } = req.body;
    const userId = req.user._id;

    if (contactId === userId.toString()) {
      return res.status(400).json({ message: "You cannot add yourself" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.contacts.includes(contactId)) {
      return res.status(400).json({ message: "Contact already added" });
    }

    user.contacts.push(contactId);
    await user.save();

    const contact = await User.findById(contactId).select("-password");
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ── 8. Get My Contacts ──
export const getContacts = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("contacts", "-password")
      .lean();

    res.status(200).json(user?.contacts || []);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ── 9. Update Privacy Settings ──
export const updatePrivacy = async (req: any, res: Response) => {
  try {
    const { lastSeenVisible, readReceipts } = req.body;
    const userId = req.user._id;

    const updated = await User.findByIdAndUpdate(
      userId,
      { privacy: { lastSeenVisible, readReceipts } },
      { new: true }
    ).select("-password");

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating privacy settings" });
  }
};

// ── 10. Mark Messages As Seen ──
export const markAsSeen = async (req: any, res: Response) => {
  try {
    const { id: senderId } = req.params;
    const userId = req.user._id;

    // Respect read receipts privacy setting
    const me = await User.findById(userId);
    if (!me?.privacy?.readReceipts) {
      return res.status(200).json({ message: "Read receipts disabled" });
    }

    await Message.updateMany(
      { senderId, receiverId: userId, isSeen: false },
      { $set: { isSeen: true } }
    );

    // Notify sender via socket that messages were seen
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesSeen", { seenBy: userId });
    }

    res.status(200).json({ message: "Marked as seen" });
  } catch (error) {
    console.log("Error in markAsSeen:", error);
    res.status(500).json({ message: "Error updating status" });
  }
};