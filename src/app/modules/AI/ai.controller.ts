import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { AIServices } from "./ai.service";

// Get Islamic suggestion based on prompt
const getIslamicSuggestion = catchAsync(async (req: Request, res: Response) => {
  const result = await AIServices.getIslamicSuggestion(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Islamic suggestion retrieved successfully",
    data: result,
  });
});

// Get Quran references
const getQuranReferences = catchAsync(async (req: Request, res: Response) => {
  const { query, language = "en" } = req.body;

  const result = await AIServices.getQuranReference(query, language);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Quranic references retrieved successfully",
    data: result,
  });
});

// Get Hadith references
const getHadithReferences = catchAsync(async (req: Request, res: Response) => {
  const { query, language = "en" } = req.body;

  const result = await AIServices.getHadithReference(query, language);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Hadith references retrieved successfully",
    data: result,
  });
});

export const AIController = {
  getIslamicSuggestion,
  getQuranReferences,
  getHadithReferences,
};
