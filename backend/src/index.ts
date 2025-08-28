import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import User from "./models/user.model.js";
import cors from "cors";
dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.post("/api/register", async (req, res) => {
  const { name, email, dob, phone } = req.body;
    try {
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

        if (newUser) {
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                dob: newUser.dob,
                phone: newUser.phone,
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        console.log("Error in signup controller", (error as Error).message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});
