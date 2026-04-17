import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { Request, Response } from "express";
import { UserService } from "./user.services";
import { fileUploader } from "../../../helpars/fileUploader";
import { UserRole, UserStatus } from "@prisma/client";

// get user profile
const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;

  const result = await UserService.getMyProfile(userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User profile retrieved successfully",
    data: result,
  });
});

// update user profile
const updateUser = catchAsync(async (req: Request, res: Response) => {
  const userToken = req.headers.authorization;
  const updateData = req.body.data ? JSON.parse(req.body.data) : req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  let imageUrl: string | undefined;

  // Handle profile image upload
  if (files?.image?.[0]) {
    const uploaded = await fileUploader.uploadToCloudinary(files.image[0]);
    imageUrl = uploaded.Location;
  }

  // Call the service to update the user
  const result = await UserService.updateUser(
    req.user.id,
    updateData,
    imageUrl
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User updated successfully",
    data: result,
  });
});


const getSingleUserById = catchAsync(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const result = await UserService.getSingleUserById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User details retrieved successfully",
    data: result.data,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const filters = { searchTerm: req.query.searchTerm as string, ...req.query };
  // remove non-filter fields from filters object manually or use pick
  const filterData = { ...req.query };
  const excludeFields = ['page', 'limit', 'sortBy', 'sortOrder', 'searchTerm'];
  excludeFields.forEach(field => delete (filterData as any)[field]);
  const finalFilters = { searchTerm: req.query.searchTerm as string, ...filterData };

  // Better to use pick if available

  const options = {
    page: Number(req.query.page || 1),
    limit: Number(req.query.limit || 10),
    sortBy: req.query.sortBy as string || 'createdAt',
    sortOrder: req.query.sortOrder as string || 'desc'
  };

  const result = await UserService.getAllUsers(finalFilters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const suspendOrActivatedUser = catchAsync(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const status = Array.isArray(req.body.status)
    ? req.body.status[0]
    : req.body.status;
  const result = await UserService.suspendOrActivateUser(
    id,
    status as UserStatus
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User suspended successfully",
    data: result,
  });
});

//delete user
const removeUserByAdmin = catchAsync(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const result = await UserService.removeUserByAdmin(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User remove successfully",
    data: result,
  });
});
// change user role

const changeUserRole = catchAsync(async (req: Request, res: Response) => {
  const userId = Array.isArray(req.user.id) ? req.user.id[0] : req.user.id;
  const role = Array.isArray(req.body.role) ? req.body.role[0] : req.body.role;
  const result = await UserService.changeUserRole(userId, role as UserRole);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User role changed successfully",
    data: result,
  });

})




export const UserController = {
  getMyProfile,
  updateUser,
  getSingleUserById,
  removeUserByAdmin,
  changeUserRole,
  getAllUsers,
  suspendOrActivatedUser,
};
