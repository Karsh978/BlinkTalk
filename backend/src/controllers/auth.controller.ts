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
    const { profilePic, fullName, bio } = req.body;
    const userId = req.user._id;

    const updateFields: any = {};

    if (fullName) updateFields.fullName = fullName;
    if (bio !== undefined) updateFields.bio = bio;

    if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      updateFields.profilePic = uploadResponse.secure_url;
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateFields,
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


// Update blood donor profile
export const updateDonorProfile = async (req: any, res: Response) => {
  try {
    const { bloodGroup, isAvailableDonor } = req.body;
    const userId = req.user._id;

    const updated = await User.findByIdAndUpdate(
      userId,
      { bloodGroup, isAvailableDonor },
      { new: true }
    ).select("-password");

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating donor profile" });
  }
};

// Update user's GPS location
export const updateLocation = async (req: any, res: Response) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.user._id;

    if (latitude == null || longitude == null) {
      return res.status(400).json({ message: "Latitude and longitude required" });
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      {
        location: { type: "Point", coordinates: [longitude, latitude] },
        locationUpdatedAt: new Date(),
      },
      { new: true }
    ).select("-password");

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating location" });
  }
};

// Find nearby blood donors
export const findBloodDonors = async (req: any, res: Response) => {
  try {
    const { bloodGroup, latitude, longitude, maxDistance } = req.query;
    const userId = req.user._id;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Your location is required to search" });
    }

    const query: any = {
      _id: { $ne: userId },
      isAvailableDonor: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude as string), parseFloat(latitude as string)],
          },
          $maxDistance: maxDistance ? parseInt(maxDistance as string) : 25000, // default 25km
        },
      },
    };

    if (bloodGroup && bloodGroup !== "all") {
      query.bloodGroup = bloodGroup;
    }

    const donors = await User.find(query).select("-password").limit(50);

    // Calculate distance manually for display (MongoDB $near doesn't return distance directly)
    const donorsWithDistance = donors.map((d: any) => {
      const dist = getDistanceKm(
        parseFloat(latitude as string),
        parseFloat(longitude as string),
        d.location.coordinates[1],
        d.location.coordinates[0]
      );
      return { ...d.toObject(), distanceKm: dist };
    });

    res.status(200).json(donorsWithDistance);
  } catch (error) {
    console.log("Error finding donors:", error);
    res.status(500).json({ message: "Error finding donors" });
  }
};

// Haversine formula — distance between two GPS points in km
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // rounded to 1 decimal
}

export const toggleBlockUser = async (req: any, res: Response) => {
  try {
    const { id: targetId } = req.params;
    const myId = req.user._id;

    if (targetId === myId.toString()) {
      return res.status(400).json({ message: "You cannot block yourself" });
    }

    const me = await User.findById(myId);
    if (!me) return res.status(404).json({ message: "User not found" });

    const isBlocked = me.blockedUsers.some((id: any) => id.toString() === targetId);

    const updated = await User.findByIdAndUpdate(
      myId,
      isBlocked
        ? { $pull: { blockedUsers: targetId } }
        : { $addToSet: { blockedUsers: targetId } },
      { new: true }
    ).select("-password");

    res.status(200).json({
      message: isBlocked ? "User unblocked" : "User blocked",
      isBlocked: !isBlocked,
      authUser: updated,
    });
  } catch (error: any) {
    console.log("Error in toggleBlockUser:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getBlockedUsers = async (req: any, res: Response) => {
  try {
    const me = await User.findById(req.user._id).populate(
      "blockedUsers",
      "fullName profilePic email"
    );
    res.status(200).json(me?.blockedUsers || []);
  } catch (error: any) {
    console.log("Error in getBlockedUsers:", error.message);
    res.status(500).json({ message: "Internal server error" });
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