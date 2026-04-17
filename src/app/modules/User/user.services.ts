import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import * as bcrypt from "bcrypt";
import { Prisma, User, UserRole, UserStatus } from "@prisma/client";
import config from "../../../config";
import httpStatus from "http-status";
import { omit } from "lodash";
import { IUserFilters } from "./user.interface";
import emailSender from "../../../shared/brevoMailSender";
import { paginationHelper } from "../../../helpars/paginationHelper";

// get user profile
const getMyProfile = async (userId: string) => {
  const userProfile = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!userProfile) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  const userWithoutPassword = omit(userProfile, [
    "password",
    "otp",
    "otpExpiresAt",
  ]);

  return { ...userWithoutPassword, accountType: "FREE" };
};

//update user profile
const updateUser = async (
  userId: string,
  updateData: Partial<User>,
  imageUrl?: string,
) => {
  // Find the existing user from the database
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  // Create a filtered update object, skipping empty string values, null, or undefined
  // and restricted from sensitive fields
  const forbiddenFields = [
    "id",
    "role",
    "status",
    "otp",
    "otpExpiresAt",
    "createdAt",
    "updatedAt",
  ];
  const filteredUpdateData: Partial<User> = {};

  for (const [key, value] of Object.entries(updateData)) {
    if (
      !forbiddenFields.includes(key) &&
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      filteredUpdateData[key as keyof User] = value as any;
    }
  }

  // Check if the email is changing, and if so, check for existing users with the new email
  if (
    filteredUpdateData.email &&
    filteredUpdateData.email !== existingUser.email
  ) {
    const emailExists = await prisma.user.findFirst({
      where: {
        email: filteredUpdateData.email,
        id: { not: userId },
      },
    });
    if (emailExists) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Email already exists");
    }
  }

  // Handle password hashing if password is being updated
  if (filteredUpdateData.password) {
    filteredUpdateData.password = await bcrypt.hash(
      filteredUpdateData.password,
      Number(config.bcrypt_salt_rounds),
    );
  }

  // Update profile image only if imageUrl is provided
  if (imageUrl) {
    filteredUpdateData.profileImage = imageUrl;
  }

  // Perform the update on the user
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: filteredUpdateData,
  });

  // Omit sensitive data like password and fcmToken before returning
  const userWithoutSensitive = omit(updatedUser, [
    "password",
    "fcmToken",
    "otp",
    "otpExpiresAt",
  ]);

  return userWithoutSensitive;
};

//get all users
const getAllUsers = async (filters: IUserFilters, options: any) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.UserWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: ["fullName", "email"].map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};
  const [result, total, totalUsers, totalActiveUsers, totalSuspendUsers] =
    await prisma.$transaction([
      prisma.user.findMany({
        where: { ...whereConditions, role: { not: UserRole.ADMIN } },
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          status: true,
          profileImage: true,
          createdAt: true,
        },
      }),

      prisma.user.count({
        where: { ...whereConditions, role: { not: UserRole.ADMIN } }, // ✅ must match
      }),

      prisma.user.count({
        where: { role: { not: UserRole.ADMIN } }, // exclude admin globally
      }),

      prisma.user.count({
        where: {
          status: UserStatus.ACTIVE,
          role: { not: UserRole.ADMIN },
        },
      }),

      prisma.user.count({
        where: {
          status: UserStatus.SUSPENDED,
          role: { not: UserRole.ADMIN },
        },
      }),
    ]);

  return {
    meta: {
      total,
      page,
      limit,
      totalUsers,
      totalActiveUsers,
      totalSuspendUsers,
    },
    data: result,
  };
};


//get single
const getSingleUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return {
    data: { ...user, password: "", otp: null, otpExpiresAt: null },
  };
};

// delete user
const removeUserByAdmin = async (id: string) => {
  const findUserToDelete = await prisma.user.findUnique({
    where: { id: id },
  });

  if (!findUserToDelete) {
    throw new ApiError(httpStatus.NOT_FOUND, "User to delete not found");
  }

  const deletedUser = await prisma.user.delete({
    where: { id: id },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
    },
  });

  try {
    const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.6;">
        <h2>Hello ${deletedUser.fullName || ""},</h2>
        <p>We’re writing to let you know that an admin has <strong>removed your account</strong>.</p>
        <p>If you believe this was a mistake or you have any questions, please contact support.</p>
        <hr style="border:none;border-top:1px solid #eee; margin:16px 0;" />
        <p style="color:#6b7280; font-size:12px;">This mailbox is not monitored. Please reach out through the support portal for assistance.</p>
      </div>
    `;
    await emailSender(deletedUser.email, html, "Your Account Has Been Removed");
  } catch (error) {
    console.error("Failed to send removal email:", error);
  }

  return deletedUser;
};

// change user role
const changeUserRole = async (userId: string, role: UserRole) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.role === UserRole.ADMIN) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Your not authorized to change admin role",
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
    },
  });

  return updatedUser;
};



const suspendOrActivateUser = async (userId: string, status: UserStatus) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (status !== UserStatus.SUSPENDED && status !== UserStatus.ACTIVE) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Invalid status: ${status}, status must be ${UserStatus.SUSPENDED} or ${UserStatus.ACTIVE}`,
    );
  }

  if (user.status === status) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `User is already ${status.toLowerCase()}`,
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { status },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      status: true,
    },
  });

  return updatedUser;
};

export const UserService = {
  getMyProfile,
  updateUser,
  getSingleUserById,
  removeUserByAdmin,
  changeUserRole,
  getAllUsers,
  suspendOrActivateUser,


};
