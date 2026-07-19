import mongoose from "mongoose";
import Message from "../models/message.model.js";

let isConnected = false;

export const connectDB = async () => {
    if (isConnected) {
        return;
    }
    
    if (!process.env.MONGO_URI) {
        console.error("MONGO_URI is missing in environment variables!");
        return;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        isConnected = true;
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.log("MongoDB connection error", error);
    }
}