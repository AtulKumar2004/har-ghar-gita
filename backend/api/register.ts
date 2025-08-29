import type { VercelRequest, VercelResponse } from '@vercel/node';
import dotenv from "dotenv";
import { connectDB } from "../src/lib/db.js";
import User from "../src/models/user.model.js";

dotenv.config();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email, dob, phone } = req.body;

  try {
    await connectDB();

    if (!name || !email || !dob || !phone) {
      return res.status(400).json({ message: "Please provide all the fields" });
    }

    const user = await User.findOne({ email });
    const phoneNo = await User.findOne({ phone });
    if (user) return res.status(400).json({ message: "This user has already registered!" });
    if (phoneNo) return res.status(400).json({ message: "This user has already registered!" });

    const newUser = new User({
      name: name,
      email: email,
      dob: dob,
      phone: phone
    });
    await newUser.save();

    return res.status(201).json(newUser);
  } catch (error) {
    console.error("Error in register controller:", (error as Error).message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

