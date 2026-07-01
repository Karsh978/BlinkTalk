import mongoose, { Document } from "mongoose";

// ✅ Add this interface
interface IMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId?: mongoose.Types.ObjectId;
  groupId?: mongoose.Types.ObjectId;
  text?: string;
  image?: string;
  audio?: string;
  isSeen: boolean;
  isDeleted: boolean;
  deletedBy: mongoose.Types.ObjectId[];
  reactions: {
  emoji: string;
  userId: mongoose.Types.ObjectId;
}[];
}

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", default: null },
    text: { type: String },
    image: { type: String },
    audio: { type: String, default: null },
    isSeen: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    reactions: [
  {
    emoji: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
],
    deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// ✅ Pass IMessage as generic type
const Message = mongoose.model<IMessage>("Message", messageSchema);
export default Message;