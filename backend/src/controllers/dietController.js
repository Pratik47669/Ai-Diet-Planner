import { DietPlan } from '../models/DietPlan.js';
import { Profile } from '../models/Profile.js';
import { generateDietWithAI, generateFallbackDiet } from '../services/aiService.js';
import { logger } from '../utils/logger.js';

export const generateDietPlan = async (req, res) => {
  try {
    // Get user profile
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Please complete your profile first'
      });
    }
    
    // Calculate daily calorie target
    const dailyCalorieTarget = profile.calculateCalorieTarget();
    
    // Prepare data for AI
    const userData = {
      name: profile.name,
      age: profile.age,
      gender: profile.gender,
      height: profile.height,
      weight: profile.weight,
      bmi: profile.bmi,
      bmiCategory: profile.bmiCategory,
      goal: profile.goal,
      foodType: profile.foodType,
      activityLevel: profile.activityLevel,
      medicalConditions: profile.medicalConditions || 'None',
      dailyCalorieTarget
    };
    
    let dietPlan;
    let aiPrompt;
    let aiResponse;
    
    try {
      // Try AI generation first
      const aiResult = await generateDietWithAI(userData);
      dietPlan = aiResult.plan;
      aiPrompt = aiResult.prompt;
      aiResponse = aiResult.response;
    } catch (aiError) {
      logger.info('API Key restricted. Serving beautiful Diet Plan via Mock AI Rule-Based Fallback.');
      
      // Fallback to rule-based generation
      dietPlan = generateFallbackDiet(userData);
      aiPrompt = 'Fallback rule-based generation';
      aiResponse = { fallback: true, error: aiError.message };
    }
    
    // Save to database
    const savedPlan = await DietPlan.create({
      user: req.user.id,
      profile: profile._id,
      title: `AI Diet Plan - ${new Date().toLocaleDateString()}`,
      goal: profile.goal,
      foodType: profile.foodType,
      bmi: profile.bmi,
      dailyCalorieTarget,
      days: dietPlan.days,
      healthTips: dietPlan.healthTips,
      aiPrompt,
      aiResponse,
      isAIGenerated: !dietPlan.isFallback
    });
    
    res.json({
      success: true,
      plan: savedPlan
    });
  } catch (error) {
    logger.error('Diet generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating diet plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getDietHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const plans = await DietPlan.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('profile', 'name age height weight');
    
    const total = await DietPlan.countDocuments({ user: req.user.id });
    
    res.json({
      success: true,
      plans,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Diet history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching diet history'
    });
  }
};

export const getDietPlanById = async (req, res) => {
  try {
    const plan = await DietPlan.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('profile', 'name age height weight');
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Diet plan not found'
      });
    }
    
    res.json({
      success: true,
      plan
    });
  } catch (error) {
    logger.error('Diet plan fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching diet plan'
    });
  }
};

export const deleteDietPlan = async (req, res) => {
  try {
    const plan = await DietPlan.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Diet plan not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Diet plan deleted successfully'
    });
  } catch (error) {
    logger.error('Diet plan deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting diet plan'
    });
  }
};

export const toggleFavorite = async (req, res) => {
  try {
    const plan = await DietPlan.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Diet plan not found'
      });
    }
    
    plan.isFavorite = !plan.isFavorite;
    await plan.save();
    
    res.json({
      success: true,
      isFavorite: plan.isFavorite
    });
  } catch (error) {
    logger.error('Toggle favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating favorite status'
    });
  }
};