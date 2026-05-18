import express from "express";
import { AuthRoutes } from "../modules/Auth/auth.routes";
import { userRoutes } from "../modules/User/user.route";
import { QuranRoutes } from "../modules/Quran/quran.route";

import { hadithRoutes } from "../modules/dailyHadith/hadith.routes";

import { PrayerTimeRoutes } from "../modules/PrayerTime/prayerTime.route";
import { ContactRoutes } from "../modules/Contact/contact.routes";
import { AIRoutes } from "../modules/AI/ai.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/users",
    route: userRoutes,
  },
  {
    path: "/quran",
    route: QuranRoutes,
  },
  {
    path: "/hadith",
    route: hadithRoutes,
  },
  {
    path: "/prayer-time",
    route: PrayerTimeRoutes,
  },
  {
    path: "/contact",
    route: ContactRoutes,
  },
  {
    path: "/ai",
    route: AIRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
