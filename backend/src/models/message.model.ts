import mongoose,{ Document,Schema } from "mongoose";

export interface MessageDocument extends Document {
  _id: mongoose.Types.ObjectId,
  name: String;
  email: String;
  message: String;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<MessageDocument>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true
    },
},{timestamps: true});

const Message = mongoose.model<MessageDocument>("Message",messageSchema);

export default Message;