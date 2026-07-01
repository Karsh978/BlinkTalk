import mongoose, { Document } from "mongoose";

interface ILostFound extends Document {
  userId: mongoose.Types.ObjectId;
  type: "lost" | "found";
  title: string;
  description: string;
  image?: string;
  category: string;
  location: { type: string; coordinates: number[] };
  area: string;
  city: string;
  date: Date;
  reward?: number;
  status: "active" | "resolved";
  contact: string;
}

const lostFoundSchema = new mongoose.Schema(
  {
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type:        { type: String, enum: ["lost","found"], required: true },
    title:       { type: String, required: true },
    description: { type: String, required: true },
    image:       { type: String, default: null },
    category:    { type: String, default: "other" },
    location: {
      type:        { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0,0] },
    },
    area:    { type: String, default: "" },
    city:    { type: String, default: "" },
    date:    { type: Date, default: Date.now },
    reward:  { type: Number, default: 0 },
    status:  { type: String, enum: ["active","resolved"], default: "active" },
    contact: { type: String, default: "" },
  },
  { timestamps: true }
);

lostFoundSchema.index({ location: "2dsphere" });

const LostFound = mongoose.model<ILostFound>("LostFound", lostFoundSchema);
export default LostFound;