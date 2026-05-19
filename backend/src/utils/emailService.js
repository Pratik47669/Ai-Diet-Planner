import nodemailer from 'nodemailer';
import { logger } from './logger.js';

/**
 * Email Service for NutriPlan AI
 * Handles all email communications including reminders and notifications
 */

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

/**
 * Send email
 * @param {Object} options - Email options
 */
export const sendEmail = async (options) => {
    try {
        const transporter = createTransporter();
        const mailOptions = {
            from: `"NutriPlan AI" <${process.env.EMAIL_USER}>`,
            to: options.to,
            subject: options.subject,
            html: options.html
        };
        
        const info = await transporter.sendMail(mailOptions);
        logger.info(`Email sent: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        logger.error('Email sending failed:', error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
};

/**
 * Send welcome email to new user
 * @param {Object} user - User object
 */
export const sendWelcomeEmail = async (user) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Inter', sans-serif; background: #f9fafb; }
                .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 24px; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
                .header { text-align: center; margin-bottom: 24px; }
                .logo { font-size: 32px; font-weight: bold; color: #22c55e; }
                .title { font-size: 24px; font-weight: bold; margin: 16px 0; color: #1f2937; }
                .content { color: #4b5563; line-height: 1.6; }
                .button { display: inline-block; background: #22c55e; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0; }
                .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🥗 NutriPlan AI</div>
                </div>
                <h1 class="title">Welcome to NutriPlan AI! 🎉</h1>
                <div class="content">
                    <p>Hi ${user.name},</p>
                    <p>Thank you for joining NutriPlan AI! We're excited to help you on your health journey.</p>
                    
                    <h3>What you can do next:</h3>
                    <ul>
                        <li>Complete your health profile for personalized diet plans</li>
                        <li>Generate your first AI-powered diet plan</li>
                        <li>Track your BMI and calorie intake</li>
                        <li>Download plans as PDF</li>
                    </ul>
                    
                    <a href="${process.env.FRONTEND_URL}/profile" class="button">Complete Your Profile</a>
                    
                    <p>If you have any questions, just reply to this email - we're here to help!</p>
                </div>
                <div class="footer">
                    <p>© ${new Date().getFullYear()} NutriPlan AI. All rights reserved.</p>
                    <p>You're receiving this because you signed up for NutriPlan AI.</p>
                </div>
            </div>
        </body>
        </html>
    `;
    
    return sendEmail({
        to: user.email,
        subject: 'Welcome to NutriPlan AI! 🥗',
        html
    });
};

/**
 * Send daily meal reminder
 * @param {Object} user - User object
 * @param {Object} plan - Current diet plan
 */
export const sendMealReminder = async (user, plan) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayPlan = plan?.days?.find(d => d.day === today);
    
    if (!todayPlan) return;
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Inter', sans-serif; background: #f9fafb; }
                .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 24px; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
                .header { text-align: center; margin-bottom: 24px; }
                .logo { font-size: 24px; font-weight: bold; color: #22c55e; }
                .title { font-size: 20px; font-weight: bold; margin: 16px 0; color: #1f2937; }
                .meal { background: #f3f4f6; border-radius: 12px; padding: 16px; margin: 12px 0; }
                .meal-time { font-weight: bold; color: #22c55e; margin-bottom: 8px; }
                .meal-name { font-size: 18px; font-weight: 600; color: #1f2937; }
                .meal-cal { color: #6b7280; font-size: 14px; }
                .total { background: #22c55e; color: white; padding: 16px; border-radius: 12px; text-align: center; font-weight: bold; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🥗 NutriPlan AI</div>
                </div>
                <h1 class="title">Your Meal Plan for ${today}</h1>
                
                <div class="meal">
                    <div class="meal-time">🌅 Breakfast</div>
                    <div class="meal-name">${todayPlan.breakfast.name}</div>
                    <div class="meal-cal">${todayPlan.breakfast.calories} kcal</div>
                </div>
                
                <div class="meal">
                    <div class="meal-time">☀️ Lunch</div>
                    <div class="meal-name">${todayPlan.lunch.name}</div>
                    <div class="meal-cal">${todayPlan.lunch.calories} kcal</div>
                </div>
                
                <div class="meal">
                    <div class="meal-time">🌙 Dinner</div>
                    <div class="meal-name">${todayPlan.dinner.name}</div>
                    <div class="meal-cal">${todayPlan.dinner.calories} kcal</div>
                </div>
                
                <div class="meal">
                    <div class="meal-time">🍎 Snacks</div>
                    <div class="meal-name">${todayPlan.snacks.name}</div>
                    <div class="meal-cal">${todayPlan.snacks.calories} kcal</div>
                </div>
                
                <div class="total">
                    Total Calories: ${todayPlan.totalCalories} kcal
                </div>
                
                <p style="text-align: center; color: #6b7280; margin-top: 24px;">
                    Stay hydrated! Drink 8-10 glasses of water today 💧
                </p>
            </div>
        </body>
        </html>
    `;
    
    return sendEmail({
        to: user.email,
        subject: `🍽️ Your Meal Plan for ${today}`,
        html
    });
};

/**
 * Send water reminder
 * @param {Object} user - User object
 */
export const sendWaterReminder = async (user) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Inter', sans-serif; background: #f9fafb; }
                .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 24px; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
                .water-icon { font-size: 48px; text-align: center; }
                .title { font-size: 24px; font-weight: bold; text-align: center; color: #1f2937; margin: 16px 0; }
                .message { color: #4b5563; line-height: 1.6; text-align: center; }
                .button { display: inline-block; background: #22c55e; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0; }
                .tracker { background: #e0f2fe; border-radius: 12px; padding: 16px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="water-icon">💧</div>
                <h1 class="title">Time to Hydrate!</h1>
                <div class="message">
                    <p>Hi ${user.name},</p>
                    <p>Don't forget to drink water regularly. Staying hydrated is essential for your health and metabolism.</p>
                </div>
                
                <div class="tracker">
                    <h3 style="margin:0 0 12px 0; color: #0369a1;">Today's Water Goal: 8 Glasses</h3>
                    <div style="display: flex; gap: 8px; justify-content: center;">
                        ${[1,2,3,4,5,6,7,8].map(i => 
                            `<div style="width: 30px; height: 30px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; color: #64748b;">${i}</div>`
                        ).join('')}
                    </div>
                </div>
                
                <p style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Track Water Intake</a>
                </p>
                
                <p style="text-align: center; color: #64748b; font-size: 14px;">
                    Benefits of staying hydrated:<br/>
                    ✓ Boosts metabolism<br/>
                    ✓ Improves skin health<br/>
                    ✓ Helps in weight loss<br/>
                    ✓ Increases energy
                </p>
            </div>
        </body>
        </html>
    `;
    
    return sendEmail({
        to: user.email,
        subject: '💧 Water Reminder - Stay Hydrated!',
        html
    });
};

/**
 * Send weekly progress report
 * @param {Object} user - User object
 * @param {Object} analytics - Analytics data
 */
export const sendWeeklyReport = async (user, analytics) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Inter', sans-serif; background: #f9fafb; }
                .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 24px; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
                .header { text-align: center; margin-bottom: 24px; }
                .logo { font-size: 28px; font-weight: bold; color: #22c55e; }
                .title { font-size: 20px; font-weight: bold; margin: 16px 0; color: #1f2937; }
                .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 24px 0; }
                .stat-card { background: #f3f4f6; border-radius: 12px; padding: 16px; text-align: center; }
                .stat-value { font-size: 24px; font-weight: bold; color: #22c55e; }
                .stat-label { color: #6b7280; font-size: 12px; margin-top: 4px; }
                .progress { background: #22c55e20; border-radius: 999px; height: 8px; width: 100%; margin: 12px 0; }
                .progress-fill { background: #22c55e; height: 8px; border-radius: 999px; width: ${analytics.progress}%; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">📊 NutriPlan AI</div>
                </div>
                <h1 class="title">Your Weekly Progress Report</h1>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${analytics.plansGenerated}</div>
                        <div class="stat-label">Plans Generated</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${analytics.currentBMI}</div>
                        <div class="stat-label">Current BMI</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${analytics.weightChange} kg</div>
                        <div class="stat-label">Weight Change</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${analytics.streak} days</div>
                        <div class="stat-label">Current Streak</div>
                    </div>
                </div>
                
                <h3>Goal Progress</h3>
                <div class="progress">
                    <div class="progress-fill" style="width: ${analytics.progress}%"></div>
                </div>
                <p style="text-align: right; margin-top: 4px; color: #6b7280;">${analytics.progress}% to your goal</p>
                
                <div style="margin: 24px 0;">
                    <h3>💪 Weekly Achievements</h3>
                    <ul style="color: #4b5563;">
                        ${analytics.achievements.map(a => `<li>✓ ${a}</li>`).join('')}
                    </ul>
                </div>
                
                <p style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL}/analytics" class="button">View Detailed Analytics</a>
                </p>
            </div>
        </body>
        </html>
    `;
    
    return sendEmail({
        to: user.email,
        subject: '📊 Your Weekly Progress Report - NutriPlan AI',
        html
    });
};

/**
 * Send password reset email
 * @param {Object} user - User object
 * @param {string} resetToken - Password reset token
 */
export const sendPasswordResetEmail = async (user, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Inter', sans-serif; background: #f9fafb; }
                .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 24px; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
                .title { font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 16px; }
                .button { display: inline-block; background: #22c55e; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0; }
                .warning { background: #fee2e2; color: #991b1b; padding: 12px; border-radius: 8px; margin: 20px 0; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1 class="title">Reset Your Password</h1>
                <p>Hi ${user.name},</p>
                <p>We received a request to reset your password. Click the button below to create a new password:</p>
                
                <a href="${resetUrl}" class="button">Reset Password</a>
                
                <div class="warning">
                    ⚠️ This link will expire in 1 hour. If you didn't request this, please ignore this email.
                </div>
                
                <p>If the button doesn't work, copy this link:</p>
                <p style="color: #22c55e; word-break: break-all;">${resetUrl}</p>
            </div>
        </body>
        </html>
    `;
    
    return sendEmail({
        to: user.email,
        subject: 'Reset Your Password - NutriPlan AI',
        html
    });
};