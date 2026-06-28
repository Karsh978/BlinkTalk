import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.model";
import { generateToken } from "../lib/utils";
import cloudinary from "../lib/cloudinary";

export const signup = async (req: Request, res: Response) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email already exists" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      // Generate JWT token here
      generateToken(newUser._id.toString(), res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error: any) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id.toString(), res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error: any) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req: Request, res: Response) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 }); // Cookie ko delete karne ke liye
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error: any) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req: any, res: Response) => {
  try {
    const { profilePic } = req.body; // Base64 image string from frontend
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    // Cloudinary par upload karein
    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    
    // Database update karein
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error: any) {
    console.log("Error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const searchUsers = async (req: any, res: Response) => {
  try {
    const { query } = req.query;
    const users = await User.find({
      $or: [
        { fullName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } }
      ],
      _id: { $ne: req.user._id } // Khud ko hide karein
    }).select("-password").limit(10);

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error searching users" });
  }
};

export const findUserByContact = async (req: any, res: any) => {
  try {
    const { contact } = req.query; // Email ya Phone number
    const userId = req.user._id;

    // Aisa user dhoondo jiska email ya phone match ho (aur wo khud na ho)
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

// Add a user to contacts
export const addContact = async (req: any, res: Response) => {
  try {
    const { contactId } = req.body;
    const userId = req.user._id;

    if (contactId === userId.toString()) {
      return res.status(400).json({ message: "You cannot add yourself" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Already added check
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

// Get my contacts list
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