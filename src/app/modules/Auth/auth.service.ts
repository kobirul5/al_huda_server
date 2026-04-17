import { Secret } from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import { jwtHelpers } from "../../../helpars/jwtHelpers";
import emailSender from "../../../shared/brevoMailSender";
import { sendOtpEmailTemplate } from "../../../helpars/template/sendOtpEmail";
import prisma from "../../../shared/prisma";
import { UserRole, UserStatus } from "@prisma/client";
import config from "../../../config";


const generateOtp = (length: number): number => {
  const otp = Math.floor(
    Math.random() * Math.pow(10, length)
  );
  return otp;
}

const createUserIntoDb = async (payload: any) => {
  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new ApiError(
      400,
      `User with this email ${payload.email} already exists`
    );
  }

  if(payload.role === UserRole.ADMIN){
    throw new ApiError(
      400,
      `Cannot register as ADMIN role`
    );
  }
  // Hash the password
  const hashedPassword: string = await bcrypt.hash(
    payload.password!,
    Number(config.bcrypt_salt_rounds)
  );

  const newUser = await prisma.user.create({
    data: {
      ...payload,
      password: hashedPassword,
    }
  });

  console.log("User created:", newUser);

  if (!newUser) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to create user"
    );
  }

  const accessToken = jwtHelpers.generateToken(
    {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );



  return {
    newUser,
    token: accessToken,
  };
};

// Helper function (non-blocking)
const sendOtpEmail = async (email: string) => {
  const userExists = await prisma.user.findUnique({
    where: { email: email },
  });
  if (!userExists) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `User not found with email ${email}`
    );
  }

  const otp = generateOtp(4);
  const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
  const html = sendOtpEmailTemplate(String(otp));
  const emailSubject = "Iconic - Verify Your Email";

  await emailSender(email, html, emailSubject);
  const user = await prisma.user.update({
    where: {
      email: email,
    },
    data: {
      otp: otp,
      otpExpiresAt: otpExpiresAt,
    },
  });
  console.log(`📧 OTP sent to ${email}`);
  return "Verification code sent to your email";
};

// user login service
const loginUser = async (payload: {
  email: string;
  password: string;
  fcmToken?: string;
}) => {
  const userData = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!userData?.email) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "User not found! with this email " + payload.email
    );
  }
  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.password,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password incorrect!");
  }

  if (payload && payload.fcmToken) {
    await prisma.user.update({
      where: { id: userData.id },
      data: { fcmToken: payload.fcmToken },
    });
  }


  if (userData.status === UserStatus.SUSPENDED) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Your account has been suspended."
    );
  }

  const accessToken = jwtHelpers.generateToken(
    {
      id: userData.id,
      email: userData.email,
      role: userData.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  const role = userData.role;

  return { token: accessToken, role: role };
};

// change password
const changePassword = async (
  userId: string,
  newPassword: string,
  oldPassword: string
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user?.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Incorrect old password");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  const result = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: hashedPassword,
    },
  });
  return { message: "Password changed successfully" };
};

// forgot password
const forgotPassword = async (payload: { email: string }) => {
  // Fetch user data or throw if not found
  const userData = await prisma.user.findFirstOrThrow({
    where: {
      email: payload.email,
    },
  });

  const otp = generateOtp(4);
  const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

  console.log(payload.email);

  try {
    const html = `Here is your forgot password OTP code: ${otp}. It will expire in 15 minutes.`;

    await emailSender(userData.email, html, "Forgot Password OTP");
  } catch (error) {
    console.error(`Failed to send OTP email:`, error);
  }

  // Update the user's OTP and expiration in the database
  await prisma.user.update({
    where: { id: userData.id },
    data: {
      otp: otp,
      otpExpiresAt: otpExpiresAt,
    },
  });

  return {
    otp,
  };
};

// resend otp
const resendOtp = async (email: string) => {
  // Check if the user exists
  const user = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "This user is not found!");
  }

  const otp = generateOtp(4);
  const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

  try {
    const html = `Here is your new OTP code: ${otp}. It will expire in 15 minutes.`;

    await emailSender(user.email, html, "Resend OTP");
  } catch (error) {
    console.error(`Failed to send OTP email:`, error);
  }

  // Update the user's profile with the new OTP and expiration
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      otp: otp,
      otpExpiresAt: otpExpiresAt,
    },
  });

  return { otp };
};

// verify forgot password OTP
const verifyForgotPasswordOtp = async (payload: {
  email: string;
  otp: number;
  fcmToken?: string;
}) => {
  // Check if the user exists
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "This user is not found!");
  }

  // Check if the OTP is valid and not expired
  if (
    user.otp !== payload.otp ||
    !user.otpExpiresAt ||
    user.otpExpiresAt < new Date()
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP");
  }

  // if (payload && payload.fcmToken) {
  //   await prisma.user.update({
  //     where: { id: user.id },
  //     data: { fcmToken: payload.fcmToken },
  //   });
  // }
  const accessToken = jwtHelpers.generateToken(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  const role = user.role;

  return { token: accessToken, role: role };
};

// reset password
const resetPassword = async (payload: { password: string; email: string }) => {
  // Check if the user exists
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "This user is not found!");
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds)
  );

  // Update the user's password in the database
  await prisma.user.update({
    where: { email: payload.email },
    data: {
      password: hashedPassword, // Update with the hashed password
      otp: null, // Clear the OTP
      otpExpiresAt: null, // Clear OTP expiration
    },
  });

  return { message: "Password reset successfully" };
};

// delete user
const deleteUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const deletedUser = await prisma.user.delete({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
    },
  });

  return deletedUser;
};

export const AuthServices = {
  createUserIntoDb,
  loginUser,
  changePassword,
  forgotPassword,
  resetPassword,
  resendOtp,
  verifyForgotPasswordOtp,
  deleteUser,
  sendOtpEmail,
};
