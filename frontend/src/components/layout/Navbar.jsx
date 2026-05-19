import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Menu,
    X,
    Home,
    LayoutDashboard,
    Utensils,
    History,
    BarChart3,
    User,
    Shield,
    LogOut,
    Sun,
    Moon,
    Monitor,
    Sparkles
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    const navItems = [
        { path: '/', label: 'Home', icon: Home, protected: true },
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, protected: true },
        { path: '/diet-planner', label: 'Diet Planner', icon: Utensils, protected: true },
        { path: '/history', label: 'History', icon: History, protected: true },
        { path: '/analytics', label: 'Analytics', icon: BarChart3, protected: true },
        { path: '/profile', label: 'Profile', icon: User, protected: true },
    ];

    if (isAdmin) {
        navItems.push({ path: '/admin', label: 'Admin', icon: Shield, admin: true });
    }

    const filteredNavItems = navItems.filter(item => {
        if (item.public) return true;
        if (item.admin && !isAdmin) return false;
        if (item.protected && !isAuthenticated) return false;
        return true;
    });

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg shadow-lg' : 'bg-transparent'
            }`}>
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-xl font-display text-primary-600">
                                NutriPlan AI
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-6">
                            {filteredNavItems.map(item => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl transition ${
                                        location.pathname === item.path
                                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <item.icon className="w-4 h-4" />
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center gap-3">
                            <ThemeToggle />

                            {isAuthenticated ? (
                                <div className="hidden md:flex items-center gap-3">
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800">
                                        <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs">
                                            {user?.email?.[0].toUpperCase()}
                                        </div>
                                        <span className="text-sm font-medium">
                                            {user?.email?.split('@')[0]}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="hidden md:flex items-center gap-3">
                                    <Link
                                        to="/login"
                                        className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white transition"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                            >
                                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-x-0 top-16 z-40 md:hidden"
                    >
                        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-xl">
                            <div className="container mx-auto px-4 py-4">
                                <div className="flex flex-col gap-2">
                                    {filteredNavItems.map(item => (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                                                location.pathname === item.path
                                                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }`}
                                        >
                                            <item.icon className="w-5 h-5" />
                                            <span className="font-medium">{item.label}</span>
                                        </Link>
                                    ))}

                                    {isAuthenticated ? (
                                        <>
                                            <div className="h-px bg-gray-200 dark:bg-gray-800 my-2" />
                                            <div className="flex items-center justify-between px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center">
                                                        {user?.email?.[0].toUpperCase()}
                                                    </div>
                                                    <span className="font-medium">
                                                        {user?.email?.split('@')[0]}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={handleLogout}
                                                    className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600"
                                                >
                                                    <LogOut className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="h-px bg-gray-200 dark:bg-gray-800 my-2" />
                                            <div className="grid grid-cols-2 gap-3 px-4 py-3">
                                                <Link
                                                    to="/login"
                                                    className="text-center px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                                >
                                                    Login
                                                </Link>
                                                <Link
                                                    to="/register"
                                                    className="text-center px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white transition"
                                                >
                                                    Sign Up
                                                </Link>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Spacer */}
            <div className="h-16" />
        </>
    );
};

export default Navbar;