import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    message: {type: String},
    sender: {type: String},
    reciever: {type: String},
    timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model("Message", messageSchema);
export default Message;
