import mongoose, { Document } from "mongoose";

interface IStatus extends Document {
  userId: mongoose.Types.ObjectId;
  image?: string;
  text?: string;
  textColor?: string;
  textBg?: string;
  viewers: mongoose.Types.ObjectId[];
  expiresAt: Date;
}

const statusSchema = new mongoose.Schema(
  {
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    image:     { type: String, default: null },
    text:      { type: String, default: null },
    textColor: { type: String, default: "#ffffff" },
    textBg:    { type: String, default: "#6c7bff" },
    viewers:   [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) }, // 24hrs
  },
  { timestamps: true }
);

// Auto delete after 24 hours
statusSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Status = mongoose.model<IStatus>("Status", statusSchema);
export default Status;