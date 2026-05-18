import express from "express";
import { AIController } from "./ai.controller";

const router = express.Router();

// Get Islamic suggestion with Quran and Hadith references
router.post("/suggestion", AIController.getIslamicSuggestion);

// Get Quran references
router.post("/quran-references", AIController.getQuranReferences);

// Get Hadith references
router.post("/hadith-references", AIController.getHadithReferences);

export const AIRoutes = router;
