import mongoose from "mongoose";
const { model, Schema } = mongoose;

const messageSchema = new Schema({
  body: String,
  createdAt: String,
  sender: String,
});

export default model("Message", messageSchema);
