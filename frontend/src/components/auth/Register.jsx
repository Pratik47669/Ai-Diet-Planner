import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { 
    Mail, 
    Lock, 
    User, 
    Sparkles, 
    Eye, 
    EyeOff, 
    CheckCircle,
    XCircle 
} from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const { register, verifyOtpAndLogin } = useAuth();
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    
    // OTP State
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [registeredUserId, setRegisteredUserId] = useState(null);

    const passwordRequirements = [
        { test: (pwd) => pwd.length >= 6, label: 'At least 6 characters' }
    ];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear error for this field
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: ''
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }
        
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else {
            const failedReqs = passwordRequirements.filter(req => !req.test(formData.password));
            if (failedReqs.length > 0) {
                newErrors.password = 'Password does not meet requirements';
            }
        }
        
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        if (!acceptedTerms) {
            newErrors.terms = 'You must accept the terms and conditions';
        }
        
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        setLoading(true);
        const result = await register(formData.email, formData.password, formData.name);
        setLoading(false);
        
        if (result.success) {
            if (result.requiresVerification) {
                setRegisteredUserId(result.userId);
                setShowOtpModal(true);
            } else {
                navigate('/profile');
            }
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp || otp.length < 6) {
            setErrors({ ...errors, otp: 'Please enter a valid 6-digit code' });
            return;
        }
        
        setLoading(true);
        const result = await verifyOtpAndLogin(registeredUserId, otp);
        setLoading(false);
        
        if (result.success) {
            navigate('/profile');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                <div className="glass-card rounded-3xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
                            {showOtpModal ? (
                                <Mail className="w-10 h-10 text-primary-600" />
                            ) : (
                                <User className="w-10 h-10 text-primary-600" />
                            )}
                        </div>
                        <h2 className="text-2xl font-bold font-display mb-2">
                            {showOtpModal ? "Verify Your Email" : "Create Account"}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            {showOtpModal 
                                ? "We've sent a 6-digit code to your email." 
                                : "Start your personalized health journey"}
                        </p>
                    </div>

                    {showOtpModal ? (
                        <form onSubmit={handleVerifyOtp} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-center text-gray-700 dark:text-gray-300">
                                    Enter 6-Digit OTP
                                </label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    className="w-full text-center tracking-[1em] text-2xl font-mono py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition"
                                />
                                {errors.otp && (
                                    <p className="mt-2 text-center text-sm text-red-500">{errors.otp}</p>
                                )}
                            </div>
                            
                            <button
                                type="submit"
                                disabled={loading || otp.length !== 6}
                                className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Verify Email
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <>
                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                                        errors.name 
                                            ? 'border-red-500 focus:ring-red-500' 
                                            : 'border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500'
                                    } bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 transition`}
                                />
                            </div>
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                                        errors.email 
                                            ? 'border-red-500 focus:ring-red-500' 
                                            : 'border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500'
                                    } bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 transition`}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className={`w-full pl-10 pr-12 py-3 rounded-xl border ${
                                        errors.password 
                                            ? 'border-red-500 focus:ring-red-500' 
                                            : 'border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500'
                                    } bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 transition`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5 text-gray-400" />
                                    ) : (
                                        <Eye className="w-5 h-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            
                            {/* Password Requirements */}
                            <div className="mt-3 space-y-2">
                                {passwordRequirements.map((req, index) => (
                                    <div key={index} className="flex items-center gap-2 text-xs">
                                        {req.test(formData.password) ? (
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-gray-400" />
                                        )}
                                        <span className={req.test(formData.password) 
                                            ? 'text-green-600 dark:text-green-400' 
                                            : 'text-gray-500 dark:text-gray-400'
                                        }>
                                            {req.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className={`w-full pl-10 pr-12 py-3 rounded-xl border ${
                                        errors.confirmPassword 
                                            ? 'border-red-500 focus:ring-red-500' 
                                            : 'border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500'
                                    } bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 transition`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="w-5 h-5 text-gray-400" />
                                    ) : (
                                        <Eye className="w-5 h-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                            )}
                        </div>

                        {/* Terms */}
                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={acceptedTerms}
                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                                className="mt-1 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
                                I agree to the{' '}
                                <Link to="/terms" className="text-primary-600 hover:text-primary-700">
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link to="/privacy" className="text-primary-600 hover:text-primary-700">
                                    Privacy Policy
                                </Link>
                            </label>
                        </div>
                        {errors.terms && (
                            <p className="text-sm text-red-500">{errors.terms}</p>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Create Account
                                </>
                            )}
                        </button>
                    </form>
                    </>
                    )}

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;