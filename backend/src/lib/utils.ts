import jwt from "jsonwebtoken";
import { Response } from "express";

export const generateToken = (userId: string, res: Response) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    httpOnly: true, // Prevent XSS attacks (Very Important for Resume)
    sameSite: "strict", // Prevent CSRF attacks
    secure: process.env.NODE_ENV !== "development",
  });

  return token;
};