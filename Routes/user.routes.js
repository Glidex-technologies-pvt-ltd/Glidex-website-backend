import { userLogin, userRegistration, uploadUserCode, getUserDetails, getBlobContent, deleteFromAzure, resendOtp, resetPassword } from "../Controller/user.controller.js";
import { verifyOtp, verifyUser } from "../Middleware/verifyUser.js";

export function userRoutes(app) {
    app.post("/register", userRegistration);
    app.post("/verifyOtp", verifyOtp);
    app.post("/login", userLogin);
    app.post("/upload/:userId", uploadUserCode);
    app.get("/user/:userId", getUserDetails);
    app.get("/getBlobcontent", getBlobContent);
    app.delete("/delete-code", deleteFromAzure)
    app.put("/resendOtp", resendOtp);
    app.put("/resetpassword", resetPassword)
};