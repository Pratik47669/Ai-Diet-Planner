import React, { useState, useEffect } from 'react';
import { api } from '../api/axios';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Activity, Calendar, Award, Loader2 } from 'lucide-react';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [bmiTrend, setBmiTrend] = useState([]);
  const [caloriesTrend, setCaloriesTrend] = useState([]);
  const [dietFrequency, setDietFrequency] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [bmiRes, caloriesRes, freqRes, statsRes] = await Promise.all([
        api.get('/analytics/bmi-trend'),
        api.get('/analytics/calories-trend'),
        api.get('/analytics/diet-frequency'),
        api.get('/analytics/stats')
      ]);
      
      setBmiTrend(bmiRes.data.trend);
      setCaloriesTrend(caloriesRes.data.trend);
      
      // Convert frequency object to array for chart
      const freqArray = Object.entries(freqRes.data.frequency).map(([date, count]) => ({
        date,
        count
      }));
      setDietFrequency(freqArray);
      
      setStats(statsRes.data.stats);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#ef4444'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display mb-2">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your health progress over time
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Current BMI</p>
                <p className="text-xl font-bold">{stats.currentBMI || 'N/A'}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Plans</p>
                <p className="text-xl font-bold">{stats.totalPlans}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Award className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Favorites</p>
                <p className="text-xl font-bold">{stats.favoritePlans}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Last Plan</p>
                <p className="text-xl font-bold">
                  {stats.recentPlans[0] 
                    ? new Date(stats.recentPlans[0].createdAt).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* BMI Trend Chart */}
      {bmiTrend.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-3xl p-6"
        >
          <h2 className="text-lg font-semibold mb-4">BMI Trend Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={bmiTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[10, 40]} />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="bmi" 
                stroke="#22c55e" 
                fill="#22c55e" 
                fillOpacity={0.3}
                name="BMI"
              />
            </AreaChart>
          </ResponsiveContainer>
          
          {/* Reference lines */}
          <div className="flex justify-between mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Underweight (&lt;18.5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Normal (18.5-24.9)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Overweight (25-29.9)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Obese (≥30)</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Calories Trend Chart */}
      {caloriesTrend.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-3xl p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Calories: Consumed vs Target</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={caloriesTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="consumed" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Consumed"
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="#22c55e" 
                strokeWidth={2}
                name="Target"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Diet Frequency Chart */}
      {dietFrequency.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card rounded-3xl p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Diet Plan Frequency (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dietFrequency}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#22c55e" name="Plans Generated" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
}