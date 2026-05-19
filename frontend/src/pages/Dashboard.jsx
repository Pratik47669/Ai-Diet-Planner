import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/axios';
import { motion } from 'framer-motion';
import {
    Activity,
    Target,
    TrendingUp,
    Calendar,
    Flame,
    Award,
    Sparkles,
    ArrowRight,
    Loader2
} from 'lucide-react';
import BMIGraph from '../components/analytics/BMIGraph';
import Card from '../components/ui/Card';

const Dashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [recentPlans, setRecentPlans] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [profileRes, statsRes, plansRes] = await Promise.all([
                api.get('/profile'),
                api.get('/analytics/stats'),
                api.get('/diet/history?limit=3')
            ]);
            
            setProfile(profileRes.data.profile);
            setStats(statsRes.data.stats);
            setRecentPlans(plansRes.data.plans);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-3xl p-8"
            >
                <h1 className="text-3xl font-bold font-display mb-2">
                    Welcome back, {profile?.name || user?.email?.split('@')[0]}! 👋
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Here's your health summary and recent activity.
                </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card rounded-2xl p-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                            <Activity className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Current BMI</p>
                            <p className="text-2xl font-bold">{profile?.bmi || 'N/A'}</p>
                            <p className="text-xs text-gray-500 capitalize">{profile?.bmiCategory}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card rounded-2xl p-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Flame className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Daily Calories</p>
                            <p className="text-2xl font-bold">{profile?.dailyCalorieTarget || 'N/A'}</p>
                            <p className="text-xs text-gray-500">kcal</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card rounded-2xl p-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                            <Award className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Plans</p>
                            <p className="text-2xl font-bold">{stats?.totalPlans || 0}</p>
                            <p className="text-xs text-gray-500">generated</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card rounded-2xl p-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
                            <p className="text-2xl font-bold">
                                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'N/A'}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/diet-planner">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="glass-card rounded-2xl p-6 hover:shadow-2xl transition cursor-pointer group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-primary-600" />
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition transform group-hover:translate-x-1" />
                        </div>
                        <h3 className="font-bold text-lg mb-1">Generate Diet Plan</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Get a personalized AI-powered 7-day diet plan
                        </p>
                    </motion.div>
                </Link>

                <Link to="/analytics">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="glass-card rounded-2xl p-6 hover:shadow-2xl transition cursor-pointer group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-blue-600" />
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition transform group-hover:translate-x-1" />
                        </div>
                        <h3 className="font-bold text-lg mb-1">View Analytics</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Track your BMI trends and calorie intake
                        </p>
                    </motion.div>
                </Link>

                <Link to="/history">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="glass-card rounded-2xl p-6 hover:shadow-2xl transition cursor-pointer group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <Target className="w-6 h-6 text-purple-600" />
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition transform group-hover:translate-x-1" />
                        </div>
                        <h3 className="font-bold text-lg mb-1">Diet History</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            View and manage your past diet plans
                        </p>
                    </motion.div>
                </Link>
            </div>

            {/* BMI Chart */}
            {profile && (
                <BMIGraph />
            )}

            {/* Recent Plans */}
            {recentPlans.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="glass-card rounded-3xl p-6"
                >
                    <h2 className="text-lg font-semibold mb-4">Recent Diet Plans</h2>
                    <div className="space-y-3">
                        {recentPlans.map((plan, index) => (
                            <Link
                                key={plan._id}
                                to={`/diet-planner?plan=${plan._id}`}
                                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            {new Date(plan.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {plan.goal} · {plan.foodType} · {plan.dailyCalorieTarget} kcal
                                        </p>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                            </Link>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default Dashboard;