import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [13, 'Minimum age is 13'],
    max: [120, 'Maximum age is 120']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Gender is required']
  },
  height: {
    type: Number,
    required: [true, 'Height is required'],
    min: [100, 'Minimum height is 100cm'],
    max: [250, 'Maximum height is 250cm']
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required'],
    min: [30, 'Minimum weight is 30kg'],
    max: [300, 'Maximum weight is 300kg']
  },
  activityLevel: {
    type: String,
    enum: ['sedentary', 'light', 'moderate', 'active', 'veryActive'],
    required: [true, 'Activity level is required']
  },
  goal: {
    type: String,
    enum: ['fatLoss', 'muscleGain', 'maintenance'],
    required: [true, 'Goal is required']
  },
  foodType: {
    type: String,
    enum: ['veg', 'nonVeg', 'vegan', 'eggetarian'],
    required: [true, 'Food type is required']
  },
  medicalConditions: {
    type: String,
    trim: true,
    maxlength: [500, 'Medical conditions cannot exceed 500 characters']
  },
  allergies: [{
    type: String,
    trim: true
  }],
  dietaryRestrictions: [{
    type: String,
    trim: true
  }],
  bmi: {
    type: Number,
    default: 0
  },
  bmiCategory: {
    type: String,
    enum: ['underweight', 'normal', 'overweight', 'obese'],
    default: 'normal'
  },
  dailyCalorieTarget: {
    type: Number,
    default: 2000
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate BMI before saving
profileSchema.pre('save', function(next) {
  if (this.height && this.weight) {
    const heightInM = this.height / 100;
    this.bmi = Number((this.weight / (heightInM * heightInM)).toFixed(1));
    
    if (this.bmi < 18.5) this.bmiCategory = 'underweight';
    else if (this.bmi < 25) this.bmiCategory = 'normal';
    else if (this.bmi < 30) this.bmiCategory = 'overweight';
    else this.bmiCategory = 'obese';
  }
  next();
});

// Calculate daily calorie target based on goal
profileSchema.methods.calculateCalorieTarget = function() {
  const BMR = this.gender === 'male'
    ? 10 * this.weight + 6.25 * this.height - 5 * this.age + 5
    : 10 * this.weight + 6.25 * this.height - 5 * this.age - 161;
  
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryActive: 1.9
  };
  
  const TDEE = BMR * activityMultipliers[this.activityLevel];
  
  switch(this.goal) {
    case 'fatLoss':
      return Math.max(1200, Math.round(TDEE - 500));
    case 'muscleGain':
      return Math.round(TDEE + 300);
    default:
      return Math.round(TDEE);
  }
};

export const Profile = mongoose.model('Profile', profileSchema);