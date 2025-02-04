import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {type: String},
    password: {type: String},
    timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);
export default User;
