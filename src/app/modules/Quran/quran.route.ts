import express from 'express';
import { QuranController } from './quran.controller';

const router = express.Router();

router.get('/surahs', QuranController.getAllSurahs);
router.get('/surahs/:id', QuranController.getSingleSurah);
router.get('/paras', QuranController.getAllParas);
router.get('/paras/:id', QuranController.getSinglePara);

export const QuranRoutes = router;
