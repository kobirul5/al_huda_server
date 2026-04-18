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

const OTP_LENGTH = 4;
const OTP_TTL_MS = 15 * 60 * 1000;
const OTP_COOLDOWN_MS = 60 * 1000;

const generateOtp = (length: number): number => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const isOtpRecentlyIssued = (otpExpiresAt: Date | null | undefined) => {
  if (!otpExpiresAt) {
    return false;
  }

  const remainingMs = otpExpiresAt.getTime() - Date.now();
  return remainingMs > OTP_TTL_MS - OTP_COOLDOWN_MS;
};

const issueOtpForUser = async (
  user: { id: string; email: string; otp: number | null; otpExpiresAt: Date | null },
  subject: string,
  htmlTemplate: string
) => {
  if (user.otp && isOtpRecentlyIssued(user.otpExpiresAt)) {
    return { message: "OTP was already sent recently. Please wait a minute before requesting again." };
  }

  const otp = generateOtp(OTP_LENGTH);
  const otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
  const html = htmlTemplate.replace("__OTP__", String(otp));

  await emailSender(user.email, html, subject);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      otp,
      otpExpiresAt,
    },
  });

  return { message: "OTP sent successfully" };
};

const createUserIntoDb = async (payload: any) => {
  const existingUser = await prisma.user.findFirst({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new ApiError(
      400,
      `User with this email ${payload.email} already exists`
    );
  }

  if (payload.role === UserRole.ADMIN) {
    throw new ApiError(
      400,
      `Cannot register as ADMIN role`
    );
  }

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

  await sendOtpEmail(newUser.email);

  return {
    newUser,
    token: accessToken,
  };
};

const sendOtpEmail = async (email: string) => {
  const userExists = await prisma.user.findUnique({
    where: { email },
  });

  if (!userExists) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `User not found with email ${email}`
    );
  }

  const html = sendOtpEmailTemplate("__OTP__");
  const emailSubject = "Al Huda - Verify Your Email";

  await issueOtpForUser(userExists, emailSubject, html);
  console.log(`OTP sent to ${email}`);

  return "Verification code sent to your email";
};

const loginUser = async (payload: {
  email: string;
  password: string;
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

  return {
    token: accessToken,
    role,
    email: userData.email,
    isVerified: userData.isVerified,
  };
};

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

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Incorrect old password");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: hashedPassword,
    },
  });

  return { message: "Password changed successfully" };
};

const forgotPassword = async (payload: { email: string }) => {
  const userData = await prisma.user.findFirstOrThrow({
    where: {
      email: payload.email,
    },
  });

  console.log(payload.email);

  try {
    const html = "Here is your forgot password OTP code: __OTP__. It will expire in 15 minutes.";
    await issueOtpForUser(userData, "Al Huda - Forgot Password OTP", html);
  } catch (error) {
    console.error(`Failed to send OTP email:`, error);
  }

  return {
    message: "OTP sent successfully",
  };
};

const resendOtp = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "This user is not found!");
  }

  try {
    const html = "Here is your new OTP code: __OTP__. It will expire in 15 minutes.";
    await issueOtpForUser(user, "Al Huda - Resend OTP", html);
  } catch (error) {
    console.error(`Failed to send OTP email:`, error);
  }

  return { message: "OTP resent successfully" };
};

const verifyForgotPasswordOtp = async (payload: {
  email: string;
  otp: number;
}) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "This user is not found!");
  }

  if (
    user.otp !== payload.otp ||
    !user.otpExpiresAt ||
    user.otpExpiresAt < new Date()
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      otp: null,
      otpExpiresAt: null,
    },
  });

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

  return { token: accessToken, role };
};

const resetPassword = async (payload: { password: string; email: string }) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "This user is not found!");
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds)
  );

  await prisma.user.update({
    where: { email: payload.email },
    data: {
      password: hashedPassword,
      otp: null,
      otpExpiresAt: null,
    },
  });

  return { message: "Password reset successfully" };
};

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
      firstName: true,
      lastName: true,
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
