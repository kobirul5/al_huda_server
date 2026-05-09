import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { PrayerTimeService } from './prayerTime.service';

const getPrayerTimes = catchAsync(async (req: Request, res: Response) => {
  const { city, country } = req.query;
  const result = await PrayerTimeService.getPrayerTimes(
    city as string,
    country as string
  );

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
