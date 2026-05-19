import React from 'react';
import { motion } from 'framer-motion';
import { 
    Sun, 
    Sunrise, 
    Sunset, 
    Apple, 
    Coffee, 
    Info,
    Flame 
} from 'lucide-react';

const DayPlan = ({ day }) => {
    if (!day) return null;

    const meals = [
        {
            time: 'Breakfast',
            icon: <Sunrise className="w-5 h-5" />,
            color: 'from-yellow-500 to-orange-500',
            data: day.breakfast,
            bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
        },
        {
            time: 'Lunch',
            icon: <Sun className="w-5 h-5" />,
            color: 'from-orange-500 to-red-500',
            data: day.lunch,
            bgColor: 'bg-orange-50 dark:bg-orange-900/20'
        },
        {
            time: 'Dinner',
            icon: <Sunset className="w-5 h-5" />,
            color: 'from-purple-500 to-pink-500',
            data: day.dinner,
            bgColor: 'bg-purple-50 dark:bg-purple-900/20'
        },
        {
            time: 'Snacks',
            icon: <Apple className="w-5 h-5" />,
            color: 'from-green-500 to-emerald-500',
            data: day.snacks,
            bgColor: 'bg-green-50 dark:bg-green-900/20'
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
        >
            {/* Day Header */}
            <div className="glass-card rounded-2xl p-6 text-center">
                <h2 className="text-2xl font-bold font-display mb-2">{day.day}</h2>
                <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-primary-600" />
                        <span className="text-lg font-semibold">{day.totalCalories} kcal</span>
                    </div>
                </div>
            </div>

            {/* Meals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {meals.map((meal, index) => (
                    <motion.div
                        key={meal.time}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`rounded-2xl p-6 ${meal.bgColor} border border-gray-200 dark:border-gray-700`}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${meal.color} flex items-center justify-center text-white`}>
                                {meal.icon}
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">{meal.time}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {meal.data.calories} calories
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="font-medium text-gray-900 dark:text-white">
                                {meal.data.name}
                            </p>
                            
                            {meal.data.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {meal.data.description}
                                </p>
                            )}

                            {meal.data.ingredients && meal.data.ingredients.length > 0 && (
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                                        Ingredients:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {meal.data.ingredients.map((ing, i) => (
                                            <span
                                                key={i}
                                                className="px-2 py-1 bg-white dark:bg-gray-800 rounded-lg text-xs"
                                            >
                                                {ing}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {meal.data.recipe && (
                                <button
                                    onClick={() => {/* Show recipe modal */}}
                                    className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium mt-2"
                                >
                                    <Info className="w-4 h-4" />
                                    View Recipe
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Stats */}
            <div className="glass-card rounded-2xl p-6">
                <h3 className="font-semibold mb-4">Daily Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {meals.map(meal => (
                        <div key={meal.time} className="text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">{meal.time}</p>
                            <p className="font-bold text-lg">{meal.data.calories}</p>
                            <p className="text-xs text-gray-500">kcal</p>
                        </div>
                    ))}
                </div>
                
                {/* Calorie Distribution Bar */}
                <div className="mt-4 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex">
                    {meals.map((meal, index) => {
                        const percentage = (meal.data.calories / day.totalCalories) * 100;
                        const colors = ['bg-yellow-500', 'bg-orange-500', 'bg-purple-500', 'bg-green-500'];
                        return (
                            <div
                                key={index}
                                className={`${colors[index]} h-full`}
                                style={{ width: `${percentage}%` }}
                            />
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};

export default DayPlan;