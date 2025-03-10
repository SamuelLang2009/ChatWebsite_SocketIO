import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    message: {type: String},
    sender: {type: String},
    reciever: {type: String},
    timestamp: { type: Date, default: Date.now },
    file: { 
        data: Buffer,  
        contentType: String, 
        filename: String 
    }
});

const Message = mongoose.model("Message", messageSchema);
export default Message;
