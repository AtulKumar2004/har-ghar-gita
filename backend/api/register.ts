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
    if (user) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const newUser = new User({ name, email, dob, phone });
    await newUser.save();

    return res.status(201).json(newUser);
  } catch (error: any) {
    console.error("Error in signup controller:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
