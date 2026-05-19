import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    User, 
    Mail, 
    Calendar, 
    Ruler, 
    Weight, 
    Activity, 
    Target, 
    Utensils,
    Heart,
    AlertCircle,
    Save,
    Loader2
} from 'lucide-react';
import { api } from '../../api/axios';
import toast from 'react-hot-toast';

const ProfileForm = ({ initialData = null, onSuccess }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'male',
        height: '',
        weight: '',
        activityLevel: 'moderate',
        goal: 'maintenance',
        foodType: 'veg',
        medicalConditions: '',
        allergies: [],
        dietaryRestrictions: []
    });

    const [calculatedBMI, setCalculatedBMI] = useState(null);
    const [bmiCategory, setBmiCategory] = useState(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                age: initialData.age || '',
                height: initialData.height || '',
                weight: initialData.weight || '',
                medicalConditions: initialData.medicalConditions || '',
                allergies: initialData.allergies || [],
                dietaryRestrictions: initialData.dietaryRestrictions || []
            });
        }
    }, [initialData]);

    useEffect(() => {
        if (formData.height && formData.weight) {
            const heightInM = formData.height / 100;
            const bmi = formData.weight / (heightInM * heightInM);
            const roundedBMI = Math.round(bmi * 10) / 10;
            setCalculatedBMI(roundedBMI);
            
            if (roundedBMI < 18.5) setBmiCategory('underweight');
            else if (roundedBMI < 25) setBmiCategory('normal');
            else if (roundedBMI < 30) setBmiCategory('overweight');
            else setBmiCategory('obese');
        } else {
            setCalculatedBMI(null);
            setBmiCategory(null);
        }
    }, [formData.height, formData.weight]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNumberChange = (e) => {
        const { name, value } = e.target;
        if (value === '' || /^\d+$/.test(value)) {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate
        if (!formData.name || !formData.age || !formData.height || !formData.weight) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/profile', {
                ...formData,
                age: parseInt(formData.age),
                height: parseFloat(formData.height),
                weight: parseFloat(formData.weight)
            });
            
            toast.success('Profile saved successfully!');
            if (onSuccess) {
                onSuccess(response.data.profile);
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save profile');
        } finally {
            setLoading(false);
        }
    };

    const activityLevels = [
        { value: 'sedentary', label: 'Sedentary', description: 'Little or no exercise', icon: '🪑' },
        { value: 'light', label: 'Light', description: 'Exercise 1-3 days/week', icon: '🚶' },
        { value: 'moderate', label: 'Moderate', description: 'Exercise 3-5 days/week', icon: '🏃' },
        { value: 'active', label: 'Active', description: 'Exercise 6-7 days/week', icon: '💪' },
        { value: 'veryActive', label: 'Very Active', description: 'Hard exercise daily', icon: '🏋️' }
    ];

    const goals = [
        { value: 'fatLoss', label: 'Fat Loss', icon: '🔥', color: 'orange' },
        { value: 'muscleGain', label: 'Muscle Gain', icon: '💪', color: 'blue' },
        { value: 'maintenance', label: 'Maintenance', icon: '⚖️', color: 'green' }
    ];

    const foodTypes = [
        { value: 'veg', label: 'Vegetarian', icon: '🥦' },
        { value: 'nonVeg', label: 'Non-Vegetarian', icon: '🍗' },
        { value: 'vegan', label: 'Vegan', icon: '🌱' },
        { value: 'eggetarian', label: 'Eggetarian', icon: '🥚' }
    ];

    const genders = [
        { value: 'male', label: 'Male', icon: '👨' },
        { value: 'female', label: 'Female', icon: '👩' },
        { value: 'other', label: 'Other', icon: '🧑' }
    ];

    const getBMIColor = () => {
        switch(bmiCategory) {
            case 'underweight': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
            case 'normal': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
            case 'overweight': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
            case 'obese': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
            default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="glass-card rounded-2xl p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-primary-600" />
                        Personal Information
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                required
                            />
                        </div>

                        {/* Age */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Age <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleNumberChange}
                                    placeholder="25"
                                    min="13"
                                    max="120"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    required
                                />
                            </div>
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Gender <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {genders.map(g => (
                                    <label
                                        key={g.value}
                                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 cursor-pointer transition ${
                                            formData.gender === g.value
                                                ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="gender"
                                            value={g.value}
                                            checked={formData.gender === g.value}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <span className="text-2xl">{g.icon}</span>
                                        <span className="text-xs">{g.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body Measurements */}
                <div className="glass-card rounded-2xl p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-primary-600" />
                        Body Measurements
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Height */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Height (cm) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="number"
                                    name="height"
                                    value={formData.height}
                                    onChange={handleNumberChange}
                                    placeholder="170"
                                    min="100"
                                    max="250"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    required
                                />
                            </div>
                        </div>

                        {/* Weight */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Weight (kg) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="number"
                                    name="weight"
                                    value={formData.weight}
                                    onChange={handleNumberChange}
                                    placeholder="70"
                                    min="30"
                                    max="300"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* BMI Display */}
                    {calculatedBMI && (
                        <div className={`p-4 rounded-xl ${getBMIColor()} flex items-center justify-between`}>
                            <div>
                                <p className="text-sm font-medium">Your BMI</p>
                                <p className="text-2xl font-bold">{calculatedBMI}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium capitalize">{bmiCategory}</p>
                                <p className="text-xs opacity-75">
                                    {bmiCategory === 'underweight' && 'Consider gaining weight'}
                                    {bmiCategory === 'normal' && 'Healthy weight range'}
                                    {bmiCategory === 'overweight' && 'Consider losing weight'}
                                    {bmiCategory === 'obese' && 'Consult a healthcare provider'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Lifestyle & Goals */}
                <div className="glass-card rounded-2xl p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary-600" />
                        Lifestyle & Goals
                    </h2>

                    {/* Activity Level */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">
                            Activity Level <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {activityLevels.map(level => (
                                <label
                                    key={level.value}
                                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                                        formData.activityLevel === level.value
                                            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="activityLevel"
                                        value={level.value}
                                        checked={formData.activityLevel === level.value}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    <span className="text-2xl">{level.icon}</span>
                                    <div>
                                        <p className="font-medium text-sm">{level.label}</p>
                                        <p className="text-xs text-gray-500">{level.description}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Goal */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">
                            Your Goal <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {goals.map(g => (
                                <label
                                    key={g.value}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition ${
                                        formData.goal === g.value
                                            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="goal"
                                        value={g.value}
                                        checked={formData.goal === g.value}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    <span className="text-2xl">{g.icon}</span>
                                    <span className="text-xs font-medium">{g.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Food Type */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Food Preference <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {foodTypes.map(type => (
                                <label
                                    key={type.value}
                                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition ${
                                        formData.foodType === type.value
                                            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="foodType"
                                        value={type.value}
                                        checked={formData.foodType === type.value}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    <span className="text-lg">{type.icon}</span>
                                    <span className="text-xs">{type.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Medical Information */}
                <div className="glass-card rounded-2xl p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-primary-600" />
                        Medical Information (Optional)
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Medical Conditions
                            </label>
                            <textarea
                                name="medicalConditions"
                                value={formData.medicalConditions}
                                onChange={handleChange}
                                placeholder="e.g., Diabetes, Hypertension, Thyroid..."
                                rows="3"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Allergies (comma separated)
                            </label>
                            <input
                                type="text"
                                name="allergies"
                                value={formData.allergies.join(', ')}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    allergies: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                })}
                                placeholder="e.g., Peanuts, Dairy, Gluten"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Dietary Restrictions
                            </label>
                            <input
                                type="text"
                                name="dietaryRestrictions"
                                value={formData.dietaryRestrictions.join(', ')}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    dietaryRestrictions: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                })}
                                placeholder="e.g., No onions, No garlic, Jain food"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Save Profile
                        </>
                    )}
                </button>
            </form>
        </motion.div>
    );
};

export default ProfileForm;