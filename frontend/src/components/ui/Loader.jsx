import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const Loader = ({ size = 'md', text = 'Loading...', fullScreen = false }) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    };

    const spinnerSize = sizes[size] || sizes.md;

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <Loader2 className={`${spinnerSize} animate-spin text-primary-600 mx-auto mb-4`} />
                    <p className="text-gray-600 dark:text-gray-400">{text}</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className={`${spinnerSize} animate-spin text-primary-600 mb-2`} />
            {text && <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>}
        </div>
    );
};

export const SkeletonLoader = ({ type = 'card', count = 1 }) => {
    const skeletons = {
        card: (
            <div className="space-y-3">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
            </div>
        ),
        text: (
            <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6 animate-pulse" />
            </div>
        ),
        profile: (
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
                    </div>
                </div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            </div>
        ),
        chart: (
            <div className="space-y-4">
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
                <div className="flex gap-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
                </div>
            </div>
        ),
        list: (
            <div className="space-y-3">
                {[...Array(count)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        ),
    };

    return (
        <div className="animate-fade-in">
            {[...Array(count)].map((_, i) => (
                <div key={i} className="mb-4">
                    {skeletons[type] || skeletons.card}
                </div>
            ))}
        </div>
    );
};

export default Loader;