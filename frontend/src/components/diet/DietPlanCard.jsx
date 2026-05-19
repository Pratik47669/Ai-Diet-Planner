import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Download, Heart, Trash2, Sparkles, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const DietPlanCard = ({ plan, onDelete, onFavorite, onDownload }) => {
    const getGoalColor = (goal) => {
        switch(goal) {
            case 'fatLoss': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
            case 'muscleGain': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
            default: return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
        }
    };

    const getGoalIcon = (goal) => {
        switch(goal) {
            case 'fatLoss': return '🔥';
            case 'muscleGain': return '💪';
            default: return '⚖️';
        }
    };

    const getFoodTypeIcon = (type) => {
        switch(type) {
            case 'veg': return '🥦';
            case 'nonVeg': return '🍗';
            case 'vegan': return '🌱';
            default: return '🥚';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card rounded-2xl overflow-hidden hover:shadow-2xl transition-all"
        >
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                            <h3 className="font-bold font-display">
                                {plan.title || 'AI Diet Plan'}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDistanceToNow(new Date(plan.createdAt), { addSuffix: true })}
                                </span>
                                {plan.isAIGenerated && (
                                    <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
                                        AI
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        <button
                            onClick={() => onFavorite(plan._id)}
                            className={`p-2 rounded-xl transition ${
                                plan.isFavorite 
                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600' 
                                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        >
                            <Heart className={`w-4 h-4 ${plan.isFavorite ? 'fill-current' : ''}`} />
                        </button>
                        <button
                            onClick={() => onDelete(plan._id)}
                            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition group"
                        >
                            <Trash2 className="w-4 h-4 group-hover:text-red-600" />
                        </button>
                    </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getGoalColor(plan.goal)}`}>
                        {getGoalIcon(plan.goal)} {plan.goal.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium flex items-center gap-1">
                        {getFoodTypeIcon(plan.foodType)} {plan.foodType}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium">
                        BMI: {plan.bmi}
                    </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Daily Calories</p>
                        <p className="font-bold text-sm">{plan.dailyCalorieTarget} kcal</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Days</p>
                        <p className="font-bold text-sm">{plan.days?.length || 7}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                        <p className="font-bold text-sm">
                            {plan.days?.reduce((sum, day) => sum + day.totalCalories, 0)} kcal
                        </p>
                    </div>
                </div>

                {/* Preview */}
                <div className="space-y-2 mb-4">
                    {plan.days?.slice(0, 3).map((day, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                            <span className="font-medium">{day.day.substring(0, 3)}</span>
                            <span className="text-gray-600 dark:text-gray-400">
                                {day.breakfast.name.substring(0, 20)}...
                            </span>
                            <span className="text-primary-600 font-medium">{day.totalCalories} kcal</span>
                        </div>
                    ))}
                    {plan.days?.length > 3 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                            +{plan.days.length - 3} more days
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Link
                        to={`/diet-planner?plan=${plan._id}`}
                        className="flex-1 text-center py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium text-sm transition"
                    >
                        View Full Plan
                    </Link>
                    <button
                        onClick={() => onDownload(plan)}
                        className="py-2 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default DietPlanCard;