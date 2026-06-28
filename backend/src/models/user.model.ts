import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    profilePic: { type: String, default: "" },
    phoneNumber: { type: String, unique: true, sparse: true },
    lastSeen: { type: Date, default: Date.now },
    contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // ✅ NEW
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;