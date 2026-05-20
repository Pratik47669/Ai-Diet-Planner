import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';
import { sendEmail } from '../utils/email.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    // Generate Random 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes from now
    
    // Create user
    const user = await User.create({
      email,
      password,
      name,
      isEmailVerified: false,
      otpCode,
      otpExpires
    });
    
    // Try sending OTP Email
    try {
      await sendEmail({
        email: user.email,
        subject: 'NutriPlan AI - Verify Your Email',
        message: `Your Email verification code is: ${otpCode}. It expires in 10 minutes.`,
        html: `<h2>Welcome to NutriPlan AI!</h2><p>Your email verification code is:</p><h1 style="color: #4F46E5; letter-spacing: 5px;">${otpCode}</h1><p>It expires in 10 minutes.</p>`
      });
    } catch (err) {
      logger.error('Failed to send OTP email. Please configure SMTP_EMAIL and SMTP_PASSWORD in .env');
      // We still register them. For development without email, print the OTP:
      if (process.env.NODE_ENV !== 'production') {
        logger.info(`🧪 DEVELOPMENT MODE: OTP for ${user.email} is -> [ ${otpCode} ] <-`);
      }
    }
    
    // Do NOT generate a login token yet until they verify!
    res.status(201).json({
      success: true,
      message: 'Registration successful. An OTP has been sent to your email to verify your account.',
      requiresVerification: true,
      userId: user._id
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("📩 Email:", email);
    console.log("🔑 Password:", password);

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');

    console.log("👤 User Found:", user);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log("🧠 Stored Hash:", user.password);

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated'
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        message: 'Email not verified. Please check your inbox for the OTP.'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    console.log("✅ Password Match:", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    logger.error('Login error:', error);

    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: process.env.NODE_ENV === 'development'
        ? error.message
        : undefined
    });
  }
};

// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
    
//     // Check if user exists
//     const user = await User.findOne({ email }).select('+password');
//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid credentials'
//       });
//     }
    
//     // Check if account is active
//     if (!user.isActive) {
//       return res.status(401).json({
//         success: false,
//         message: 'Account has been deactivated'
//       });
//     }
    
//     // Check if email is verified
//     if (!user.isEmailVerified) {
//       return res.status(401).json({
//         success: false,
//         message: 'Email not verified. Please check your inbox for the OTP.'
//       });
//     }
    
//     // Check password
//     const isPasswordValid = await user.comparePassword(password);
//     if (!isPasswordValid) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid credentials'
//       });
//     }
    
//     // Generate token
//     const token = generateToken(user._id);
    
//     // Update last login
//     user.lastLogin = Date.now();
//     await user.save();
    
//     res.json({
//       success: true,
//       token,
//       user: {
//         id: user._id,
//         email: user.email,
//         role: user.role
//       }
//     });
//   } catch (error) {
//     logger.error('Login error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error logging in',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }  
// };

export const logout = async (req, res) => {
  try {
    // In JWT-based auth, logout is handled client-side by removing token
    // But we can still blacklist tokens in production
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging out'
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    
    const user = await User.findById(userId).select('+otpCode +otpExpires');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified' });
    }
    
    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }
    
    if (user.otpCode !== otp.toString()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    
    user.isEmailVerified = true;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    
    const token = generateToken(user._id);
    user.lastLogin = Date.now();
    await user.save();
    
    res.json({
      success: true,
      message: 'Email verified successfully!',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    logger.error('OTP Verification Error: ', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP'
    });
  }
};