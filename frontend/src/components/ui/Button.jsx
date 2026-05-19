import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    icon,
    iconPosition = 'left',
    className = '',
    type = 'button',
    onClick,
    ...props
}) => {
    const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const variants = {
        primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl focus:ring-primary-500 focus:ring-offset-primary-50 dark:focus:ring-offset-gray-900',
        secondary: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white focus:ring-gray-500 focus:ring-offset-gray-50',
        outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 focus:ring-primary-500',
        ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-gray-500',
        danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 focus:ring-offset-red-50',
        success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 focus:ring-offset-green-50',
    };
    
    const sizes = {
        sm: 'px-3 py-2 text-sm gap-1.5 min-h-[36px]',
        md: 'px-4 py-2.5 text-base gap-2 min-h-[44px]',
        lg: 'px-6 py-3 text-lg gap-2.5 min-h-[52px]',
    };
    
    const classes = [
        baseClasses,
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        fullWidth ? 'w-full' : '',
        loading ? 'cursor-wait' : '',
        className
    ].join(' ');

    const MotionButton = motion.button;

    return (
        <MotionButton
            type={type}
            className={classes}
            onClick={onClick}
            disabled={disabled || loading}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1 }}
            {...props}
        >
            {loading && (
                <Loader2 className="w-4 h-4 animate-spin" />
            )}
            
            {!loading && icon && iconPosition === 'left' && (
                <span className="shrink-0">{icon}</span>
            )}
            
            <span className={loading ? 'ml-2' : ''}>
                {children}
            </span>
            
            {!loading && icon && iconPosition === 'right' && (
                <span className="shrink-0">{icon}</span>
            )}
        </MotionButton>
    );
};

export const ButtonGroup = ({
    children,
    orientation = 'horizontal',
    className = ''
}) => {
    const classes = [
        'flex',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        'gap-2',
        className
    ].join(' ');

    return (
        <div className={classes}>
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child, {
                        className: `${child.props.className || ''} flex-1`
                    });
                }
                return child;
            })}
        </div>
    );
};

export const IconButton = ({
    children,
    'aria-label': ariaLabel,
    size = 'md',
    variant = 'ghost',
    className = '',
    ...props
}) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
    };

    return (
        <Button
            variant={variant}
            size={size}
            className={`${sizeClasses[size]} p-0 ${className}`}
            aria-label={ariaLabel}
            {...props}
        >
            {children}
        </Button>
    );
};

export default Button;