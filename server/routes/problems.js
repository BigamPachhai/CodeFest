import express from 'express';
import {
  createProblem,
  getAllProblems,
  getProblem,
  upvoteProblem,
  addComment
} from '../controllers/problemController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createProblem)
  .get(getAllProblems);

router.route('/:id')
  .get(getProblem);

router.route('/:id/upvote')
  .post(upvoteProblem);

router.route('/:id/comments')
  .post(addComment);

export default router;