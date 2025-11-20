import express from 'express';
import {
  getAdminStats,
  generateProblemReport,
  updateProblemStatus
} from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin', 'department'));

router.get('/stats', getAdminStats);
router.get('/problems/:id/report', generateProblemReport);
router.patch('/problems/:id/status', updateProblemStatus);

export default router;