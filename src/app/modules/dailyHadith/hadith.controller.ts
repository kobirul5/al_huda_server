import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { hadithService } from "./hadith.service";

const getHadithsByBook = catchAsync(async (req: Request, res: Response) => {
  const { bookName } = req.params;
  const result = await hadithService.getHadithsByBook(bookName as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Hadiths retrieved successfully",
    data: result,
  });
});

export const hadithController = {
  getHadithsByBook,
};
