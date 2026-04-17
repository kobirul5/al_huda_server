import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { AuthServices } from "./auth.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { fileUploader } from "../../../helpars/fileUploader";
import config from "../../../config";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const parsData = req.body.data;

  const result = await AuthServices.createUserIntoDb({ ...parsData });

  const token = (result as { token?: string } | undefined)?.token;

  if (token) {
    res.cookie("token", token, {
      httpOnly: true,
      secure: config.env === "production",
      sameSite: "lax",
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Registered successfully!",
    data: result,
  });
});

//login user
const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.loginUser(req.body);

  const { token } = result;

  res.cookie("token", token, {
    httpOnly: true,
    secure: config.env === "production",
    sameSite: "lax",
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged in successfully",
    data: result,
  });
});

//logout user
const logoutUser = catchAsync(async (req: Request, res: Response) => {
  // Clear the token cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: config.env === "production",
    sameSite: "lax",
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Successfully logged out",
    data: null,
  });
});

// change password
const changePassword = catchAsync(async (req: Request, res: Response) => {
  const userToken = req.headers.authorization;
  const { oldPassword, newPassword } = req.body;

  const result = await AuthServices.changePassword(
    req.user.id,
    newPassword,
    oldPassword
  );
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Password changed successfully",
    data: result,
  });
});

// forgot password
const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.forgotPassword(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "We sent you an OTP, please check your email",
    data: result,
  });
});

//resend otp
const resendOtp = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.resendOtp(req.body.email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "We resent you an OTP, please check your email",
    data: result,
  });
});

//verify forgot password otp
const verifyForgotPasswordOtp = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AuthServices.verifyForgotPasswordOtp(req.body);
    const { token } = result;

    res.cookie("token", token, {
      httpOnly: true,
      secure: config.env === "production",
      sameSite: "lax",
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "OTP verified successfully",
      data: result,
    });
  }
);

//reset password
const resetPassword = catchAsync(async (req: Request, res: Response) => {
  await AuthServices.resetPassword(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "your password reset successfully now you can login",
    data: null,
  });
});

//delete user
const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.deleteUser(req.user.id);

  // Clear the token cookie after deletion
  res.clearCookie("token", {
    httpOnly: true,
    secure: config.env === "production",
    sameSite: "lax",
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "your account deleted successfully",
    data: result,
  });
});

const sendOtpEmail = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.sendOtpEmail(req.body.email);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "We sent you an OTP, please check your email",
    data: result,
  });
});

export const AuthController = {
  createUser,
  loginUser,
  logoutUser,
  changePassword,
  forgotPassword,
  resetPassword,
  resendOtp,
  verifyForgotPasswordOtp,
  deleteUser,
  sendOtpEmail
};
