import { Router } from 'express';
import * as automationController from '../controllers/automation.js';
import { authenticate } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import {
  createAutomationValidator,
  updateAutomationValidator,
} from '../utils/validators/index.js';

const router = Router();

// Protect all automation routes with authentication
router.use(authenticate);

// Get all automations for a specific home
router.get('/', automationController.getAutomationsByHome);

// Get active automations for a specific home
router.get('/active', automationController.getActiveAutomationsByHome);

// Get automations by trigger type
router.get('/trigger/:type', automationController.getAutomationsByTriggerType);

// Get a specific automation by ID
router.get('/:id', automationController.getAutomationById);

// Create a new automation
router.post(
  '/',
  createAutomationValidator,
  validateRequest,
  automationController.createAutomation
);

// Update an automation
router.put(
  '/:id',
  updateAutomationValidator,
  validateRequest,
  automationController.updateAutomation
);

// Toggle automation status
router.patch('/:id/toggle', automationController.toggleAutomationStatus);

// Delete an automation
router.delete('/:id', automationController.deleteAutomation);

export default router;
