import { Response } from "express";
import LostFound from "../models/lostfound.model";
import cloudinary from "../lib/cloudinary";

export const createPost = async (req: any, res: Response) => {
  try {
    const { type, title, description, image, category, area, city, date, reward, contact, lat, lng } = req.body;

    let imageUrl = null;
    if (image) {
      const upload = await cloudinary.uploader.upload(image, { folder: "lostfound" });
      imageUrl = upload.secure_url;
    }

    const post = new LostFound({
      userId: req.user._id,
      type, title, description, category,
      image: imageUrl,
      area, city,
      date: date ? new Date(date) : new Date(),
      reward: parseFloat(reward) || 0,
      contact: contact || req.user.phoneNumber || req.user.email,
      location: {
        type: "Point",
        coordinates: [parseFloat(lng)||0, parseFloat(lat)||0],
      },
    });

    await post.save();
    const populated = await post.populate("userId","fullName profilePic phoneNumber email");
    res.status(201).json(populated);
  } catch (error: any) {
    console.log("Error creating lost/found post:", error.message);
    res.status(500).json({ message: "Error creating post" });
  }
};

export const getPosts = async (req: any, res: Response) => {
  try {
    const { type, category, latitude, longitude, city } = req.query;

    const query: any = { status: "active" };
    if (type     && type     !== "all") query.type     = type;
    if (category && category !== "all") query.category = category;
    if (city)    query.city = { $regex: city, $options: "i" };

    let posts;
    if (latitude && longitude) {
      posts = await LostFound.find({
        ...query,
        location: {
          $near: {
            $geometry: { type:"Point", coordinates: [parseFloat(longitude as string), parseFloat(latitude as string)] },
            $maxDistance: 50000, // 50km
          },
        },
      }).populate("userId","fullName profilePic phoneNumber email").limit(50);
    } else {
      posts = await LostFound.find(query)
        .populate("userId","fullName profilePic phoneNumber email")
        .sort({ createdAt: -1 }).limit(50);
    }

    // Add distance
    const withDist = posts.map((p: any) => {
      let distanceKm = null;
      if (latitude && longitude) {
        const R = 6371;
        const dLat = ((p.location.coordinates[1] - parseFloat(latitude as string)) * Math.PI) / 180;
        const dLon = ((p.location.coordinates[0] - parseFloat(longitude as string)) * Math.PI) / 180;
        const a = Math.sin(dLat/2)**2 + Math.cos(parseFloat(latitude as string)*Math.PI/180)*Math.cos(p.location.coordinates[1]*Math.PI/180)*Math.sin(dLon/2)**2;
        distanceKm = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 10) / 10;
      }
      return { ...p.toObject(), distanceKm };
    });

    res.status(200).json(withDist);
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts" });
  }
};

export const resolvePost = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const post = await LostFound.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    post.status = "resolved";
    await post.save();
    res.status(200).json({ message: "Marked as resolved" });
  } catch (error) {
    res.status(500).json({ message: "Error resolving post" });
  }
};

export const deletePost = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const post = await LostFound.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    await LostFound.findByIdAndDelete(id);
    res.status(200).json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting post" });
  }
};