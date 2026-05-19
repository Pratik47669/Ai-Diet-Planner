import React, { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
    Brush
} from 'recharts';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, Calendar, Download } from 'lucide-react';

const BMIGraph = ({ data = [], height = 400 }) => {
    const [chartData, setChartData] = useState([]);
    const [selectedRange, setSelectedRange] = useState('all');
    const [showReferenceLines, setShowReferenceLines] = useState(true);

    useEffect(() => {
        if (data.length > 0) {
            filterDataByRange();
        }
    }, [data, selectedRange]);

    const filterDataByRange = () => {
        let filtered = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        if (selectedRange !== 'all') {
            const days = parseInt(selectedRange);
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - days);
            filtered = filtered.filter(item => new Date(item.date) >= cutoff);
        }
        
        setChartData(filtered);
    };

    const getBMIColor = (bmi) => {
        if (bmi < 18.5) return '#3b82f6';
        if (bmi < 25) return '#22c55e';
        if (bmi < 30) return '#eab308';
        return '#ef4444';
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
                    <p className="text-sm" style={{ color: getBMIColor(data.bmi) }}>
                        BMI: <span className="font-bold">{data.bmi}</span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Weight: {data.weight} kg
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        Category: {data.category}
                    </p>
                </div>
            );
        }
        return null;
    };

    const downloadData = () => {
        const csv = [
            ['Date', 'BMI', 'Weight', 'Category'].join(','),
            ...chartData.map(item => 
                [item.date, item.bmi, item.weight, item.category].join(',')
            )
        ].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bmi-history-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const getCurrentBMI = () => {
        if (chartData.length === 0) return null;
        return chartData[chartData.length - 1].bmi;
    };

    const getAverageBMI = () => {
        if (chartData.length === 0) return 0;
        const sum = chartData.reduce((acc, item) => acc + item.bmi, 0);
        return (sum / chartData.length).toFixed(1);
    };

    const getBMITrend = () => {
        if (chartData.length < 2) return 'stable';
        const first = chartData[0].bmi;
        const last = chartData[chartData.length - 1].bmi;
        const diff = last - first;
        if (diff > 0.5) return 'increasing';
        if (diff < -0.5) return 'decreasing';
        return 'stable';
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
                    <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold font-display">BMI Trend</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Track your BMI over time
                        </p>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <select
                        value={selectedRange}
                        onChange={(e) => setSelectedRange(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 border-0 text-sm"
                    >
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                        <option value="all">All time</option>
                    </select>
                    
                    <button
                        onClick={downloadData}
                        className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Current</p>
                    <p className="text-xl font-bold" style={{ color: getBMIColor(getCurrentBMI()) }}>
                        {getCurrentBMI() || 'N/A'}
                    </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Average</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {getAverageBMI()}
                    </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Trend</p>
                    <div className="flex items-center gap-1">
                        <TrendingUp className={`w-4 h-4 ${
                            getBMITrend() === 'increasing' ? 'text-red-500' :
                            getBMITrend() === 'decreasing' ? 'text-green-500' :
                            'text-yellow-500'
                        }`} />
                        <span className="text-sm font-medium capitalize">{getBMITrend()}</span>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div style={{ width: '100%', height }}>
                <ResponsiveContainer>
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="bmiGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                        
                        <XAxis 
                            dataKey="date" 
                            stroke="#6b7280"
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                        />
                        
                        <YAxis 
                            domain={[10, 40]}
                            stroke="#6b7280"
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                        />
                        
                        <Tooltip content={<CustomTooltip />} />
                        
                        {showReferenceLines && (
                            <>
                                <ReferenceLine y={18.5} stroke="#3b82f6" strokeDasharray="3 3" />
                                <ReferenceLine y={25} stroke="#22c55e" strokeDasharray="3 3" />
                                <ReferenceLine y={30} stroke="#eab308" strokeDasharray="3 3" />
                            </>
                        )}
                        
                        <Area
                            type="monotone"
                            dataKey="bmi"
                            stroke="#22c55e"
                            strokeWidth={3}
                            fill="url(#bmiGradient)"
                            dot={{ r: 4, fill: '#22c55e', strokeWidth: 2 }}
                            activeDot={{ r: 6, fill: '#22c55e', stroke: '#fff' }}
                        />
                        
                        <Brush 
                            dataKey="date" 
                            height={30} 
                            stroke="#22c55e"
                            fill="#f3f4f6"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Underweight</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Normal</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Overweight</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Obese</span>
                </div>
            </div>
        </motion.div>
    );
};

export default BMIGraph;