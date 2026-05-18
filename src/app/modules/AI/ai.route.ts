import express from "express";
import { AIController } from "./ai.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

// Get Islamic suggestion with Quran and Hadith references (Protected)
router.post("/suggestion", auth(), AIController.getIslamicSuggestion);

// Retrieve AI search history (Protected)
router.get("/history", auth(), AIController.getAiHistoryForUser);

// Delete AI search history item (Protected)
router.delete("/history/:id", auth(), AIController.deleteAiHistoryItem);

// Get Quran references
router.post("/quran-references", AIController.getQuranReferences);

// Get Hadith references
router.post("/hadith-references", AIController.getHadithReferences);

export const AIRoutes = router;
