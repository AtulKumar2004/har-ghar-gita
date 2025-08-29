import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from "../src/lib/db.js";
import Message from '../src/models/message.model.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email, message } = req.body;

  try {
    await connectDB();

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Please provide all the fields" });
    }

    const newMessage = new Message({
      name: name,
      email: email,
      message: message
    });
    await newMessage.save();

    return res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in contact us controller:", (error as Error).message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
