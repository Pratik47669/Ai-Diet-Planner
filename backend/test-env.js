import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🔍========== ENVIRONMENT TEST ==========');
console.log('Current directory:', process.cwd());
console.log('__dirname:', __dirname);

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
console.log('.env path:', envPath);
console.log('.env exists:', fs.existsSync(envPath));

// Load .env
dotenv.config();

console.log('\n📦 After dotenv.config():');
console.log('GEMINI_API_KEY from process.env:', process.env.GEMINI_API_KEY ? '✅ Present' : '❌ Missing');
console.log('GEMINI_API_KEY length:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);

// Test Gemini API with multiple models
async function testGemini() {
    console.log('\n🤖 Testing Gemini API with multiple models...');
    
    if (!process.env.GEMINI_API_KEY) {
        console.log('❌ Cannot test: GEMINI_API_KEY not loaded');
        return;
    }
    
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        console.log('✅ Gemini client created');
        
        const modelNames = [
            'gemini-2.5-flash-lite',  
            'gemini-2.0-flash',       
            'gemini-2.5-pro'          
        ];
        
        for (const modelName of modelNames) {
            try {
                console.log(`\n📌 Testing model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                
                const result = await model.generateContent('Reply with ONLY: "OK"');
                const response = await result.response;
                console.log(`✅ Model ${modelName} working! Response:`, response.text());
                return; // Exit on first success
            } catch (e) {
                console.log(`❌ Model ${modelName} failed:`, e.message);
            }
        }
        
        console.log('\n⚠️ All standard models failed. Trying OpenAI-compatible endpoint...');
        await testOpenAICompatible();
        
    } catch (error) {
        console.error('❌ Gemini API Error:', error.message);
        await testOpenAICompatible();
    }
}

// SOLUTION 2: OpenAI-compatible endpoint test
async function testOpenAICompatible() {
    console.log('\n🤖 Testing OpenAI-compatible endpoint...');
    
    try {
        const modelNames = [
            'gemini-2.5-flash-lite',
            'gemini-2.0-flash',
            'gemini-2.5-pro',
            'gemini-1.5-flash',
            'gemini-1.5-pro'
        ];
        
        for (const modelName of modelNames) {
            try {
                console.log(`\n📌 Testing OpenAI endpoint with model: ${modelName}`);
                
                const response = await fetch(
                    'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            model: modelName,
                            messages: [{ role: 'user', content: 'Reply with ONLY: "OK"' }],
                            max_tokens: 10
                        })
                    }
                );
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.log(`❌ HTTP ${response.status}:`, errorText.substring(0, 100));
                    continue;
                }
                
                const data = await response.json();
                console.log(`✅ OpenAI-compatible endpoint working with ${modelName}!`);
                console.log('Response:', data.choices[0].message.content);
                return; // Exit on first success
                
            } catch (e) {
                console.log(`❌ OpenAI endpoint with ${modelName} failed:`, e.message);
            }
        }
        
        console.log('\n⚠️ All OpenAI endpoints failed. Your API key may not have access.');
        console.log('\n💡 Solutions:');
        console.log('1. Wait 5-10 minutes and try again (Google provisioning delay)');
        console.log('2. Create a NEW Google Cloud project (different from before)');
        console.log('3. Use Mock AI as fallback (already implemented)');
        
    } catch (error) {
        console.error('❌ OpenAI-compatible endpoint error:', error.message);
    }
}

await testGemini();
console.log('🔍========================================\n');