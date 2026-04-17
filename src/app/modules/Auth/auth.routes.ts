import express from "express";
import { AuthController } from "./auth.controller";
import auth from "../../middlewares/auth";
import { fileUploader } from "../../../helpars/fileUploader";
import validateRequest from "../../middlewares/validateRequest";
import { AuthValidation } from "./auth.validation";

const router = express.Router();

// admin register use just one time
router.post(
  "/register",
  fileUploader.upload.fields([{ name: "image", maxCount: 1 }]),
  validateRequest(AuthValidation.createUserZodSchema),
  AuthController.createUser
);

router.post("/email-verification-otp", AuthController.sendOtpEmail);
// user login route
router.post("/login", AuthController.loginUser);

// user logout route
router.post("/logout", AuthController.logoutUser);

//change password
router.put("/change-password", auth(), AuthController.changePassword);

//reset password
router.post("/reset-password", AuthController.resetPassword);

//forgot password
router.post("/forgot-password", AuthController.forgotPassword);

//resend otp
router.post("/resend-otp", AuthController.resendOtp);

//verify-otp
router.post("/verify-otp", AuthController.verifyForgotPasswordOtp);

//delete user
router.delete("/delete-user", auth(), AuthController.deleteUser);

export const AuthRoutes = router;
