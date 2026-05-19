import { openai, gemini, AI_PROVIDER, getAIClient } from '../config/ai.js';
import { logger } from '../utils/logger.js';

// Generate prompt for AI
const generatePrompt = (userData) => {
  const goalDisplay = {
    fatLoss: 'Fat Loss',
    muscleGain: 'Muscle Gain',
    maintenance: 'Weight Maintenance'
  }[userData.goal];
  
  const foodTypeDisplay = {
    veg: 'Vegetarian',
    nonVeg: 'Non-Vegetarian',
    vegan: 'Vegan',
    eggetarian: 'Eggetarian'
  }[userData.foodType];
  
  const activityDisplay = {
    sedentary: 'Sedentary (little or no exercise)',
    light: 'Light (1-3 days/week)',
    moderate: 'Moderate (3-5 days/week)',
    active: 'Active (6-7 days/week)',
    veryActive: 'Very Active (hard daily exercise)'
  }[userData.activityLevel];
  
  return `Generate a detailed 7-day Indian diet plan in JSON format for a user with the following details:

USER DETAILS:
- Name: ${userData.name}
- Age: ${userData.age}
- Gender: ${userData.gender}
- Height: ${userData.height} cm
- Weight: ${userData.weight} kg
- BMI: ${userData.bmi} (${userData.bmiCategory})
- Goal: ${goalDisplay}
- Food Type: ${foodTypeDisplay}
- Activity Level: ${activityDisplay}
- Medical Conditions: ${userData.medicalConditions || 'None'}
- Daily Calorie Target: ${userData.dailyCalorieTarget} calories

REQUIREMENTS:
1. Create a UNIQUE 7-day diet plan with each day having different meals
2. Each day must include: Breakfast, Lunch, Dinner, and Snacks
3. Provide approximate calories for each meal
4. Ensure total daily calories are close to the target (${userData.dailyCalorieTarget} ± 100)
5. Include Indian cuisine options suitable for ${foodTypeDisplay} diet
6. Add 5 health tips at the end
7. Make each meal description descriptive (include ingredients briefly)
8. IMPORTANT: Make sure each day's meals are DIFFERENT from other days

OUTPUT FORMAT (VALID JSON ONLY):
{
  "days": [
    {
      "day": "Monday",
      "breakfast": { "name": "Breakfast item name", "calories": 300, "description": "Brief description" },
      "lunch": { "name": "Lunch item name", "calories": 450, "description": "Brief description" },
      "dinner": { "name": "Dinner item name", "calories": 400, "description": "Brief description" },
      "snacks": { "name": "Snacks item name", "calories": 150, "description": "Brief description" },
      "totalCalories": 1300
    },
    ... (similar for Tuesday to Sunday)
  ],
  "healthTips": ["Tip 1", "Tip 2", "Tip 3", "Tip 4", "Tip 5"]
}

Make sure the JSON is valid and parsable. Each day should be unique with different meal combinations.`;
};

// AI Generation using OpenAI
const generateWithOpenAI = async (prompt) => {
  try {
    if (!openai) throw new Error('OpenAI not initialized');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert nutritionist and diet planner specializing in Indian cuisine. Generate personalized diet plans in valid JSON format only. No additional text or explanation outside the JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 3000
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    logger.error('OpenAI generation error:', error);
    throw error;
  }
};

// AI Generation using Gemini
const generateWithGemini = async (prompt) => {
  try {
    if (!gemini) throw new Error('Gemini not initialized');
    
    // Try different model names (fastest and newer versions first)
    const modelNames = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'];
    let lastError = null;
    
    for (const modelName of modelNames) {
      try {
        console.log(`Attempting Gemini model: ${modelName}`);
        const model = gemini.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
          }
        });
        
        const result = await model.generateContent(prompt);
        
        const response = await result.response;
        console.log(`✅ Success with model: ${modelName}`);
        return response.text();
      } catch (e) {
        console.log(`❌ Model ${modelName} failed:`, e.message);
        lastError = e;
        // Continue to next model
      }
    }
    
    // If all models fail
    throw lastError || new Error('All Gemini models failed');
    
  } catch (error) {
    logger.error('Gemini generation error:', error);
    throw error;
  }
};

// Main AI generation function
export const generateDietWithAI = async (userData) => {
  const prompt = generatePrompt(userData);
  let aiResponse;
  
  try {
    logger.info(`Generating diet plan with ${AI_PROVIDER}...`);
    
    if (AI_PROVIDER === 'none') {
      throw new Error('No AI provider available');
    }
    
    if (AI_PROVIDER === 'openai') {
      aiResponse = await generateWithOpenAI(prompt);
    } else if (AI_PROVIDER === 'gemini') {
      aiResponse = await generateWithGemini(prompt);
    } else {
      throw new Error(`Unknown AI provider: ${AI_PROVIDER}`);
    }
    
    // Clean the response - strip markdown code fences
    let cleanedResponse = aiResponse
      .replace(/```json\n?/g, '')
      .replace(/```/g, '')
      .trim();

    // Extract first complete JSON object from the response
    const jsonStart = cleanedResponse.indexOf('{');
    if (jsonStart !== -1) {
      cleanedResponse = cleanedResponse.substring(jsonStart);
      const jsonEnd = cleanedResponse.lastIndexOf('}');
      if (jsonEnd !== -1) {
        cleanedResponse = cleanedResponse.substring(0, jsonEnd + 1);
      }
    }

    // Parse JSON with fallback repair for truncated responses
    let parsedPlan;
    try {
      parsedPlan = JSON.parse(cleanedResponse);
    } catch (parseError) {
      logger.warn('JSON parse failed, attempting repair...');
      // Try to repair truncated JSON by finding last complete object
      const lastCompleteObj = cleanedResponse.lastIndexOf('},');
      if (lastCompleteObj > 100) {
        const repaired = cleanedResponse.substring(0, lastCompleteObj + 1) + ']}';
        parsedPlan = JSON.parse(repaired);
      } else {
        throw parseError;
      }
    }
    
    logger.info('✅ AI diet plan generated successfully');
    
    return {
      plan: parsedPlan,
      prompt,
      response: aiResponse
    };
  } catch (error) {
    logger.error('AI generation failed:', error);
    throw new Error('Failed to generate valid diet plan from AI');
  }
};

// Fallback rule-based generation
export const generateFallbackDiet = (userData) => {
  logger.info('Using fallback diet generation (AI failed)');
  
  const breakfastOptions = {
    veg: [
      { name: 'Oats with Fruits and Nuts', calories: 300 },
      { name: 'Vegetable Poha with Sprouts', calories: 280 },
      { name: 'Moong Dal Chilla with Mint Chutney', calories: 260 },
      { name: 'Idli (3) with Sambar', calories: 320 }
    ],
    nonVeg: [
      { name: 'Egg White Omelette with Toast', calories: 350 },
      { name: 'Chicken Sandwich', calories: 380 },
      { name: 'Boiled Eggs (2) with Fruits', calories: 300 }
    ]
  };
  
  const lunchOptions = {
    veg: [
      { name: 'Dal, Rice, Roti, and Mix Veg Sabzi', calories: 500 },
      { name: 'Chole with Rice and Salad', calories: 520 },
      { name: 'Paneer Curry with Roti', calories: 480 },
      { name: 'Rajma Rice with Curd', calories: 510 }
    ],
    nonVeg: [
      { name: 'Grilled Chicken with Rice and Vegetables', calories: 550 },
      { name: 'Fish Curry with Rice', calories: 500 },
      { name: 'Chicken Biryani with Raita', calories: 580 }
    ]
  };
  
  const dinnerOptions = {
    veg: [
      { name: 'Vegetable Khichdi with Papad', calories: 400 },
      { name: 'Palak Paneer with Roti', calories: 450 },
      { name: 'Mix Veg Soup with Salad', calories: 350 }
    ],
    nonVeg: [
      { name: 'Tandoori Chicken with Salad', calories: 400 },
      { name: 'Egg Curry with Roti', calories: 420 },
      { name: 'Chicken Soup with Toast', calories: 350 }
    ]
  };
  
  const snacksOptions = {
    veg: [
      { name: 'Fruit Bowl', calories: 120 },
      { name: 'Roasted Makhana', calories: 100 },
      { name: 'Green Tea with Almonds', calories: 80 }
    ],
    nonVeg: [
      { name: 'Boiled Egg', calories: 70 },
      { name: 'Chicken Tikka (small)', calories: 150 },
      { name: 'Protein Shake', calories: 120 }
    ]
  };
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const foodType = userData.foodType === 'veg' ? 'veg' : 'nonVeg';
  const isFatLoss = userData.goal === 'fatLoss';
  
  // Helper to get a random item from an array
  const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
  
  const daysPlan = days.map((day, index) => {
    // Randomize the meals for every single day to mimic AI uniqueness
    const breakfast = getRandomItem(breakfastOptions[foodType]);
    const lunch = getRandomItem(lunchOptions[foodType]);
    const dinner = getRandomItem(dinnerOptions[foodType]);
    const snacks = getRandomItem(snacksOptions[foodType]);
    
    // Dynamically calculate calories to strictly meet user's dailyCalorieTarget
    const targetCal = userData.dailyCalorieTarget || 2000;
    
    // Distribute according to typical balance (Breakfast 25%, Lunch 35%, Dinner 25%, Snacks 15%)
    const breakfastCal = Math.round(targetCal * 0.25);
    const lunchCal = Math.round(targetCal * 0.35);
    const dinnerCal = Math.round(targetCal * 0.25);
    const snacksCal = targetCal - breakfastCal - lunchCal - dinnerCal; // ensures sum exactly matches targetCal
    
    const totalCalories = breakfastCal + lunchCal + dinnerCal + snacksCal;
    
    return {
      day,
      breakfast: { 
        name: breakfast.name, 
        calories: breakfastCal, 
        description: `Delicious ${breakfast.name} prepared with fresh ingredients.` 
      },
      lunch: { 
        name: lunch.name, 
        calories: lunchCal, 
        description: `Wholesome ${lunch.name} perfect for midday nutrition.` 
      },
      dinner: { 
        name: dinner.name, 
        calories: dinnerCal, 
        description: `Light yet satisfying ${dinner.name} for dinner.` 
      },
      snacks: { 
        name: snacks.name, 
        calories: snacksCal, 
        description: `Healthy ${snacks.name} to curb hunger.` 
      },
      totalCalories
    };
  });
  
  const healthTips = [
    'Drink at least 8-10 glasses of water daily',
    'Eat slowly and mindfully to avoid overeating',
    'Include protein in every meal for satiety',
    'Get 7-8 hours of sleep for better metabolism',
    'Stay active with at least 30 minutes of exercise daily'
  ];
  
  return {
    days: daysPlan,
    healthTips,
    isFallback: true
  };
};