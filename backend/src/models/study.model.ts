import mongoose, { Document } from "mongoose";

// Study Group Model
interface IStudyGroup extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  subject: string;
  level: "school" | "college" | "competitive";
  exam?: string;
  description: string;
  maxMembers: number;
  members: mongoose.Types.ObjectId[];
  location: { type: string; coordinates: number[] };
  city: string;
  isOnline: boolean;
  meetingLink?: string;
  schedule: string;
  status: "active" | "closed";
}

const studyGroupSchema = new mongoose.Schema(
  {
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title:       { type: String, required: true },
    subject:     { type: String, required: true },
    level:       { type: String, enum: ["school","college","competitive"], required: true },
    exam:        { type: String, default: "" },
    description: { type: String, default: "" },
    maxMembers:  { type: Number, default: 5 },
    members:     [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    location: {
      type:        { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    city:        { type: String, default: "" },
    isOnline:    { type: Boolean, default: false },
    meetingLink: { type: String, default: "" },
    schedule:    { type: String, default: "" },
    status:      { type: String, enum: ["active","closed"], default: "active" },
  },
  { timestamps: true }
);

studyGroupSchema.index({ location: "2dsphere" });

// Study Material Model
interface IStudyMaterial extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  subject: string;
  level: "school" | "college" | "competitive";
  exam?: string;
  type: "notes" | "pyq" | "book" | "video" | "other";
  description: string;
  fileUrl?: string;
  externalLink?: string;
  class?: string;
  likes: mongoose.Types.ObjectId[];
}

const studyMaterialSchema = new mongoose.Schema(
  {
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title:        { type: String, required: true },
    subject:      { type: String, required: true },
    level:        { type: String, enum: ["school","college","competitive"], required: true },
    exam:         { type: String, default: "" },
    type:         { type: String, enum: ["notes","pyq","book","video","other"], default: "notes" },
    description:  { type: String, default: "" },
    fileUrl:      { type: String, default: "" },
    externalLink: { type: String, default: "" },
    class:        { type: String, default: "" },
    likes:        [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export const StudyGroup    = mongoose.model<IStudyGroup>("StudyGroup", studyGroupSchema);
export const StudyMaterial = mongoose.model<IStudyMaterial>("StudyMaterial", studyMaterialSchema);