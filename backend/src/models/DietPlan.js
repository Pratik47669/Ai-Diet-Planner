import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  calories: {
    type: Number,
    required: true
  },
  description: String,
  ingredients: [String],
  recipe: String
}, { _id: false });

const dayPlanSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  breakfast: mealSchema,
  lunch: mealSchema,
  dinner: mealSchema,
  snacks: mealSchema,
  totalCalories: {
    type: Number,
    required: true
  }
}, { _id: false });

const dietPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  },
  title: {
    type: String,
    default: 'AI Generated Diet Plan'
  },
  goal: {
    type: String,
    enum: ['fatLoss', 'muscleGain', 'maintenance'],
    required: true
  },
  foodType: {
    type: String,
    enum: ['veg', 'nonVeg', 'vegan', 'eggetarian'],
    required: true
  },
  bmi: {
    type: Number,
    required: true
  },
  dailyCalorieTarget: {
    type: Number,
    required: true
  },
  days: [dayPlanSchema],
  healthTips: [String],
  aiPrompt: {
    type: String,
    required: true
  },
  aiResponse: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  isAIGenerated: {
    type: Boolean,
    default: true
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
dietPlanSchema.index({ user: 1, createdAt: -1 });
dietPlanSchema.index({ user: 1, isFavorite: 1 });

export const DietPlan = mongoose.model('DietPlan', dietPlanSchema);