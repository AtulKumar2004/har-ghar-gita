import mongoose, { Document, Schema } from "mongoose";

export interface ITestSubmission extends Document {
  userId: mongoose.Types.ObjectId;
  chapterId: mongoose.Types.ObjectId;
  answers: {
    questionId: mongoose.Types.ObjectId;
    selectedOptionIndex?: number;
    selectedOptionIndices?: number[];
    writtenAnswer?: string;
    awardedPoints?: number;
  }[];
  warnings: {
    copyPasteAttempts: number;
    fullScreenExits: number;
  };
  score: number;
  totalPoints: number;
  status: 'pending' | 'graded';
  submittedAt: Date;
}

const testSubmissionSchema = new Schema<ITestSubmission>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  chapterId: {
    type: Schema.Types.ObjectId,
    ref: "Chapter",
    required: true,
  },
  answers: [{
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    selectedOptionIndex: {
      type: Number,
    },
    selectedOptionIndices: {
      type: [Number],
    },
    writtenAnswer: {
      type: String,
    },
    awardedPoints: {
      type: Number,
      default: 0,
    }
  }],
  warnings: {
    copyPasteAttempts: { type: Number, default: 0 },
    fullScreenExits: { type: Number, default: 0 },
  },
  score: {
    type: Number,
    default: 0,
  },
  totalPoints: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'graded'],
    default: 'graded',
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

const TestSubmission = mongoose.model<ITestSubmission>("TestSubmission", testSubmissionSchema);
export default TestSubmission;
