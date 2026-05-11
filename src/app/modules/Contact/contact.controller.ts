import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { ContactService } from "./contact.service";

const sendContactEmail = catchAsync(async (req: Request, res: Response) => {
  const result = await ContactService.sendContactEmail(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Your message has been sent successfully!",
    data: result,
  });
});

export const ContactController = {
  sendContactEmail,
};
