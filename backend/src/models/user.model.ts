import mongoose, { Document } from "mongoose";

interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  profilePic: string;
  bio?: string;
  phoneNumber?: string;
  lastSeen: Date;
  contacts: mongoose.Types.ObjectId[];
  blockedUsers: mongoose.Types.ObjectId[];
  
  privacy: {
    lastSeenVisible: boolean;
    readReceipts: boolean;
  };
  // ✅ NEW
  bloodGroup?: string;
  isAvailableDonor: boolean;
  location: {
    type: string;
    coordinates: number[]; // [longitude, latitude]
  };
  locationUpdatedAt?: Date;
}

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    profilePic: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 150 },
    phoneNumber: { type: String, unique: true, sparse: true },
    lastSeen: { type: Date, default: Date.now },
    contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    privacy: {
      lastSeenVisible: { type: Boolean, default: true },
      readReceipts: { type: Boolean, default: true },
    },
    

    // ✅ Blood donor fields
    bloodGroup: {
      type: String,
      enum: ["A+","A-","B+","B-","AB+","AB-","O+","O-", null],
      default: null,
    },
    isAvailableDonor: { type: Boolean, default: false },

    // ✅ GPS location (GeoJSON format — required for $near queries)
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    locationUpdatedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// ✅ Geo index — required for distance-based queries
userSchema.index({ location: "2dsphere" });

const User = mongoose.model<IUser>("User", userSchema);
export default User;