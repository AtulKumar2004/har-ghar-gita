import mongoose, { Document, Schema } from "mongoose";

export interface IChapter extends Document {
  title: string;
  bookId: mongoose.Types.ObjectId;
  order: number;
  timeLimit?: number;
  createdAt: Date;
}

const chapterSchema = new Schema<IChapter>({
  title: {
    type: String,
    required: true,
  },
  bookId: {
    type: Schema.Types.ObjectId,
    ref: "Book",
    required: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  timeLimit: {
    type: Number,
    default: 30, // Default 30 minutes
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Chapter = mongoose.model<IChapter>("Chapter", chapterSchema);
export default Chapter;
