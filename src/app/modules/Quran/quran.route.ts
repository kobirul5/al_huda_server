import express from 'express';
import { QuranController } from './quran.controller';

const router = express.Router();

router.get('/surahs', QuranController.getAllSurahs);
router.get('/surahs/:id', QuranController.getSingleSurah);

export const QuranRoutes = router;
