import userModel from "../Model/user.model.js";
import jwt from "jsonwebtoken";

//Create a middleware for verifying otp
export async function verifyOtp(req, res, next) {
    const { email, otp } = req.body;
  
    const user = await userModel.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
  
    // Check if OTP is valid
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
  
    // Check if OTP is expired
    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ message: "OTP expired. Request a new one." });
    }
  
    // OTP verified - activate account
    user.isVerified = true;
    user.otp = null; // Remove OTP after verification
    user.otpExpiry = null;
    await user.save();
  
    res.status(200).json({ message: "Email verified successfully!" });
    next();
  };
  

//Create a middleware for verifying user
export function verifyUser(req, res, next) {

    if (req.headers && req.headers.authorization && req.headers.authorization.split(" ")[0] == "JWT") {
        jwt.verify(
            req.headers.authorization.split(" ")[1], "ProjectKey",
            function (err, verifiedToken) {
                if (err) {
                    return res.status(403).json({ message: "Invalid Token" });
                }
                userModel.findById(verifiedToken._id).then(user => {
                    res.user = user;
                    next()
                }).catch(err => res.status(500).json({ message: err.message }));
            }
        )
    }
    else {
        res.status(404).json({ message: "Token is not present" })
    }
};