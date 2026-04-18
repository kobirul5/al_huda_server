import express from "express";
import { hadithController } from "./hadith.controller";

const router = express.Router();

router.get("/:bookName", hadithController.getHadithsByBook);

export const hadithRoutes = router;
