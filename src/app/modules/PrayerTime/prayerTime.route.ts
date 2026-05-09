import express from 'express';
import { PrayerTimeController } from './prayerTime.controller';

const router = express.Router();

router.get('/', PrayerTimeController.getPrayerTimes);

export const PrayerTimeRoutes = router;
