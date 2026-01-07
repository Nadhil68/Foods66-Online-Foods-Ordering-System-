
import { GoogleGenAI, Type } from "@google/genai";
import { FoodItem, HealthProfile, FoodCategory } from "../types";
import { getRelevantFoodImage, MOCK_HEALTHY_MENU, MOCK_MENU } from "../constants";

// Safe access to API key
const API_KEY = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : '';

const formatGeminiError = (error: any): string => {
  const msg = error?.message || error?.toString() || "Unknown error";
  if (msg.includes("API Key") || msg.includes("403") || msg.includes("401")) {
      return "AI Configuration Error";
  }
  if (msg.includes("fetch") || msg.includes("network") || msg.includes("Failed to fetch")) {
      return "Network Connection Lost";
  }
  if (msg.includes("503") || msg.includes("Overloaded")) {
      return "AI Service Busy (Try Again)";
  }
  return "AI Service Unavailable";
};

// Helper to strip Markdown code blocks
const cleanJSON = (text: string): string => {
  if (!text) return "";
  let cleaned = text.replace(/```json\s*|\s*```/g, "").replace(/```/g, "").trim();
  const firstBracket = cleaned.indexOf('[');
  const firstBrace = cleaned.indexOf('{');
  
  if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
      const lastBracket = cleaned.lastIndexOf(']');
      if (lastBracket !== -1) cleaned = cleaned.substring(firstBracket, lastBracket + 1);
  } else if (firstBrace !== -1) {
      const lastBrace = cleaned.lastIndexOf('}');
      if (lastBrace !== -1) cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return cleaned;
};

// --- Offline Logic Helpers ---

const checkFoodSafetyOffline = (food: FoodItem, healthProfile: HealthProfile): {safe: boolean, reason: string} => {
  const disease = healthProfile.diseaseName?.toLowerCase() || '';
  const foodName = food.name.toLowerCase();
  const desc = food.description.toLowerCase();
  
  // Diabetes Rules
  if (disease.includes('diabetes') || disease.includes('sugar') || disease.includes('insulin')) {
      if (food.category === FoodCategory.DESSERT || foodName.includes('sweet') || foodName.includes('chocolate') || foodName.includes('cake') || foodName.includes('jamun') || foodName.includes('halwa')) {
          return { safe: false, reason: 'High sugar content.' };
      }
      if ((food.carbs || 0) > 65 && !food.dietaryTags?.includes('Low-Carb')) {
          return { safe: false, reason: 'High carbohydrate content.' };
      }
  }
  
  // Hypertension/Heart Rules
  if (disease.includes('pressure') || disease.includes('heart') || disease.includes('bp') || disease.includes('cholesterol')) {
      if (foodName.includes('pickle') || foodName.includes('fried') || foodName.includes('butter') || foodName.includes('ghee') || foodName.includes('bhatura')) {
          return { safe: false, reason: 'High sodium or saturated fats.' };
      }
  }

  // Stomach/Ulcer Rules
  if (disease.includes('ulcer') || disease.includes('stomach') || disease.includes('gerd') || disease.includes('acid')) {
      if (foodName.includes('spicy') || foodName.includes('masala') || foodName.includes('pepper') || foodName.includes('chili') || desc.includes('spicy')) {
          return { safe: false, reason: 'Spicy content may irritate stomach.' };
      }
  }

  return { safe: true, reason: 'Safe' };
};

// --- Offline AI Simulation Engine ---
export const getOfflineHealthRecommendations = (healthProfile: HealthProfile): FoodItem[] => {
  const disease = healthProfile.diseaseName?.toLowerCase() || '';
  // Start with a large pool of items
  let pool = [...MOCK_MENU, ...MOCK_HEALTHY_MENU];
  // Remove duplicates by ID
  pool = Array.from(new Map(pool.map(item => [item.id, item])).values());

  let items: FoodItem[] = [];
  let filterReason = '';

  // 1. Diabetes / Sugar Control / PCOS
  if (disease.includes('diabetes') || disease.includes('sugar') || disease.includes('pcos')) {
      items = pool.filter(i => 
          i.category !== FoodCategory.DESSERT && 
          i.category !== FoodCategory.DRINKS && 
          !i.name.toLowerCase().includes('sweet') &&
          !i.name.toLowerCase().includes('chocolate') &&
          (i.carbs || 100) < 65 &&
          (i.dietaryTags?.includes('Low-Carb') || i.category === FoodCategory.HEALTHY_COMBO || i.protein! > 8)
      );
      filterReason = '(Diabetes Friendly)';
  } 
  // 2. Heart / BP / Cholesterol
  else if (disease.includes('heart') || disease.includes('bp') || disease.includes('pressure') || disease.includes('cholesterol')) {
      items = pool.filter(i => 
          !i.name.toLowerCase().includes('fry') &&
          !i.name.toLowerCase().includes('fried') &&
          !i.name.toLowerCase().includes('butter') &&
          !i.name.toLowerCase().includes('ghee') &&
          !i.name.toLowerCase().includes('pickle') && 
          (i.category === FoodCategory.HEALTHY_COMBO || i.category === FoodCategory.VEG || i.category === FoodCategory.GYM_COMBO)
      );
      filterReason = '(Heart Healthy)';
  } 
  // 3. Weight Loss / Obesity
  else if (disease.includes('weight') || disease.includes('obesity') || disease.includes('fat') || disease.includes('diet')) {
       items = pool.filter(i => 
           (i.calories || 1000) < 550 && 
           i.category !== FoodCategory.DESSERT &&
           !i.name.toLowerCase().includes('cream') &&
           !i.name.toLowerCase().includes('fry')
       );
       filterReason = '(Low Calorie)';
  }
  // 4. Gym / Muscle
  else if (disease.includes('gym') || disease.includes('muscle') || disease.includes('protein')) {
       items = pool.filter(i => 
           i.category === FoodCategory.GYM_COMBO || 
           (i.protein || 0) > 15
       );
       filterReason = '(High Protein)';
  } 
  // 5. Digestive / Ulcer / GERD
  else if (disease.includes('ulcer') || disease.includes('gerd') || disease.includes('acid') || disease.includes('stomach')) {
      items = pool.filter(i => 
          !i.name.toLowerCase().includes('spicy') &&
          !i.name.toLowerCase().includes('chili') &&
          !i.name.toLowerCase().includes('pepper') &&
          !i.name.toLowerCase().includes('masala') &&
          i.category !== FoodCategory.COFFEE &&
          (i.category === FoodCategory.HEALTHY_COMBO || i.name.toLowerCase().includes('curd') || i.name.toLowerCase().includes('idli') || i.name.toLowerCase().includes('soup'))
      );
      filterReason = '(Gut Friendly)';
  } 
  else {
      // General Healthy Fallback if disease keywords don't match specific rules
      items = pool.filter(i => i.isRecommendedForHealth);
      filterReason = '(General Wellness)';
  }

  // Ensure we have enough items (at least 6). If strict filters returned too few, add general healthy items.
  if (items.length < 6) {
      const fillers = pool.filter(i => 
          (i.isRecommendedForHealth || i.category === FoodCategory.HEALTHY_COMBO) && 
          !items.some(existing => existing.id === i.id) &&
          i.category !== FoodCategory.DESSERT // Basic safety check for fillers
      );
      // Shuffle fillers
      const shuffledFillers = fillers.sort(() => 0.5 - Math.random());
      items = [...items, ...shuffledFillers.slice(0, 10 - items.length)];
  }

  // Shuffle and return items with a modified description for transparency
  return items.sort(() => 0.5 - Math.random()).slice(0, 15).map(item => ({
      ...item,
      description: `[Offline Recommendation] ${filterReason} ${item.description}` 
  }));
};

export const getHealthRecommendations = async (healthProfile: HealthProfile): Promise<FoodItem[]> => {
  if (!healthProfile.hasIssues || !healthProfile.diseaseName) {
    return [];
  }

  // Instant Offline Check
  if (!navigator.onLine || !API_KEY) {
      throw new Error("Offline Mode Triggered");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = "gemini-2.5-flash";
  
  const prompt = `
    The user has the following health condition:
    Age: ${healthProfile.age || 'Not specified'}
    Disease: ${healthProfile.diseaseName}
    Stage: ${healthProfile.stage}
    Medicines: ${healthProfile.medicines || "None"}
    Dietary Guidelines: ${healthProfile.dietaryMemo || "General healthy diet"}

    Generate a JSON array of 12 highly recommended Indian dishes (South/North mix).
    Strictly follow dietary restrictions for the disease.
    
    JSON Schema: Array<{
      name: string,
      description: string,
      price: number,
      category: string, // 'Veg', 'Non-Veg', 'Drinks', 'Coffee', 'Ice Creams & Dessert', 'Gym Combo', 'Healthy Combo'
      isVegetarian: boolean,
      calories: number,
      ingredients: Array<{name: string, amount: string}>,
      rating: number,
      restaurantName: string
    }>
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const rawData = cleanJSON(response.text || "");
    const parsedData = JSON.parse(rawData);

    if (!Array.isArray(parsedData)) throw new Error("Invalid Format");

    return parsedData.map((item: any) => {
      let cat = item.category;
      if (cat === 'Dessert') cat = 'Ice Creams & Dessert';
      
      const stableId = `rec_${item.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;

      return {
        id: stableId,
        name: item.name,
        description: item.description,
        price: item.price || 150,
        category: cat as FoodCategory,
        isVegetarian: item.isVegetarian,
        imageUrl: getRelevantFoodImage(item.name),
        isRecommendedForHealth: true,
        calories: item.calories,
        customizationAvailable: false,
        ingredients: item.ingredients || [],
        rating: item.rating || 4.5,
        reviewCount: 50,
        restaurantName: item.restaurantName || "Healthy Kitchen",
        restaurantLocation: "Chennai"
      };
    });

  } catch (error: any) {
    if (error.message === "Offline Mode Triggered") throw error;
    console.warn("Gemini API Error, falling back to offline logic:", error);
    throw new Error(formatGeminiError(error));
  }
};

export const checkFoodSafety = async (food: FoodItem, healthProfile: HealthProfile): Promise<{safe: boolean, reason?: string, isError?: boolean}> => {
   if (!healthProfile.hasIssues) return { safe: true };
   
   try {
      if (!navigator.onLine || !API_KEY) throw new Error("Offline");

      const ai = new GoogleGenAI({ apiKey: API_KEY });
      const prompt = `
        User: ${healthProfile.diseaseName} (Stage ${healthProfile.stage}).
        Food: ${food.name}.
        Safe to eat? Return JSON: { "safe": boolean, "reason": "string" }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      return JSON.parse(cleanJSON(response.text || "{}"));
   } catch (error) {
     return checkFoodSafetyOffline(food, healthProfile);
   }
};

export const validateHealthProfile = async (disease: string, stage: string, medicines: string, age?: number): Promise<{valid: boolean, reason?: string, dietaryMemo?: string, isError?: boolean}> => {
  try {
      if (!navigator.onLine || !API_KEY) throw new Error("Offline");

      const ai = new GoogleGenAI({ apiKey: API_KEY });
      const prompt = `
        Validate Profile: Age ${age}, Disease ${disease}, Meds ${medicines}.
        Return JSON: { "valid": boolean, "reason": "string", "dietaryMemo": "string" }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(cleanJSON(response.text || "{}"));
  } catch (e) {
      return { valid: true, reason: "Offline validation skipped.", isError: true }; 
  }
};

export const generateFoodImage = async (foodName: string): Promise<string | null> => {
  try {
    if (!navigator.onLine || !API_KEY) return null;
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: { parts: [{ text: `Food photo of ${foodName}` }] }
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data 
        ? `data:image/jpeg;base64,${response.candidates[0].content.parts[0].inlineData.data}` 
        : null;
  } catch (e) {
      return null;
  }
};

export const getChatResponse = async (message: string, healthProfile: HealthProfile, history: any[]): Promise<string> => {
  try {
    if (!navigator.onLine || !API_KEY) return "I am currently offline. Please check your internet connection.";
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: history.map(h => ({ role: h.role, parts: [{ text: h.text }] }))
    });
    const result = await chat.sendMessage({ message });
    return result.text || "No response.";
  } catch (e) {
    return "Service unavailable.";
  }
};
