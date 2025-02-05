import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
    },
    credits: {
        type: Number
    },
    profilePicture: {
        type: String
    },
    googleId: {
        type: String
    },
    blobUrl: [String],
    otp: { type: String },
    otpExpiry: { type: Date },
    isVerified: { type: Boolean, default: false },
});

const userModel = mongoose.model("user", userSchema);

export default userModel;