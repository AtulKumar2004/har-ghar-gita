import mongoose,{ Document,Schema } from "mongoose";

export interface UserDocument extends Document {
  _id: mongoose.Types.ObjectId,
  name: String;
  email: String;
  dob: Date;
  phone: Number;
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
    dob: {
        type: Date,
        required: true
    },
    phone: {
        type: Number,
        required: true
    }
    
},{timestamps: true});

const User = mongoose.model<UserDocument>("User",userSchema);

export default User;