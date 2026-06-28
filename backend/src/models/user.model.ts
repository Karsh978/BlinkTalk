import mongoose, { Document } from "mongoose";

// ✅ Add this interface
interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  profilePic: string;
  phoneNumber?: string;
  lastSeen: Date;
  contacts: mongoose.Types.ObjectId[];
  privacy: {
    lastSeenVisible: boolean;
    readReceipts: boolean;
  };
}

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    profilePic: { type: String, default: "" },
    phoneNumber: { type: String, unique: true, sparse: true },
    lastSeen: { type: Date, default: Date.now },
    contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    privacy: {
      lastSeenVisible: { type: Boolean, default: true },
      readReceipts: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// ✅ Pass IUser as generic type
const User = mongoose.model<IUser>("User", userSchema);
export default User;