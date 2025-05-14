import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest.js';
import { feedbackValidator } from '../utils/validators/index.js';
import { sendFeedback } from '../controllers/feedback.js';

const router = Router();

router.post('/', feedbackValidator, validateRequest, sendFeedback);

export default router;
