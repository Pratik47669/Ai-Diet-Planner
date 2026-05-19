import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  Sparkles, 
  Loader2, 
  Download,
  Save,
  Heart,
  ChevronLeft,
  ChevronRight,
  Bot,
  AlertCircle
} from 'lucide-react';
import PDFDownload from '../components/diet/PDFDownload';
import DayPlan from '../components/diet/DayPlan';

export default function DietPlanner() {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeDay, setActiveDay] = useState(0);
  const [showPDFModal, setShowPDFModal] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/profile');
      setProfile(response.data.profile);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDietPlan = async () => {
    if (!profile) {
      toast.error('Please complete your profile first');
      return;
    }

    try {
      setGenerating(true);
      const response = await api.post('/diet/generate');
      setCurrentPlan(response.data.plan);
      toast.success('AI Diet Plan Generated Successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate diet plan');
    } finally {
      setGenerating(false);
    }
  };

  const toggleFavorite = async () => {
    if (!currentPlan) return;
    
    try {
      await api.patch(`/diet/${currentPlan._id}/favorite`);
      setCurrentPlan({
        ...currentPlan,
        isFavorite: !currentPlan.isFavorite
      });
      toast.success(currentPlan.isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      toast.error('Failed to update favorite status');
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="glass-card rounded-3xl p-8">
          <AlertCircle className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Complete Your Profile First</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            To generate a personalized AI diet plan, we need some information about you.
          </p>
          <a
            href="/profile"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-all"
          >
            Go to Profile
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display mb-2">AI Diet Planner</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate personalized 7-day diet plans powered by AI
          </p>
        </div>
        
        <button
          onClick={generateDietPlan}
          disabled={generating}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate New Plan
            </>
          )}
        </button>
      </div>

      {/* Profile Summary */}
      <div className="glass-card rounded-3xl p-6">
        <h2 className="text-lg font-semibold mb-4">Your Profile</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">BMI</p>
            <p className="text-2xl font-bold">{profile.bmi}</p>
            <p className="text-sm capitalize">{profile.bmiCategory}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Goal</p>
            <p className="text-lg font-semibold capitalize">{profile.goal}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Food Type</p>
            <p className="text-lg font-semibold capitalize">{profile.foodType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Daily Calories</p>
            <p className="text-lg font-semibold">{profile.dailyCalorieTarget} kcal</p>
          </div>
        </div>
      </div>

      {/* Current Plan */}
      {currentPlan ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Plan Header */}
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display flex items-center gap-2">
                    AI Generated Diet Plan
                    {currentPlan.isAIGenerated && (
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                        AI
                      </span>
                    )}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Generated on {new Date(currentPlan.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={toggleFavorite}
                  className={`p-3 rounded-xl transition-all ${
                    currentPlan.isFavorite 
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600' 
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${currentPlan.isFavorite ? 'fill-current' : ''}`} />
                </button>
                
                <button
                  onClick={() => setShowPDFModal(true)}
                  className="flex items-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-all"
                >
                  <Download className="w-5 h-5" />
                  Download PDF
                </button>
              </div>
            </div>

            {/* Day Navigation */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setActiveDay(prev => Math.max(0, prev - 1))}
                disabled={activeDay === 0}
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex gap-2 overflow-x-auto pb-2">
                {days.map((day, index) => (
                  <button
                    key={day}
                    onClick={() => setActiveDay(index)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                      activeDay === index
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setActiveDay(prev => Math.min(6, prev + 1))}
                disabled={activeDay === 6}
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Day Plan */}
          <DayPlan day={currentPlan.days[activeDay]} />

          {/* Health Tips */}
          {currentPlan.healthTips && (
            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-lg font-semibold mb-4">💡 Health Tips</h3>
              <ul className="space-y-2">
                {currentPlan.healthTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary-600 mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      ) : (
        <div className="text-center py-16">
          <div className="glass-card rounded-3xl p-12 max-w-2xl mx-auto">
            <Sparkles className="w-16 h-16 mx-auto text-primary-600 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Ready for Your Personalized Plan?</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Click the "Generate New Plan" button to let AI create a customized 7-day diet plan based on your profile.
            </p>
          </div>
        </div>
      )}

      {/* PDF Modal */}
      {showPDFModal && currentPlan && (
        <PDFDownload
          plan={currentPlan}
          profile={profile}
          onClose={() => setShowPDFModal(false)}
        />
      )}
    </div>
  );
}