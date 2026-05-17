import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { PrayerTimeService } from './prayerTime.service';
import ApiError from '../../../errors/ApiErrors';

const getPrayerTimes = catchAsync(async (req: Request, res: Response) => {
  const { city = 'Dhaka', country = 'Bangladesh' } = req.query;

  // Validate inputs
  if (!city || typeof city !== 'string' || city.trim().length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'City parameter is required and must be a non-empty string');
  }

  if (!country || typeof country !== 'string' || country.trim().length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Country parameter is required and must be a non-empty string');
  }

  const result = await PrayerTimeService.getPrayerTimes(city, country);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Prayer times fetched successfully',
    data: result,
  });
});

export const PrayerTimeController = {
  getPrayerTimes,
};
