import { Response } from "express";
import Status from "../models/status.model";
import User from "../models/user.model";
import cloudinary from "../lib/cloudinary";

// Post a new status
export const createStatus = async (req: any, res: Response) => {
  try {
    const { image, text, textColor, textBg } = req.body;
    const userId = req.user._id;

    if (!image && !text) {
      return res.status(400).json({ message: "Image or text required" });
    }

    let imageUrl = null;
    if (image) {
      const upload = await cloudinary.uploader.upload(image);
      imageUrl = upload.secure_url;
    }

    const status = new Status({
      userId,
      image: imageUrl,
      text,
      textColor: textColor || "#ffffff",
      textBg:    textBg    || "#6c7bff",
    });

    await status.save();
    const populated = await status.populate("userId", "fullName profilePic");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Error creating status" });
  }
};

// Get all statuses from my contacts
export const getStatuses = async (req: any, res: Response) => {
  try {
    const userId = req.user._id;

    // Get my contacts
    const me = await User.findById(userId).lean();
    const contactIds = me?.contacts || [];

    // Include my own status too
    const allIds = [userId, ...contactIds];

    const statuses = await Status.find({
      userId: { $in: allIds },
      expiresAt: { $gt: new Date() }, // only non-expired
    })
      .populate("userId", "fullName profilePic")
      .populate("viewers", "fullName profilePic")
      .sort({ createdAt: -1 });

    // Group by user
    const grouped: Record<string, any> = {};
    for (const s of statuses) {
      const uid = (s.userId as any)._id.toString();
      if (!grouped[uid]) {
        grouped[uid] = {
          user: s.userId,
          statuses: [],
          hasUnread: false,
        };
      }
      const isSeen = s.viewers.some(
        (v: any) => v._id.toString() === userId.toString()
      );
      if (!isSeen) grouped[uid].hasUnread = true;
      grouped[uid].statuses.push(s);
    }

    res.status(200).json(Object.values(grouped));
  } catch (error) {
    res.status(500).json({ message: "Error fetching statuses" });
  }
};

// Mark a status as viewed
export const viewStatus = async (req: any, res: Response) => {
  try {
    const { statusId } = req.params;
    const userId = req.user._id;

    await Status.findByIdAndUpdate(statusId, {
      $addToSet: { viewers: userId },
    });

    res.status(200).json({ message: "Viewed" });
  } catch (error) {
    res.status(500).json({ message: "Error marking viewed" });
  }
};

// Delete my status
export const deleteStatus = async (req: any, res: Response) => {
  try {
    const { statusId } = req.params;
    const userId = req.user._id;

    const status = await Status.findById(statusId);
    if (!status) return res.status(404).json({ message: "Status not found" });
    if (status.userId.toString() !== userId.toString()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await Status.findByIdAndDelete(statusId);
    res.status(200).json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting status" });
  }
};