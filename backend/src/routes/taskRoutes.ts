import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validator';
import { authenticate } from '../middleware/auth';
import {
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  startTimer,
  stopTimer,
} from '../controllers/taskController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation schemas
const createTaskValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ max: 255 })
    .withMessage('Title must not exceed 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'completed'])
    .withMessage('Status must be one of: todo, in-progress, completed'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category must not exceed 100 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
];

const updateTaskValidation = [
  param('id').isInt().withMessage('Task ID must be a valid integer'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Task title cannot be empty')
    .isLength({ max: 255 })
    .withMessage('Title must not exceed 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'completed'])
    .withMessage('Status must be one of: todo, in-progress, completed'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category must not exceed 100 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('total_time')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Total time must be a positive integer'),
  body('is_tracking')
    .optional()
    .isBoolean()
    .withMessage('is_tracking must be a boolean'),
];

const taskIdValidation = [
  param('id').isInt().withMessage('Task ID must be a valid integer'),
];

// Routes
router.get('/', getAllTasks);
router.get('/:id', validate(taskIdValidation), getTask);
router.post('/', validate(createTaskValidation), createTask);
router.patch('/:id', validate(updateTaskValidation), updateTask);
router.delete('/:id', validate(taskIdValidation), deleteTask);
router.post('/:id/start', validate(taskIdValidation), startTimer);
router.post('/:id/stop', validate(taskIdValidation), stopTimer);

export default router;
