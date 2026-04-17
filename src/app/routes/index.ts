import express from "express";
import { AuthRoutes } from "../modules/Auth/auth.routes";
import { userRoutes } from "../modules/User/user.route";
import { QuranRoutes } from "../modules/Quran/quran.route";

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
  }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
