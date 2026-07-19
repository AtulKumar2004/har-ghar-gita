import mongoose, { Document, Schema } from "mongoose";

export interface IQuestion extends Document {
  type?: 'mcq' | 'writing' | 'multiple_select_mcq';
  questionText: string;
  options?: string[];
  correctOptionIndex?: number;
  correctOptionIndices?: number[];
  sampleAnswer?: string;
  chapterId: mongoose.Types.ObjectId;
  points: number;
  createdAt: Date;
}

const questionSchema = new Schema<IQuestion>({
  type: {
    type: String,
    enum: ['mcq', 'writing', 'multiple_select_mcq'],
    default: 'mcq',
  },
  questionText: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    validate: [arrayLimit, '{PATH} must have exactly 4 options'],
  },
  correctOptionIndex: {
    type: Number,
    min: 0,
    max: 3,
  },
  correctOptionIndices: {
    type: [Number],
  },
  sampleAnswer: {
    type: String,
  },
  chapterId: {
    type: Schema.Types.ObjectId,
    ref: "Chapter",
    required: true,
  },
  points: {
    type: Number,
    default: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

function arrayLimit(val: string[]) {
  if (!val || val.length === 0) return true;
  return val.length === 4;
}

const Question = mongoose.model<IQuestion>("Question", questionSchema);
export default Question;
