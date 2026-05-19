import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { logger } from '../utils/logger.js';

/**
 * Authentication Configuration
 * Handles JWT tokens, password hashing, and security utilities
 */

// JWT Configuration
export const JWT_CONFIG = {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRE || '7d',
    algorithm: 'HS256',
    issuer: 'nutriplan-ai',
    audience: 'nutriplan-users'
};

// Password Configuration
export const PASSWORD_CONFIG = {
    saltRounds: 12,
    minLength: 8,
    maxLength: 100,
    patterns: {
        uppercase: /[A-Z]/,
        lowercase: /[a-z]/,
        numbers: /[0-9]/,
        special: /[!@#$%^&*]/
    }
};

// Token Configuration
export const TOKEN_CONFIG = {
    resetTokenExpiry: 3600000, // 1 hour in milliseconds
    verificationTokenExpiry: 86400000, // 24 hours
    refreshTokenExpiry: '30d'
};

/**
 * Generate JWT Token
 * @param {string} userId - User ID
 * @param {string} role - User role
 * @returns {string} JWT token
 */
export const generateToken = (userId, role = 'user') => {
    try {
        const payload = {
            id: userId,
            role,
            iss: JWT_CONFIG.issuer,
            aud: JWT_CONFIG.audience,
            iat: Math.floor(Date.now() / 1000)
        };

        const token = jwt.sign(payload, JWT_CONFIG.secret, {
            expiresIn: JWT_CONFIG.expiresIn,
            algorithm: JWT_CONFIG.algorithm
        });

        return token;
    } catch (error) {
        logger.error('Token generation error:', error);
        throw new Error('Failed to generate token');
    }
};

/**
 * Verify JWT Token
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
export const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_CONFIG.secret, {
            algorithms: [JWT_CONFIG.algorithm],
            issuer: JWT_CONFIG.issuer,
            audience: JWT_CONFIG.audience
        });
        return decoded;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token expired');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid token');
        } else {
            throw new Error('Token verification failed');
        }
    }
};

/**
 * Hash Password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export const hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(PASSWORD_CONFIG.saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    } catch (error) {
        logger.error('Password hashing error:', error);
        throw new Error('Failed to hash password');
    }
};

/**
 * Compare Password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password
 * @returns {Promise<boolean>} True if match
 */
export const comparePassword = async (password, hashedPassword) => {
    try {
        const isMatch = await bcrypt.compare(password, hashedPassword);
        return isMatch;
    } catch (error) {
        logger.error('Password comparison error:', error);
        throw new Error('Failed to compare passwords');
    }
};

/**
 * Validate Password Strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 */
export const validatePassword = (password) => {
    const errors = [];

    if (!password || password.length < PASSWORD_CONFIG.minLength) {
        errors.push(`Password must be at least ${PASSWORD_CONFIG.minLength} characters`);
    }

    if (password && password.length > PASSWORD_CONFIG.maxLength) {
        errors.push(`Password cannot exceed ${PASSWORD_CONFIG.maxLength} characters`);
    }

    if (!PASSWORD_CONFIG.patterns.uppercase.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (!PASSWORD_CONFIG.patterns.lowercase.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!PASSWORD_CONFIG.patterns.numbers.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (!PASSWORD_CONFIG.patterns.special.test(password)) {
        errors.push('Password must contain at least one special character (!@#$%^&*)');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Generate Reset Token
 * @returns {Object} Reset token and hash
 */
export const generateResetToken = () => {
    try {
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        
        const resetTokenExpires = Date.now() + TOKEN_CONFIG.resetTokenExpiry;

        return {
            resetToken,
            resetTokenHash,
            resetTokenExpires
        };
    } catch (error) {
        logger.error('Reset token generation error:', error);
        throw new Error('Failed to generate reset token');
    }
};

/**
 * Generate Verification Token
 * @returns {Object} Verification token and hash
 */
export const generateVerificationToken = () => {
    try {
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenHash = crypto
            .createHash('sha256')
            .update(verificationToken)
            .digest('hex');
        
        const verificationTokenExpires = Date.now() + TOKEN_CONFIG.verificationTokenExpiry;

        return {
            verificationToken,
            verificationTokenHash,
            verificationTokenExpires
        };
    } catch (error) {
        logger.error('Verification token generation error:', error);
        throw new Error('Failed to generate verification token');
    }
};

/**
 * Verify Reset Token
 * @param {string} token - Reset token
 * @param {string} hashedToken - Stored hash
 * @returns {boolean} True if valid
 */
export const verifyResetToken = (token, hashedToken) => {
    try {
        const tokenHash = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');
        
        return tokenHash === hashedToken;
    } catch (error) {
        logger.error('Reset token verification error:', error);
        return false;
    }
};

/**
 * Sanitize User Object (remove sensitive data)
 * @param {Object} user - User object
 * @returns {Object} Sanitized user
 */
export const sanitizeUser = (user) => {
    const sanitized = user.toObject ? user.toObject() : { ...user };
    
    // Remove sensitive fields
    delete sanitized.password;
    delete sanitized.passwordResetToken;
    delete sanitized.passwordResetExpires;
    delete sanitized.verificationToken;
    delete sanitized.verificationTokenExpires;
    delete sanitized.__v;
    
    return sanitized;
};

/**
 * Create Refresh Token
 * @param {string} userId - User ID
 * @returns {string} Refresh token
 */
export const generateRefreshToken = (userId) => {
    try {
        const payload = {
            id: userId,
            type: 'refresh',
            iat: Math.floor(Date.now() / 1000)
        };

        const token = jwt.sign(payload, JWT_CONFIG.secret, {
            expiresIn: TOKEN_CONFIG.refreshTokenExpiry,
            algorithm: JWT_CONFIG.algorithm
        });

        return token;
    } catch (error) {
        logger.error('Refresh token generation error:', error);
        throw new Error('Failed to generate refresh token');
    }
};

/**
 * Extract Token from Header
 * @param {Object} req - Express request object
 * @returns {string|null} Extracted token
 */
export const extractTokenFromHeader = (req) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }

        const token = authHeader.split(' ')[1];
        return token;
    } catch (error) {
        logger.error('Token extraction error:', error);
        return null;
    }
};

/**
 * Set Cookie with Token
 * @param {Object} res - Express response object
 * @param {string} token - JWT token
 */
export const setTokenCookie = (res, token) => {
    try {
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/'
        };

        res.cookie('token', token, cookieOptions);
    } catch (error) {
        logger.error('Cookie setting error:', error);
    }
};

/**
 * Clear Token Cookie
 * @param {Object} res - Express response object
 */
export const clearTokenCookie = (res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        });
    } catch (error) {
        logger.error('Cookie clearing error:', error);
    }
};

/**
 * Rate Limiting Configuration
 */
export const RATE_LIMIT_CONFIG = {
    auth: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // 5 requests per window
        message: 'Too many authentication attempts. Please try again later.'
    },
    api: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // 100 requests per window
        message: 'Too many requests. Please try again later.'
    },
    diet: {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 10, // 10 diet generations per hour
        message: 'You have reached the maximum number of diet generations per hour.'
    }
};

/**
 * CORS Configuration
 */
export const CORS_CONFIG = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

/**
 * Security Headers Configuration
 */
export const SECURITY_HEADERS = {
    helmet: {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
                fontSrc: ["'self'", 'https://fonts.gstatic.com'],
                scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                imgSrc: ["'self'", 'data:', 'https:'],
                connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:5173']
            }
        },
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: "cross-origin" }
    }
};

export default {
    generateToken,
    verifyToken,
    hashPassword,
    comparePassword,
    validatePassword,
    generateResetToken,
    generateVerificationToken,
    verifyResetToken,
    sanitizeUser,
    generateRefreshToken,
    extractTokenFromHeader,
    setTokenCookie,
    clearTokenCookie,
    JWT_CONFIG,
    PASSWORD_CONFIG,
    TOKEN_CONFIG,
    RATE_LIMIT_CONFIG,
    CORS_CONFIG,
    SECURITY_HEADERS
};