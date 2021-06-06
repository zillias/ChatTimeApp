import mongoose from "mongoose";
const { model, Schema } = mongoose;

const userSchema = new Schema({
  username: String,
  password: String,
  email: String,
  createdAt: String,
  messagesSent: [
    {
      to: String,
      messages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
    },
  ],
  notifications: [
    {
      from: String,
      messagesCount: Number,
    },
  ],
});

export default model("User", userSchema);
