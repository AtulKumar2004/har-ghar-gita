import mongoose from 'mongoose';
import { connectDB } from './src/lib/db.js';
import TestSubmission from './src/models/testSubmission.model.js';

const run = async () => {
  await connectDB();
  try {
    const sub = new TestSubmission({
      userId: new mongoose.Types.ObjectId(),
      chapterId: new mongoose.Types.ObjectId(),
      answers: [],
      warnings: { copyPasteAttempts: 0, fullScreenExits: 0 },
      score: 0
    });
    await sub.save();
    console.log('success');
  } catch(e: any) {
    console.error('MONGOOSE ERROR:', e.message);
  }
  process.exit(0);
};

run();
