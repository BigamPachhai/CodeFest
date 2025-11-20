import express from 'express';
import {
  analyzeImage,
  generateDescription,
  checkDuplicates,
  prioritizeProblems,
  analyzeCommentSentiment,
  predictResolutionTime,
  suggestDepartmentAssignment,
  generateProgressUpdate
} from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Existing routes
router.post('/analyze-image', analyzeImage);
router.post('/generate-description', generateDescription);
router.post('/check-duplicates', checkDuplicates);

// New AI feature routes
router.get('/prioritize-problems', prioritizeProblems);
router.post('/analyze-sentiment', analyzeCommentSentiment);
router.post('/predict-resolution', predictResolutionTime);
router.get('/suggest-assignment/:id', suggestDepartmentAssignment);
router.get('/progress-update/:id', generateProgressUpdate);

export default router;