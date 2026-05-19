import { body, validationResult } from 'express-validator';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

export const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must contain at least 6 characters'),
  body('name')
    .notEmpty()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Name is required and cannot exceed 50 characters')
];

export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const profileValidation = [
  body('name').notEmpty().trim(),
  body('age').isInt({ min: 13, max: 120 }),
  body('gender').isIn(['male', 'female', 'other']),
  body('height').isFloat({ min: 100, max: 250 }),
  body('weight').isFloat({ min: 30, max: 300 }),
  body('activityLevel').isIn(['sedentary', 'light', 'moderate', 'active', 'veryActive']),
  body('goal').isIn(['fatLoss', 'muscleGain', 'maintenance']),
  body('foodType').isIn(['veg', 'nonVeg', 'vegan', 'eggetarian'])
];