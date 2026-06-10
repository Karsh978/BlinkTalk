import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", default: null },
  // MessageSchema mein ye add karein
deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
isDeleted: { type: Boolean, default: false },
audio: { type: String, default: null },
  text: { type: String },
  image: { type: String },
  isSeen: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);