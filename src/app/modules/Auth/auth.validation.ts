import { z } from "zod";
import { UserRole, UserStatus } from "@prisma/client";

const toBool = (value: unknown) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return value;
};

const toOptionalDate = (value: unknown) => {
  if (value === "" || value === null || value === undefined) return undefined;
  return value;
};

const createUserZodSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  profileImage: z.string().optional(),
  location: z.string().optional(),
  dob: z.preprocess(toOptionalDate, z.coerce.date().optional()),
  isVerified: z.preprocess(toBool, z.boolean().optional()),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  fcmToken: z.string().optional(),
});

export const AuthValidation = {
  createUserZodSchema,
};
