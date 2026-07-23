import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import User from "./models/user.model.js";
import cors from "cors";
import Message from "./models/message.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { protect, admin } from "./middleware/authMiddleware.js";
import TestSubmission from "./models/testSubmission.model.js";
import { sendRegistrationEmail, sendTestSubmittedEmail, sendTestGradedEmail, sendPasswordResetEmail } from "./services/email.service.js";
import crypto from "crypto";
dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Ensure database is connected before processing any requests (vital for Vercel Serverless)
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.post("/api/register", async (req, res) => {
  const { name, email, dob, phone, password } = req.body;
    try {
        if (!name || !email || !dob || !phone || !password) {
            return res.status(400).json({ message: "Please provide all the fields including password" });
        }
        const user = await User.findOne({ email });
        const phoneNo = await User.findOne({ phone });
        if (user) return res.status(400).json({ message: "Email already registered!" });
        if (phoneNo) return res.status(400).json({ message: "Phone already registered!" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const role = email === 'admin@harghar.com' ? 'admin' : 'student';

        const newUser = new User({
            name,
            email,
            dob,
            phone,
            password: hashedPassword,
            role
        });

        if (newUser) {
            await newUser.save();
            
            const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET || "fallback_secret", { expiresIn: '30d' });

            // Await email so it completes before Vercel serverless shuts down
            try {
                await sendRegistrationEmail(newUser.email as string, newUser.name as string);
            } catch (emailError) {
                console.error("Registration email failed:", emailError);
            }

            res.status(201).json({
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                token
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        console.log("Error in register controller", (error as Error).message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;
    try {
        if (!name || !email || !message) {
            return res.status(400).json({ message: "Please provide all the fields" });
        }

        const newMessage = new Message({
            name: name,
            email: email,
            message: message
        });

        if (newMessage) {
            await newMessage.save();

            res.status(201).json({
                _id: newMessage._id,
                name: newMessage.name,
                email: newMessage.email,
                message: newMessage.message
            });
        } else {
            res.status(400).json({ message: "Invalid message entry" });
        }
    } catch (error) {
        console.log("Error in contact us controller", (error as Error).message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && user.password && (await bcrypt.compare(password, user.password as string))) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "fallback_secret", { expiresIn: '30d' });
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/api/auth/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/api/forgot-password", async (req, res) => {
  const { email, phone } = req.body;
  try {
    const user = await User.findOne({ email, phone });
    if (!user) return res.status(404).json({ message: "User with this email and phone not found" });
    
    const resetToken = crypto.randomBytes(32).toString('hex');
    const salt = await bcrypt.genSalt(10);
    user.resetPasswordToken = await bcrypt.hash(resetToken, salt);
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    
    await user.save();
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
    
    // Await email so it completes before Vercel serverless shuts down
    try {
        await sendPasswordResetEmail(user.email as string, user.name as string, resetUrl);
    } catch (emailError) {
        console.error("Password reset email failed:", emailError);
    }
    
    res.json({ message: "Password reset link sent to your email" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/api/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  
  try {
    const users = await User.find({ resetPasswordExpires: { $gt: new Date() } });
    let targetUser = null;
    
    for (const user of users) {
      if (user.resetPasswordToken && await bcrypt.compare(token, user.resetPasswordToken as string)) {
        targetUser = user;
        break;
      }
    }
    
    if (!targetUser) {
      return res.status(400).json({ message: "Invalid or expired password reset token" });
    }
    
    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(newPassword, salt);
    
    await User.updateOne(
      { _id: targetUser._id },
      { 
        $set: { password: newHashedPassword },
        $unset: { resetPasswordToken: "", resetPasswordExpires: "" } 
      }
    );
    
    res.json({ message: "Password updated successfully. You can now login." });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Admin: Get all users
app.get("/api/admin/users", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Admin: Delete user
app.delete("/api/admin/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Admin: Edit user
app.put("/api/admin/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Books CRUD
import Book from "./models/book.model.js";

app.get("/api/books", async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/api/books/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/api/books", async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.put("/api/books/:id", async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.delete("/api/books/:id", async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    const chapters = await Chapter.find({ bookId });
    const chapterIds = chapters.map((ch) => ch._id);

    await Question.deleteMany({ chapterId: { $in: chapterIds } });
    await Chapter.deleteMany({ bookId });
    await Book.findByIdAndDelete(bookId);

    res.status(200).json({ message: "Book and its associated chapters and questions deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Chapters CRUD
import Chapter from "./models/chapter.model.js";

app.get("/api/books/:bookId/chapters", async (req, res) => {
  try {
    const chapters = await Chapter.find({ bookId: req.params.bookId }).sort({ order: 1 });
    res.status(200).json(chapters);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/api/chapters/:id", async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id).populate("bookId", "title");
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });
    res.status(200).json(chapter);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/api/chapters", async (req, res) => {
  try {
    const chapter = new Chapter(req.body);
    await chapter.save();
    res.status(201).json(chapter);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.put("/api/chapters/:id", async (req, res) => {
  try {
    const chapter = await Chapter.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });
    res.status(200).json(chapter);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.delete("/api/chapters/:id", async (req, res) => {
  try {
    const chapterId = req.params.id;
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });

    await Question.deleteMany({ chapterId });
    await Chapter.findByIdAndDelete(chapterId);

    res.status(200).json({ message: "Chapter and its associated questions deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Questions CRUD
import Question from "./models/question.model.js";

app.get("/api/chapters/:chapterId/questions", async (req, res) => {
  try {
    const questions = await Question.find({ chapterId: req.params.chapterId });
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/api/questions", async (req, res) => {
  try {
    const question = new Question(req.body);
    await question.save();
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

app.put("/api/questions/:id", async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!question) return res.status(404).json({ message: "Question not found" });
    res.status(200).json(question);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.delete("/api/questions/:id", async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });
    res.status(200).json({ message: "Question deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Test Submissions
app.post("/api/tests/submit", protect, async (req, res) => {
  try {
    const { chapterId, answers, warnings } = req.body;
    
    // Fetch all questions for this chapter to calculate points and score
    const questions = await Question.find({ chapterId });
    let totalPoints = 0;
    let score = 0;
    let hasWriting = false;

    // We will rebuild the answers array to ensure awardedPoints is correctly set
    const processedAnswers = [];

    for (const q of questions as any[]) {
      const qPoints = q.points || 1;
      totalPoints += qPoints;
      
      if (q.type === 'writing') {
        hasWriting = true;
      }
      
      const submittedAnswer = answers.find((a: any) => a.questionId.toString() === q._id.toString());
      if (submittedAnswer) {
        let awardedPoints = 0;
        if (q.type === 'multiple_select_mcq') {
          const selectedOptionIndices: number[] = submittedAnswer.selectedOptionIndices || [];
          const correctOptionIndices: number[] = q.correctOptionIndices || [];
          
          if (correctOptionIndices.length > 0) {
            const pointsPerCorrect = qPoints / correctOptionIndices.length;
            let earned = 0;
            let penalty = 0;
            
            selectedOptionIndices.forEach(idx => {
              if (correctOptionIndices.includes(idx)) {
                earned += pointsPerCorrect;
              } else {
                penalty += pointsPerCorrect;
              }
            });
            
            awardedPoints = Math.max(0, earned - penalty);
            // Round to 2 decimal places
            awardedPoints = Math.round(awardedPoints * 100) / 100;
            score += awardedPoints;
          }
        } else if (q.type !== 'writing' && submittedAnswer.selectedOptionIndex === q.correctOptionIndex) {
          awardedPoints = qPoints;
          score += awardedPoints;
        }
        processedAnswers.push({
          ...submittedAnswer,
          awardedPoints
        });
      }
    }

    const status = hasWriting ? 'pending' : 'graded';

    const submission = new TestSubmission({
      userId: req.user._id,
      chapterId,
      answers: processedAnswers,
      warnings,
      score,
      totalPoints,
      status
    });
    
    await submission.save();
    
    // Fetch user and chapter for email
    // Await email so it completes before Vercel serverless shuts down
    const chapter = await Chapter.findById(chapterId);
    if (chapter) {
      try {
        if (status === 'graded') {
          await sendTestGradedEmail(req.user.email, req.user.name, chapter.title, score, totalPoints);
        } else {
          await sendTestSubmittedEmail(req.user.email, req.user.name, chapter.title);
        }
      } catch (emailError) {
        console.error("Test email failed:", emailError);
      }
    }

    res.status(201).json(submission);
  } catch (error: any) {
    console.log("Error in /api/tests/submit: ", error);
    res.status(500).json({ message: "Internal Server Error", error: error instanceof Error ? error.message : String(error) });
  }
});

app.get("/api/admin/stats", protect, admin, async (req, res) => {
  try {
    const [users, books, chapters, questions] = await Promise.all([
      User.countDocuments(),
      Book.countDocuments(),
      Chapter.countDocuments(),
      Question.countDocuments()
    ]);
    res.status(200).json({ users, books, chapters, questions });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/api/admin/tests", protect, admin, async (req, res) => {
  try {
    const tests = await TestSubmission.find()
      .populate('userId', 'name email')
      .populate({ 
        path: 'chapterId', 
        select: 'title bookId',
        populate: { path: 'bookId', select: 'title' } 
      })
      .sort({ submittedAt: -1 });
    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.put("/api/admin/tests/:id/grade", protect, admin, async (req, res) => {
  try {
    const { grades } = req.body; // Array of { questionId, awardedPoints }
    
    const submission = await TestSubmission.findById(req.params.id).populate('userId', 'name email').populate('chapterId', 'title');
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    // Update answers and recalculate score
    let newScore = 0;
    submission.answers = submission.answers.map((ans) => {
      const grade = grades.find((g: any) => g.questionId.toString() === ans.questionId.toString());
      if (grade && typeof grade.awardedPoints === 'number') {
        ans.awardedPoints = grade.awardedPoints;
      }
      newScore += ans.awardedPoints || 0;
      return ans;
    });

    submission.score = newScore;
    submission.status = 'graded';
    await submission.save();

    // Await email so it completes before Vercel serverless shuts down
    const user = submission.userId as any;
    const chapter = submission.chapterId as any;
    try {
        await sendTestGradedEmail(user.email, user.name, chapter.title, newScore, submission.totalPoints);
    } catch (emailError) {
        console.error("Graded email failed:", emailError);
    }

    res.status(200).json(submission);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/api/users/tests", protect, async (req, res) => {
  try {
    const tests = await TestSubmission.find({ userId: req.user._id })
      .populate({ 
        path: 'chapterId', 
        select: 'title bookId',
        populate: { path: 'bookId', select: 'title' } 
      })
      .sort({ submittedAt: -1 });
    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Database connection is now handled via middleware above

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the Express app as a serverless function for Vercel
export default app;
