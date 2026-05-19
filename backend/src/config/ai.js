import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

// Debug log
console.log('🔍 Loading AI configuration...');
console.log('GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);

// Initialize AI clients
let openai = null;
let gemini = null;
let currentWorkingModel = 'gemini-1.5-flash'; // default

// Check if API keys exist and are valid
try {
    if (process.env.OPENAI_API_KEY && 
        process.env.OPENAI_API_KEY !== 'dummy-key' && 
        process.env.OPENAI_API_KEY !== 'your-openai-key' &&
        process.env.OPENAI_API_KEY.length > 10) {
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        logger.info('✅ OpenAI initialized');
    }
} catch (error) {
    logger.warn('OpenAI initialization failed:', error.message);
}

try {
    if (process.env.GEMINI_API_KEY && 
        process.env.GEMINI_API_KEY !== 'dummy-key' && 
        process.env.GEMINI_API_KEY !== 'your-gemini-key' &&
        process.env.GEMINI_API_KEY.length > 10) {
        
        console.log('🔑 Initializing Gemini with key length:', process.env.GEMINI_API_KEY.length);
        gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        logger.info('✅ Gemini initialized');
        
        // Test the API with a simple call using correct model
        try {
            // Try different model names including the newest 2.x and stable aliases
            const modelNames = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'];
            let workingModel = null;
            
            for (const modelName of modelNames) {
                try {
                    const model = gemini.getGenerativeModel({ model: modelName });
                    const result = await model.generateContent('Say "OK"');
                    await result.response;
                    workingModel = modelName;
                    console.log(`✅ Gemini model working: ${modelName}`);
                    break;
                } catch (e) {
                    console.log(`⚠️ Model ${modelName} failed`);
                }
            }
            
            if (workingModel) {
                currentWorkingModel = workingModel;
                console.log(`✅ Using Gemini model: ${workingModel}`);
            } else {
                console.log('⚠️ No Gemini model working, will use fallback');
            }
        } catch (modelError) {
            console.log('ℹ️ Local AI fallback active (Gemini key restricted).');
        }
    } else {
        console.log('⚠️ Gemini API key not valid or missing');
    }
} catch (error) {
    logger.info('Gemini initialization skipped (offline mode).');
}

// Determine AI provider
export const AI_PROVIDER = (gemini !== null) ? 'gemini' : 
                           (openai !== null) ? 'openai' : 
                           'none';

console.log('🤖 Final AI Provider:', AI_PROVIDER);
logger.info(`🤖 AI Provider: ${AI_PROVIDER}`);

export const getAIClient = () => {
    if (AI_PROVIDER === 'openai' && openai) {
        return openai;
    } else if (AI_PROVIDER === 'gemini' && gemini) {
        return gemini;
    } else {
        logger.warn('No AI provider available, using fallback');
        return null;
    }
};

export { openai, gemini, currentWorkingModel };