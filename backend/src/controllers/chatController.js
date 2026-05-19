import { getAIClient, AI_PROVIDER, currentWorkingModel } from '../config/ai.js';
import { logger } from '../utils/logger.js';

export const handleChat = async (req, res) => {
  const { message, chatHistory, fileData } = req.body;
  
  if (!message && !fileData) {
    return res.status(400).json({ success: false, message: 'Message or file is required' });
  }

  try {
    if (AI_PROVIDER !== 'gemini' || !currentWorkingModel) {
      throw new Error('Real AI Provider not ready. Using Fallback.');
    }

    const geminiClient = getAIClient();
    if (!geminiClient) throw new Error('Gemini client not found');

    const model = geminiClient.getGenerativeModel({ model: currentWorkingModel });
    
    const systemPrompt = "You are Naviya, NutriPlan AI's friendly diet and nutrition assistant. Help users with their diet plans, health, fitness, calories, macros, and food types. If the user shares a PDF or image of their diet plan, carefully read and analyze its content and give specific, practical advice. Always respond warmly, concisely, and with medically-safe advice. Do not provide diagnostic medical answers.";
    
    console.log(`📡 Sending request to Gemini (${currentWorkingModel})${fileData ? ' [with file]' : ''}...`);

    let result;
    if (fileData && fileData.base64 && fileData.mimeType) {
      // For file/vision requests, try models with stable multimodal support
      const visionModels = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro', currentWorkingModel];
      let visionError = null;

      for (const modelName of visionModels) {
        try {
          console.log(`🖼️ Trying vision model: ${modelName}`);
          const visionModel = geminiClient.getGenerativeModel({ model: modelName });
          result = await visionModel.generateContent({
            contents: [{
              role: 'user',
              parts: [
                { text: `${systemPrompt}\n\nUser Question: ${message || 'Please analyze this file and give me useful advice.'}` },
                { inlineData: { mimeType: fileData.mimeType, data: fileData.base64 } }
              ]
            }]
          });
          console.log(`✅ Vision model ${modelName} worked!`);
          break;
        } catch (e) {
          visionError = e;
          console.log(`⚠️ Vision model ${modelName} failed: ${e.message}`);
        }
      }
      if (!result) throw visionError;
    } else {
      // Text-only request
      result = await model.generateContent(`${systemPrompt}\n\nUser Question: ${message}`);
    }
    const aiResponse = await result.response;
    
    console.log('✅ Gemini Response received.');
    
    return res.json({
      success: true,
      data: { reply: aiResponse.text() }
    });
    
  } catch (error) {
    // Log the REAL error so we can debug
    const errMsg = error?.message || String(error);
    logger.error(`Gemini error: ${errMsg}`);
    console.error('❌ Gemini error details:', errMsg);
    
    // A robust Mock AI Engine for presentation purposes if the API Key is invalid
    const lowerMsg = String(message).toLowerCase();
    let replyText = "I'm Naviya AI! I specialize in health, fitness, and diet. Ask me about **weight loss**, **protein sources**, **what you ate today**, **muscle building**, or general fitness!";
    
    if (/\b(hi|hello|hey|greetings|namaste)\b/.test(lowerMsg)) {
        replyText = "Hello there! 👋 I am Naviya, your friendly AI assistant. How can I guide you with your nutrition and fitness goals today?";
    } else if (/\b(how are you|how r u|what's up|whats up)\b/.test(lowerMsg)) {
        replyText = "I'm doing great, thank you for asking! 😊 I'm fully charged and ready to help you plan the perfect diet. What would you like to know?";
    } else if (/\b(lose|weight|fat|cut|lean|belly)\b/.test(lowerMsg)) {
        replyText = "For weight loss, the key is maintaining a slight **caloric deficit** (eating fewer calories than you burn). Focus on **high-protein** and **high-fiber** foods because they keep you full longer. Don't skip meals, and try incorporating 30 minutes of walking or cardio daily! 🏃‍♂️";
    } else if (/\b(muscle|gain|bulk|strength|weight gain)\b/.test(lowerMsg)) {
        replyText = "To build muscle, you need to eat in a slight **caloric surplus** and consume adequate **protein** (roughly 1.6-2g per kg of your body weight). Great protein sources include chicken breast, eggs, tofu, fish, paneer, and whey protein. Pair this with a consistent strength-training routine! 💪";
    } else if (/\b(samosa|jalebi|kachori|pizza|burger|junk|chips|coke|soda|momo|momos|fries|fast food)\b/.test(lowerMsg)) {
        replyText = "While an occasional treat is okay, foods like that are very high in **refined carbs, unhealthy fats, and empty calories**. If you're on a diet, try to eat them in strict moderation or find healthier baked/air-fried alternatives! 🍕🍟🍰";
    } else if (/\b(sugar|sweet|chocolate|dessert|desserts|mithai|ice cream)\b/.test(lowerMsg)) {
        replyText = "It's best to limit added sugars as they provide empty calories and can cause energy crashes. Satisfy your sweet tooth with naturally sweet foods like fruits (apples, berries, bananas) or a small piece of dark chocolate! 🍎🍫";
    } else if (/\b(healthy|healty|health|good for health|prefer|which type|safely)\b/.test(lowerMsg)) {
        replyText = "For optimal health, prefer whole foods! Load up on **seasonal vegetables**, **fresh fruits**, **whole grains** (oats, brown rice, quinoa), and **good fats** (almonds, walnuts, olive oil). Try to avoid packaged, highly processed items! 🥑🥦";
    } else if (/\b(protein|paneer|chicken|egg|tofu|dal|soya|whey)\b/.test(lowerMsg)) {
        replyText = "Protein is essential! Excellent sources include:\n- **Animal-based**: Eggs, chicken, fish, dairy (milk, yogurt, paneer).\n- **Plant-based**: Lentils (dal), chickpeas, tofu, almonds, and soya chunks. \nAim to include a protein source in every meal! 🥩🥚🥗";
    } else if (/\b(water|hydrate|drink|thirst|juice)\b/.test(lowerMsg)) {
        replyText = "Hydration is crucial for your metabolism and energy levels! Aim for at least **2.5 to 3 liters** of water a day. If you exercise or live in a hot climate, you may need even more. Avoid sugary juices, stick to plain water or coconut water! 🚰🥥";
    } else if (/\b(carb|carbohydrate|rice|roti|bread|potato)\b/.test(lowerMsg)) {
        replyText = "Carbohydrates provide energy, but quality matters! Choose **complex carbs** like sweet potatoes, oats, and whole-wheat roti. Limit added sugars and sweets as they cause energy crashes. Satisfy cravings with fruits naturally! 🍞🍎";
    } else if (/\b(eat|ate|breakfast|lunch|dinner|meal|food|diet|ediet|hungry|veg|vegitarian|vegetarian|nonveg|non-veg)\b/.test(lowerMsg)) {
        replyText = "To keep your meals balanced and energetic, make sure you're including a good mix of **lean proteins** (paneer, tofu, chicken, eggs), **complex carbohydrates** (like brown rice, oats, dal), and plenty of **fiber-rich vegetables**. Remember to stay hydrated throughout the day! 🥗🍎";
    } else if (/\b(thank|thanks|ok|okay|got it|awesome|good|nice)\b/.test(lowerMsg)) {
        replyText = "You're very welcome! I'm always here to help. Let me know if you need any more tips on your diet or fitness journey! 😊";
    } else if (/\b(bye|goodbye|see ya|cya)\b/.test(lowerMsg)) {
        replyText = "Goodbye! Stay healthy and keep making great nutrition choices! Let me know when you need me again. 👋";
    }

    // Fallback dummy response when API fails
    res.json({
      success: true,
      data: {
        reply: replyText
      }
    });
  }
};
