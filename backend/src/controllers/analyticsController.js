import { Analytics } from '../models/Analytics.js';
import { DietPlan } from '../models/DietPlan.js';
import { Profile } from '../models/Profile.js';
import { logger } from '../utils/logger.js';

export const getBMITrend = async (req, res) => {
  try {
    const analytics = await Analytics.find({ user: req.user.id })
      .sort({ date: 1 })
      .limit(30);
    
    const trend = analytics.map(a => ({
      date: a.date.toISOString().split('T')[0],
      bmi: a.bmi,
      weight: a.weight
    }));
    
    res.json({
      success: true,
      trend
    });
  } catch (error) {
    logger.error('BMI trend error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching BMI trend'
    });
  }
};

export const getCaloriesTrend = async (req, res) => {
  try {
    const analytics = await Analytics.find({ user: req.user.id })
      .sort({ date: 1 })
      .limit(30);
    
    const trend = analytics.map(a => ({
      date: a.date.toISOString().split('T')[0],
      consumed: a.caloriesConsumed,
      target: a.caloriesTarget
    }));
    
    res.json({
      success: true,
      trend
    });
  } catch (error) {
    logger.error('Calories trend error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching calories trend'
    });
  }
};

export const getDietFrequency = async (req, res) => {
  try {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    
    const plans = await DietPlan.find({
      user: req.user.id,
      createdAt: { $gte: last30Days }
    });
    
    const frequency = plans.reduce((acc, plan) => {
      const date = plan.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    
    res.json({
      success: true,
      frequency
    });
  } catch (error) {
    logger.error('Diet frequency error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching diet frequency'
    });
  }
};

export const getStats = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const totalPlans = await DietPlan.countDocuments({ user: req.user.id });
    const recentPlans = await DietPlan.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5);
    
    const favoritePlans = await DietPlan.countDocuments({
      user: req.user.id,
      isFavorite: true
    });
    
    res.json({
      success: true,
      stats: {
        currentBMI: profile?.bmi || null,
        currentWeight: profile?.weight || null,
        totalPlans,
        favoritePlans,
        recentPlans
      }
    });
  } catch (error) {
    logger.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stats'
    });
  }
};