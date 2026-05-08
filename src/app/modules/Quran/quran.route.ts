import express from 'express';
import { QuranController } from './quran.controller';

const router = express.Router();

router.get('/surahs', QuranController.getAllSurahs);
router.get('/surahs/:id', QuranController.getSingleSurah);
router.get('/paras', QuranController.getAllParas);
router.get('/paras/:id', QuranController.getSinglePara);
router.get('/pages', QuranController.getAllPages);
router.get('/pages/:id', QuranController.getSinglePage);

export const QuranRoutes = router;
