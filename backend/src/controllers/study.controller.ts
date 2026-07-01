import { Response } from "express";
import { StudyGroup, StudyMaterial } from "../models/study.model";

// ── STUDY GROUPS ──

export const createStudyGroup = async (req: any, res: Response) => {
  try {
    const { title, subject, level, exam, description, maxMembers, city, isOnline, meetingLink, schedule, lat, lng } = req.body;

    const group = new StudyGroup({
      userId: req.user._id,
      title, subject, level, exam, description,
      maxMembers: parseInt(maxMembers) || 5,
      members: [req.user._id],
      city,
      isOnline: isOnline === true || isOnline === "true",
      meetingLink, schedule,
      location: {
        type: "Point",
        coordinates: [parseFloat(lng) || 0, parseFloat(lat) || 0],
      },
    });

    await group.save();
    const populated = await group.populate("userId", "fullName profilePic");
    res.status(201).json(populated);
  } catch (error: any) {
    res.status(500).json({ message: "Error creating group" });
  }
};

export const getStudyGroups = async (req: any, res: Response) => {
  try {
    const { level, subject, latitude, longitude } = req.query;

    const query: any = { status: "active" };
    if (level   && level   !== "all") query.level   = level;
    if (subject && subject !== "all") query.subject  = { $regex: subject, $options: "i" };

    let groups;
    if (latitude && longitude) {
      groups = await StudyGroup.find({
        ...query,
        location: {
          $near: {
            $geometry: { type:"Point", coordinates: [parseFloat(longitude as string), parseFloat(latitude as string)] },
            $maxDistance: 50000,
          },
        },
      }).populate("userId members", "fullName profilePic").limit(30);
    } else {
      groups = await StudyGroup.find(query)
        .populate("userId members", "fullName profilePic")
        .sort({ createdAt: -1 }).limit(30);
    }

    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: "Error fetching groups" });
  }
};

export const joinStudyGroup = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const group = await StudyGroup.findById(id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group.members.includes(userId)) return res.status(400).json({ message: "Already a member" });
    if (group.members.length >= group.maxMembers) return res.status(400).json({ message: "Group is full" });

    group.members.push(userId);
    if (group.members.length >= group.maxMembers) group.status = "closed";
    await group.save();

    res.status(200).json({ message: "Joined successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error joining group" });
  }
};

export const leaveStudyGroup = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    await StudyGroup.findByIdAndUpdate(id, {
      $pull: { members: userId },
      status: "active",
    });

    res.status(200).json({ message: "Left group" });
  } catch (error) {
    res.status(500).json({ message: "Error leaving group" });
  }
};

// ── STUDY MATERIALS ──

export const createMaterial = async (req: any, res: Response) => {
  try {
    const { title, subject, level, exam, type, description, externalLink, class: cls } = req.body;

    const material = new StudyMaterial({
      userId: req.user._id,
      title, subject, level, exam, type,
      description, externalLink,
      class: cls,
    });

    await material.save();
    const populated = await material.populate("userId", "fullName profilePic");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Error sharing material" });
  }
};

export const getMaterials = async (req: any, res: Response) => {
  try {
    const { level, subject, type, exam } = req.query;

    const query: any = {};
    if (level   && level   !== "all") query.level   = level;
    if (type    && type    !== "all") query.type     = type;
    if (exam    && exam    !== "all") query.exam     = { $regex: exam,    $options: "i" };
    if (subject && subject !== "all") query.subject  = { $regex: subject, $options: "i" };

    const materials = await StudyMaterial.find(query)
      .populate("userId", "fullName profilePic")
      .sort({ createdAt: -1 }).limit(50);

    res.status(200).json(materials);
  } catch (error) {
    res.status(500).json({ message: "Error fetching materials" });
  }
};

export const likeMaterial = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const material = await StudyMaterial.findById(id);
    if (!material) return res.status(404).json({ message: "Not found" });

    const liked = material.likes.includes(userId);
    if (liked) {
      material.likes = material.likes.filter((l: any) => l.toString() !== userId.toString());
    } else {
      material.likes.push(userId);
    }
    await material.save();
    res.status(200).json({ liked: !liked, count: material.likes.length });
  } catch (error) {
    res.status(500).json({ message: "Error liking material" });
  }
};