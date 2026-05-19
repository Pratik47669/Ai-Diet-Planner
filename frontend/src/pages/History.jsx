import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/axios';
import { 
    History as HistoryIcon, 
    Search, 
    Filter, 
    Calendar,
    Download,
    Trash2,
    Heart,
    Loader2,
    X
} from 'lucide-react';
import DietPlanCard from '../components/diet/DietPlanCard';
import PDFDownload from '../components/diet/PDFDownload';
import toast from 'react-hot-toast';

const History = () => {
    const [loading, setLoading] = useState(true);
    const [plans, setPlans] = useState([]);
    const [filteredPlans, setFilteredPlans] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showPDFModal, setShowPDFModal] = useState(false);
    const [profile, setProfile] = useState(null);
    const [filters, setFilters] = useState({
        goal: 'all',
        foodType: 'all',
        dateRange: 'all'
    });

    useEffect(() => {
        fetchHistory();
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/profile');
            setProfile(response.data.profile);
        } catch (error) {
            // Profile may not exist, that's okay
        }
    };

    useEffect(() => {
        applyFilters();
    }, [searchTerm, filters, plans]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await api.get('/diet/history');
            setPlans(response.data.plans);
            setFilteredPlans(response.data.plans);
        } catch (error) {
            toast.error('Failed to fetch history');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...plans];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(plan => 
                plan.days?.some(day => 
                    day.breakfast.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    day.lunch.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }

        // Goal filter
        if (filters.goal !== 'all') {
            filtered = filtered.filter(plan => plan.goal === filters.goal);
        }

        // Food type filter
        if (filters.foodType !== 'all') {
            filtered = filtered.filter(plan => plan.foodType === filters.foodType);
        }

        // Date range filter
        if (filters.dateRange !== 'all') {
            const now = new Date();
            const ranges = {
                week: new Date(now.setDate(now.getDate() - 7)),
                month: new Date(now.setMonth(now.getMonth() - 1)),
                year: new Date(now.setFullYear(now.getFullYear() - 1))
            };
            filtered = filtered.filter(plan => 
                new Date(plan.createdAt) >= ranges[filters.dateRange]
            );
        }

        setFilteredPlans(filtered);
    };

    const handleDelete = async (planId) => {
        if (!confirm('Are you sure you want to delete this plan?')) return;
        
        try {
            await api.delete(`/diet/${planId}`);
            setPlans(prev => prev.filter(p => p._id !== planId));
            toast.success('Plan deleted successfully');
        } catch (error) {
            toast.error('Failed to delete plan');
        }
    };

    const handleFavorite = async (planId) => {
        try {
            const response = await api.patch(`/diet/${planId}/favorite`);
            setPlans(prev => prev.map(p => 
                p._id === planId ? { ...p, isFavorite: response.data.isFavorite } : p
            ));
        } catch (error) {
            toast.error('Failed to update favorite');
        }
    };

    const handleDownload = (plan) => {
        setSelectedPlan(plan);
        setShowPDFModal(true);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilters({
            goal: 'all',
            foodType: 'all',
            dateRange: 'all'
        });
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-display mb-2">Diet History</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        View and manage all your past diet plans
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full">
                        {filteredPlans.length} plans
                    </span>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="glass-card rounded-2xl p-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search meals..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    {/* Filters */}
                    <select
                        value={filters.goal}
                        onChange={(e) => setFilters({ ...filters, goal: e.target.value })}
                        className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="all">All Goals</option>
                        <option value="fatLoss">Fat Loss</option>
                        <option value="muscleGain">Muscle Gain</option>
                        <option value="maintenance">Maintenance</option>
                    </select>

                    <select
                        value={filters.foodType}
                        onChange={(e) => setFilters({ ...filters, foodType: e.target.value })}
                        className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="all">All Food Types</option>
                        <option value="veg">Vegetarian</option>
                        <option value="nonVeg">Non-Vegetarian</option>
                        <option value="vegan">Vegan</option>
                        <option value="eggetarian">Eggetarian</option>
                    </select>

                    <select
                        value={filters.dateRange}
                        onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                        className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="all">All Time</option>
                        <option value="week">Last Week</option>
                        <option value="month">Last Month</option>
                        <option value="year">Last Year</option>
                    </select>

                    {(searchTerm || filters.goal !== 'all' || filters.foodType !== 'all' || filters.dateRange !== 'all') && (
                        <button
                            onClick={clearFilters}
                            className="px-4 py-3 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Plans Grid */}
            {filteredPlans.length === 0 ? (
                <div className="text-center py-16">
                    <div className="glass-card rounded-3xl p-12 max-w-md mx-auto">
                        <HistoryIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">No Plans Found</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {plans.length === 0 
                                ? "You haven't generated any diet plans yet."
                                : "No plans match your filters."}
                        </p>
                        {plans.length === 0 ? (
                            <a
                                href="/diet-planner"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition"
                            >
                                Generate First Plan
                            </a>
                        ) : (
                            <button
                                onClick={clearFilters}
                                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredPlans.map((plan, index) => (
                            <motion.div
                                key={plan._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <DietPlanCard
                                    plan={plan}
                                    onDelete={handleDelete}
                                    onFavorite={handleFavorite}
                                    onDownload={handleDownload}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* PDF Modal */}
            {showPDFModal && selectedPlan && (
                <PDFDownload
                    plan={selectedPlan}
                    profile={profile || { name: 'User', age: '', gender: '', height: '', weight: '', bmi: '', bmiCategory: '', goal: '', foodType: '', dailyCalorieTarget: '' }}
                    onClose={() => {
                        setShowPDFModal(false);
                        setSelectedPlan(null);
                    }}
                />
            )}
        </div>
    );
};

export default History;