import mongoose, { Document } from "mongoose";

interface IRide extends Document {
  userId: mongoose.Types.ObjectId;
  type: "offer" | "request";
  from: string;
  to: string;
  fromLocation: { type: string; coordinates: number[] };
  toLocation: { type: string; coordinates: number[] };
  date: Date;
  time: string;
  seats: number;
  seatsLeft: number;
  price?: number;
  vehicle?: string;
  note?: string;
  status: "active" | "full" | "cancelled" | "completed";
}

const rideSchema = new mongoose.Schema(
  {
    userId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type:     { type: String, enum: ["offer","request"], required: true },
    from:     { type: String, required: true },
    to:       { type: String, required: true },
    fromLocation: {
      type:        { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    toLocation: {
      type:        { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    date:     { type: Date, required: true },
    time:     { type: String, required: true },
    seats:    { type: Number, default: 1 },
    seatsLeft:{ type: Number, default: 1 },
    price:    { type: Number, default: 0 },
    vehicle:  { type: String, default: "" },
    note:     { type: String, default: "" },
    status:   { type: String, enum: ["active","full","cancelled","completed"], default: "active" },
  },
  { timestamps: true }
);

rideSchema.index({ fromLocation: "2dsphere" });

const Ride = mongoose.model<IRide>("Ride", rideSchema);
export default Ride;