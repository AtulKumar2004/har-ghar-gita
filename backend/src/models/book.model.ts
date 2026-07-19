import mongoose, { Document, Schema } from "mongoose";

export interface IBook extends Document {
  title: string;
  description: string;
  imageUrl: string;
  createdAt: Date;
}

const bookSchema = new Schema<IBook>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  imageUrl: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Book = mongoose.model<IBook>("Book", bookSchema);
export default Book;
