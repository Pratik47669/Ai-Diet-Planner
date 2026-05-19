import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/axios';
import { 
    User, 
    Mail, 
    Calendar, 
    Ruler, 
    Weight, 
    Activity, 
    Target, 
    Utensils,
    Edit3,
    Trash2,
    AlertCircle,
    Loader2,
    Shield,
    CheckCircle2,
    Info,
    ArrowRight
} from 'lucide-react';
import ProfileForm from '../components/profile/ProfileForm';
import Card from '../components/ui/Card';
import toast from 'react-hot-toast';

const Profile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await api.get('/profile');
            setProfile(response.data.profile);
        } catch (error) {
            if (error.response?.status !== 404) {
                toast.error('Failed to fetch profile');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete('/profile');
            toast.success('Profile deleted successfully');
            navigate('/dashboard');
        } catch (error) {
            toast.error('Failed to delete profile');
        }
    };

    const getActivityIcon = (level) => {
        const icons = {
            sedentary: '🪑',
            light: '🚶',
            moderate: '🏃',
            active: '💪',
            veryActive: '🏋️'
        };
        return icons[level] || '📊';
    };

    const getGoalIcon = (goal) => {
        const icons = {
            fatLoss: '🔥',
            muscleGain: '💪',
            maintenance: '⚖️'
        };
        return icons[goal] || '🎯';
    };

    const getFoodIcon = (type) => {
        const icons = {
            veg: '🥦',
            nonVeg: '🍗',
            vegan: '🌱',
            eggetarian: '🥚'
        };
        return icons[type] || '🍽️';
    };

    const getBMIInfo = (bmi) => {
        if (bmi < 18.5) return { color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Underweight', border: 'border-blue-400/20' };
        if (bmi < 25) return { color: 'text-emerald-400', bg: 'bg-emerald-400/10', label: 'Healthy', border: 'border-emerald-400/20' };
        if (bmi < 30) return { color: 'text-amber-400', bg: 'bg-amber-400/10', label: 'Overweight', border: 'border-amber-400/20' };
        return { color: 'text-rose-400', bg: 'bg-rose-400/10', label: 'Obese', border: 'border-rose-400/20' };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
                    <Loader2 className="w-6 h-6 animate-spin text-primary-500 absolute inset-0 m-auto" />
                </div>
            </div>
        );
    }

    if (!profile && !isEditing) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto text-center py-20"
            >
                <Card className="p-12 border-white/5 bg-slate-900/50 backdrop-blur-xl">
                    <div className="w-20 h-20 bg-primary-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary-500/20">
                        <User className="w-10 h-10 text-primary-500" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4 font-display">Create Your Profile</h2>
                    <p className="text-slate-400 mb-8 max-w-sm mx-auto">
                        Setting up your profile helps us calculate your BMI and give personalized diet plans.
                    </p>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-bold shadow-lg shadow-primary-500/20 transition-all hover:scale-105"
                    >
                        Get Started
                    </button>
                </Card>
            </motion.div>
        );
    }

    if (isEditing) {
        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <div className="flex items-center gap-4 mb-8">
                    <button 
                        onClick={() => setIsEditing(false)}
                        className="p-2 hover:bg-slate-800 rounded-xl transition text-slate-400"
                    >
                        <ArrowRight className="w-5 h-5 rotate-180" />
                    </button>
                    <h1 className="text-3xl font-bold font-display">
                        {profile ? 'Edit Profile' : 'Create Profile'}
                    </h1>
                </div>
                <ProfileForm
                    initialData={profile}
                    onSuccess={(updatedProfile) => {
                        setProfile(updatedProfile);
                        setIsEditing(false);
                        fetchProfile();
                    }}
                />
            </motion.div>
        );
    }

    const bmiInfo = getBMIInfo(profile.bmi);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto space-y-8 pb-20"
        >
            {/* Action Bar */}
            <div className="flex items-center justify-between px-4">
                <div>
                    <h1 className="text-4xl font-black font-display tracking-tight text-white mb-1">Profile</h1>
                    <p className="text-slate-400 font-medium">Your health details and preferences</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl border border-white/5 transition-all hover:border-white/10"
                    >
                        <Edit3 className="w-4 h-4" />
                        <span className="font-semibold text-sm">Edit Profile</span>
                    </button>
                    {deleteConfirm ? (
                        <div className="flex gap-2 animate-in slide-in-from-right-4 duration-300">
                            <button
                                onClick={handleDelete}
                                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-rose-600/20 transition"
                            >
                                Confirm Delete
                            </button>
                            <button
                                onClick={() => setDeleteConfirm(false)}
                                className="px-5 py-2.5 bg-slate-800 text-white rounded-2xl font-bold text-sm transition"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setDeleteConfirm(true)}
                            className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 hover:bg-rose-500/20 transition-all active:scale-95"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Main Profile Header Card */}
            <div className="relative group overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-900 shadow-2xl shadow-emerald-900/20">
                {/* Visual Elements */}
                <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-white/10 rounded-full blur-[100px] -mr-64 -mt-64 pointer-events-none"></div>
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-cyan-400/20 rounded-full blur-[80px] pointer-events-none"></div>
                
                <div className="relative z-10 p-10 md:p-14 flex flex-col md:flex-row items-center md:items-start gap-10">
                    {/* Large Avatar */}
                    <div className="flex-shrink-0">
                        <div className="w-36 h-36 rounded-[2.5rem] bg-white/10 backdrop-blur-xl border-2 border-white/20 flex items-center justify-center text-6xl font-black font-display text-white shadow-2xl relative">
                            {profile.name?.charAt(0).toUpperCase()}
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-400 rounded-2xl flex items-center justify-center border-4 border-teal-800">
                                <CheckCircle2 className="w-5 h-5 text-teal-900" />
                            </div>
                        </div>
                    </div>

                    <div className="flex-grow text-center md:text-left space-y-6">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black font-display tracking-tight text-white mb-4">
                                {profile.name}
                            </h2>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <div className="flex items-center gap-2 px-5 py-2 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 group-hover:border-white/20 transition-all">
                                    <Mail className="w-4 h-4 text-emerald-300" />
                                    <span className="text-white font-semibold text-sm tracking-wide">
                                        {profile.user?.email || 'Loading email...'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-400/20 text-emerald-300 text-xs font-black uppercase tracking-widest rounded-xl border border-emerald-400/20">
                                    <Shield className="w-3.5 h-3.5" />
                                    Verified
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats in Header */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-8 pt-4">
                            <div className="text-center md:text-left">
                                <p className="text-emerald-200/60 text-xs font-bold uppercase tracking-widest mb-1">Height</p>
                                <p className="text-2xl font-black text-white">{profile.height} <span className="text-sm font-medium opacity-60">cm</span></p>
                            </div>
                            <div className="w-px h-10 bg-white/10 hidden md:block"></div>
                            <div className="text-center md:text-left">
                                <p className="text-emerald-200/60 text-xs font-bold uppercase tracking-widest mb-1">Weight</p>
                                <p className="text-2xl font-black text-white">{profile.weight} <span className="text-sm font-medium opacity-60">kg</span></p>
                            </div>
                            <div className="w-px h-10 bg-white/10 hidden md:block"></div>
                            <div className="text-center md:text-left">
                                <p className="text-emerald-200/60 text-xs font-bold uppercase tracking-widest mb-1">Age</p>
                                <p className="text-2xl font-black text-white">{profile.age} <span className="text-sm font-medium opacity-60">yr</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* BMI Gauge Section */}
                <div className="md:col-span-2 space-y-8">
                    <Card className="p-8 border-white/5 bg-slate-900/40 backdrop-blur-xl shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold font-display text-white mb-1">Body Mass Index (BMI)</h3>
                                <p className="text-slate-400 text-sm">Based on your current height and weight</p>
                            </div>
                            <div className={`px-4 py-2 rounded-2xl ${bmiInfo.bg} ${bmiInfo.color} font-black text-sm border ${bmiInfo.border}`}>
                                {bmiInfo.label}
                            </div>
                        </div>

                        <div className="relative pt-4">
                            <div className="flex items-end justify-between mb-4">
                                <span className="text-5xl font-black text-white">{profile.bmi}</span>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Daily Target</p>
                                    <p className="text-3xl font-black text-emerald-400">{profile.dailyCalorieTarget} <span className="text-sm font-medium">kcal</span></p>
                                </div>
                            </div>

                            {/* BMI Scale Indicator */}
                            <div className="space-y-4">
                                <div className="h-4 w-full flex rounded-full overflow-hidden border border-white/5 bg-slate-800">
                                    <div className="h-full bg-blue-500 w-[18.5%]" title="Underweight"></div>
                                    <div className="h-full bg-emerald-500 w-[25%]" title="Healthy"></div>
                                    <div className="h-full bg-amber-500 w-[20%]" title="Overweight"></div>
                                    <div className="h-full bg-rose-500 w-[36.5%]" title="Obese"></div>
                                </div>
                                <div className="relative h-2">
                                    <motion.div 
                                        initial={{ left: 0 }}
                                        animate={{ left: `${Math.min(Math.max((profile.bmi / 40) * 100, 2), 98)}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="absolute -top-6 -translate-x-1/2 flex flex-col items-center gap-1"
                                    >
                                        <div className={`w-3 h-3 rounded-full border-2 border-slate-900 shadow-xl ${bmiInfo.bg.replace('/10', '')}`}></div>
                                        <div className="w-1 h-3 bg-white/20 rounded-full"></div>
                                    </motion.div>
                                </div>
                                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-tighter pt-2">
                                    <span>Underweight (18.5)</span>
                                    <span>Healthy (25)</span>
                                    <span>Overweight (30)</span>
                                    <span>Obese (40+)</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Preferences Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="p-6 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] group hover:border-white/10 transition-all">
                            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                                {getActivityIcon(profile.activityLevel)}
                            </div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Activity</p>
                            <p className="text-lg font-bold text-white capitalize">{profile.activityLevel}</p>
                        </div>
                        <div className="p-6 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] group hover:border-white/10 transition-all">
                            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                                {getGoalIcon(profile.goal)}
                            </div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Fitness Goal</p>
                            <p className="text-lg font-bold text-white capitalize">
                                {profile.goal.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                        </div>
                        <div className="p-6 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] group hover:border-white/10 transition-all">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                                {getFoodIcon(profile.foodType)}
                            </div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Diet Preference</p>
                            <p className="text-lg font-bold text-white capitalize">{profile.foodType}</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                    {/* Medical Card */}
                    <div className="p-8 rounded-[2.5rem] bg-slate-800/40 border border-white/5 backdrop-blur-xl space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-amber-500/20 rounded-xl">
                                <AlertCircle className="w-5 h-5 text-amber-500" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Medical Notes</h3>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Conditions</p>
                                <p className="text-slate-300 font-medium leading-relaxed">
                                    {profile.medicalConditions || "No chronic conditions reported."}
                                </p>
                            </div>
                            
                            <div className="pt-2">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Allergies</p>
                                {profile.allergies?.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {profile.allergies.map((item, i) => (
                                            <span key={i} className="px-3 py-1 bg-rose-500/10 text-rose-400 text-xs font-bold rounded-lg border border-rose-500/20">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500 italic">None reported</p>
                                )}
                            </div>

                            <div className="pt-2">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Dietary Restrictions</p>
                                {profile.dietaryRestrictions?.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {profile.dietaryRestrictions.map((item, i) => (
                                            <span key={i} className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-xs font-bold rounded-lg border border-cyan-500/20">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500 italic">None reported</p>
                                )}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/5">
                            <div className="flex items-start gap-4 p-4 bg-slate-900/40 rounded-3xl border border-white/5">
                                <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-1" />
                                <p className="text-[11px] leading-relaxed text-slate-400 font-medium">
                                    This information is used by NutriPlan AI to tailor your recipes and calorie counts safely.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Profile;