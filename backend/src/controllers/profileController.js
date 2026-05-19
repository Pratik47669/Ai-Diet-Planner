import { Profile } from '../models/Profile.js';
import { logger } from '../utils/logger.js';

export const createOrUpdateProfile = async (req, res) => {
  try {
    const { name, age, gender, height, weight, activityLevel, goal, foodType, medicalConditions } = req.body;
    
    // Check if profile exists
    let profile = await Profile.findOne({ user: req.user.id }).populate('user', 'email');
    
    if (profile) {
      // Update existing profile
      profile.name = name;
      profile.age = age;
      profile.gender = gender;
      profile.height = height;
      profile.weight = weight;
      profile.activityLevel = activityLevel;
      profile.goal = goal;
      profile.foodType = foodType;
      profile.medicalConditions = medicalConditions || profile.medicalConditions;
      
      await profile.save();
    } else {
      // Create new profile
      profile = await Profile.create({
        user: req.user.id,
        name,
        age,
        gender,
        height,
        weight,
        activityLevel,
        goal,
        foodType,
        medicalConditions
      });
    }
    
    // Calculate daily calorie target
    const dailyCalorieTarget = profile.calculateCalorieTarget();
    
    res.json({
      success: true,
      profile: {
        ...profile.toObject(),
        dailyCalorieTarget
      }
    });
  } catch (error) {
    logger.error('Profile creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', 'email');
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }
    
    const dailyCalorieTarget = profile.calculateCalorieTarget();
    
    res.json({
      success: true,
      profile: {
        ...profile.toObject(),
        dailyCalorieTarget
      }
    });
  } catch (error) {
    logger.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
};

export const deleteProfile = async (req, res) => {
  try {
    const profile = await Profile.findOneAndDelete({ user: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Profile deleted successfully'
    });
  } catch (error) {
    logger.error('Profile deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting profile'
    });
  }
};