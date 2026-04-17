import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { QuranService } from './quran.service';

const getAllSurahs = catchAsync(async (req: Request, res: Response) => {
  const { surahs, stats } = await QuranService.getAllSurahsFromCDN();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Surahs fetched successfully',
    data: surahs,
    stats: stats,
  });
});

const getSingleSurah = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await QuranService.getSurahById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Surah fetched successfully',
    data: result,
  });
});

export const QuranController = {
  getAllSurahs,
  getSingleSurah,
};
