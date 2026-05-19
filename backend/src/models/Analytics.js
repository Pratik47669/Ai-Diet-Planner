import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  bmi: {
    type: Number,
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  caloriesConsumed: {
    type: Number,
    default: 0
  },
  caloriesTarget: {
    type: Number,
    default: 0
  },
  mealsLogged: {
    type: Number,
    default: 0
  },
  waterIntake: {
    type: Number,
    default: 0
  },
  mood: {
    type: String,
    enum: ['great', 'good', 'okay', 'tired', 'stressed']
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Analytics = mongoose.model('Analytics', analyticsSchema);