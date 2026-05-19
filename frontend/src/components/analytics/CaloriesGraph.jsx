import React, { useState } from 'react';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { motion } from 'framer-motion';
import { Flame, TrendingDown, TrendingUp, Target } from 'lucide-react';

const CaloriesGraph = ({ data = [], height = 400 }) => {
    const [chartType, setChartType] = useState('bar');
    const [showTarget, setShowTarget] = useState(true);

    const calculateStats = () => {
        if (data.length === 0) return { avg: 0, total: 0, withinTarget: 0 };
        
        const total = data.reduce((acc, item) => acc + item.consumed, 0);
        const avg = total / data.length;
        const withinTarget = data.filter(item => item.consumed <= item.target).length;
        
        return { avg: Math.round(avg), total, withinTarget };
    };

    const stats = calculateStats();

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
                    <p className="text-sm text-green-600">
                        Consumed: <span className="font-bold">{payload[0].value} kcal</span>
                    </p>
                    <p className="text-sm text-blue-600">
                        Target: <span className="font-bold">{payload[0].payload.target} kcal</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {payload[0].value <= payload[0].payload.target 
                            ? '✅ Within target' 
                            : '⚠️ Exceeded target'}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                        <Flame className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold font-display">Calorie Tracking</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Monitor your daily calorie intake
                        </p>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <button
                        onClick={() => setChartType('bar')}
                        className={`px-3 py-2 rounded-xl text-sm transition ${
                            chartType === 'bar'
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700'
                        }`}
                    >
                        Bar
                    </button>
                    <button
                        onClick={() => setChartType('line')}
                        className={`px-3 py-2 rounded-xl text-sm transition ${
                            chartType === 'line'
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700'
                        }`}
                    >
                        Line
                    </button>
                    <button
                        onClick={() => setShowTarget(!showTarget)}
                        className={`p-2 rounded-xl transition ${
                            showTarget
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                                : 'bg-gray-100 dark:bg-gray-700'
                        }`}
                    >
                        <Target className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Average</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {stats.avg} kcal
                    </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {stats.total} kcal
                    </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">On Target</p>
                    <p className="text-xl font-bold text-green-600">
                        {Math.round((stats.withinTarget / data.length) * 100)}%
                    </p>
                </div>
            </div>

            {/* Chart */}
            <div style={{ width: '100%', height }}>
                <ResponsiveContainer>
                    {chartType === 'bar' ? (
                        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                            <XAxis dataKey="date" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} />
                            <YAxis stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar 
                                dataKey="consumed" 
                                name="Consumed" 
                                fill="#22c55e" 
                                radius={[4, 4, 0, 0]}
                            />
                            {showTarget && (
                                <Bar 
                                    dataKey="target" 
                                    name="Target" 
                                    fill="#3b82f6" 
                                    radius={[4, 4, 0, 0]}
                                />
                            )}
                        </BarChart>
                    ) : (
                        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                            <XAxis dataKey="date" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} />
                            <YAxis stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="consumed" 
                                name="Consumed" 
                                stroke="#22c55e" 
                                strokeWidth={3}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                            {showTarget && (
                                <Line 
                                    type="monotone" 
                                    dataKey="target" 
                                    name="Target" 
                                    stroke="#3b82f6" 
                                    strokeWidth={3}
                                    strokeDasharray="5 5"
                                    dot={{ r: 4 }}
                                />
                            )}
                        </LineChart>
                    )}
                </ResponsiveContainer>
            </div>

            {/* Summary */}
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.withinTarget === data.length 
                        ? "🎉 Great job! You've stayed within your calorie target every day."
                        : stats.avg < data[0]?.target
                        ? "👍 You're doing well! Keep tracking your calories."
                        : "💪 Keep going! Small improvements each day add up."}
                </p>
            </div>
        </motion.div>
    );
};

export default CaloriesGraph;