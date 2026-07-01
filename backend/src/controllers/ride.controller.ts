import { Response } from "express";
import Ride from "../models/ride.model";

// Post a ride (offer or request)
export const createRide = async (req: any, res: Response) => {
  try {
    const {
      type, from, to,
      fromLat, fromLng, toLat, toLng,
      date, time, seats, price, vehicle, note
    } = req.body;

    const ride = new Ride({
      userId: req.user._id,
      type, from, to,
      fromLocation: { type:"Point", coordinates: [parseFloat(fromLng)||0, parseFloat(fromLat)||0] },
      toLocation:   { type:"Point", coordinates: [parseFloat(toLng)||0,   parseFloat(toLat)||0]   },
      date: new Date(date),
      time, price, vehicle, note,
      seats:     parseInt(seats) || 1,
      seatsLeft: parseInt(seats) || 1,
    });

    await ride.save();
    const populated = await ride.populate("userId", "fullName profilePic phoneNumber");
    res.status(201).json(populated);
  } catch (error: any) {
    console.log("Error creating ride:", error.message);
    res.status(500).json({ message: "Error creating ride" });
  }
};

// Get nearby rides with filters
export const getRides = async (req: any, res: Response) => {
  try {
    const { type, latitude, longitude, from, to, date } = req.query;
    const userId = req.user._id;

    const query: any = {
      status: "active",
      _id: { $ne: userId },
    };

    if (type && type !== "all") query.type = type;
    if (from) query.from = { $regex: from, $options: "i" };
    if (to)   query.to   = { $regex: to,   $options: "i" };
    if (date) {
      const d = new Date(date as string);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      query.date = { $gte: d, $lt: next };
    }

    let rides;

    if (latitude && longitude) {
      // GPS based — sort by distance
      rides = await Ride.find({
        ...query,
        fromLocation: {
          $near: {
            $geometry: { type:"Point", coordinates: [parseFloat(longitude as string), parseFloat(latitude as string)] },
            $maxDistance: 100000, // 100km
          },
        },
      }).populate("userId", "fullName profilePic phoneNumber").limit(50);
    } else {
      rides = await Ride.find(query)
        .populate("userId", "fullName profilePic phoneNumber")
        .sort({ createdAt: -1 })
        .limit(50);
    }

    // Add distance if GPS available
    const ridesWithDist = rides.map((r: any) => {
      let distanceKm = null;
      if (latitude && longitude) {
        distanceKm = getDistanceKm(
          parseFloat(latitude as string), parseFloat(longitude as string),
          r.fromLocation.coordinates[1], r.fromLocation.coordinates[0]
        );
      }
      return { ...r.toObject(), distanceKm };
    });

    res.status(200).json(ridesWithDist);
  } catch (error: any) {
    console.log("Error getting rides:", error);
    res.status(500).json({ message: "Error fetching rides" });
  }
};

// Delete my ride
export const deleteRide = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const ride = await Ride.findById(id);
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    if (ride.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    await Ride.findByIdAndDelete(id);
    res.status(200).json({ message: "Ride deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting ride" });
  }
};

// Get my posted rides
export const getMyRides = async (req: any, res: Response) => {
  try {
    const rides = await Ride.find({ userId: req.user._id })
      .populate("userId", "fullName profilePic phoneNumber")
      .sort({ createdAt: -1 });
    res.status(200).json(rides);
  } catch (error) {
    res.status(500).json({ message: "Error fetching your rides" });
  }
};

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 10) / 10;
}