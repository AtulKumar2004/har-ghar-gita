import mongoose,{ Document,Schema } from "mongoose";

export interface UserDocument extends Document {
  _id: mongoose.Types.ObjectId,
  name: String;
  email: String;
  password?: String;
  dob: Date;
  phone: Number;
  role: 'student' | 'admin';
  resetPasswordToken?: String;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: false, // temporarily false to not break old users
    },
    dob: {
        type: Date,
        required: true
    },
    phone: {
        type: Number,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student'
    },
    resetPasswordToken: {
        type: String,
        required: false
    },
    resetPasswordExpires: {
        type: Date,
        required: false
    }
},{timestamps: true});

const User = mongoose.model<UserDocument>("User",userSchema);

export default User;