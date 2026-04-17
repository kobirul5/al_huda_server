import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { QuranService, TranslationLanguage } from './quran.service';

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
  const surahId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const translationQuery = req.query.translation;
  const translationLanguage =
    typeof translationQuery === 'string' ? (translationQuery as TranslationLanguage) : 'en';
  const result = await QuranService.getSurahById(surahId, translationLanguage);

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
