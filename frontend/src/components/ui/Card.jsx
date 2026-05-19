import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
    children,
    className = '',
    padding = 'md',
    hover = false,
    onClick,
    ...props
}) => {
    const paddings = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    const classes = [
        'bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700',
        paddings[padding] || paddings.md,
        hover ? 'hover:shadow-2xl transition-shadow cursor-pointer' : '',
        className
    ].join(' ');

    const CardWrapper = onClick ? motion.div : 'div';

    return (
        <CardWrapper
            className={classes}
            onClick={onClick}
            whileHover={onClick ? { scale: 1.02 } : undefined}
            whileTap={onClick ? { scale: 0.98 } : undefined}
            {...props}
        >
            {children}
        </CardWrapper>
    );
};

export const CardHeader = ({ children, className = '' }) => (
    <div className={`border-b border-gray-200 dark:border-gray-700 pb-4 mb-4 ${className}`}>
        {children}
    </div>
);

export const CardBody = ({ children, className = '' }) => (
    <div className={className}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
    <div className={`border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 ${className}`}>
        {children}
    </div>
);

export const CardTitle = ({ children, className = '' }) => (
    <h3 className={`text-lg font-bold font-display ${className}`}>{children}</h3>
);

export const CardSubtitle = ({ children, className = '' }) => (
    <p className={`text-sm text-gray-600 dark:text-gray-400 ${className}`}>{children}</p>
);

export default Card;