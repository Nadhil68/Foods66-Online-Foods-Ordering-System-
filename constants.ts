
import { FoodCategory, FoodItem, Ingredient, DietaryTag } from "./types";

export const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&h=400&q=80";

// Base data for generating combinations
const ADJECTIVES = ['Spicy', 'Chettinad', 'Butter', 'Grilled', 'Crispy', 'Steamed', 'Roasted', 'Hyderabadi', 'Malabar', 'Tandoori', 'Schezwan', 'Pepper', 'Garlic', 'Ginger', 'Lemon', 'Mysore', 'Madurai', 'Kolkata', 'Mumbai', 'Classic'];
const DISH_TYPES_VEG = ['Dosa', 'Idli', 'Paneer Tikka', 'Veg Biryani', 'Mushroom Curry', 'Gobi Manchurian', 'Aloo Paratha', 'Sambar Rice', 'Curd Rice', 'Veg Korma', 'Rasam', 'Vada', 'Pongal', 'Upma', 'Chapati', 'Naan', 'Dal Fry', 'Veg Fried Rice', 'Paneer Butter Masala'];
const DISH_TYPES_NON_VEG = ['Chicken Biryani', 'Mutton Curry', 'Fish Fry', 'Chicken 65', 'Prawn Masala', 'Egg Curry', 'Mutton Chukka', 'Chicken Korma', 'Fish Curry', 'Crab Masala', 'Grilled Chicken', 'Tandoori Chicken', 'Chicken Tikka', 'Mutton Biryani', 'Chicken Fried Rice'];
const DRINKS = ['Lassi', 'Fresh Juice', 'Milkshake', 'Soda', 'Mojito', 'Buttermilk', 'Masala Tea', 'Green Tea', 'Lemon Tea', 'Mango Lassi'];
const COFFEE_VARIANTS = [
  'Classic Hot Coffee', 'Cold Coffee', 'Cappuccino', 'Cafe Latte', 'Espresso Shot', 
  'Cafe Mocha', 'Americano', 'Madras Filter Coffee', 'Caramel Macchiato', 
  'Hazelnut Coffee', 'Iced Latte', 'Flat White', 'Irish Coffee (Non-Alcoholic)', 
  'Vanilla Frappe', 'Dark Chocolate Coffee',
  'Affogato', 'Nitro Cold Brew', 'Turkish Coffee', 'Ginger Coffee (Sukku Kaapi)', 
  'Turmeric Latte (Golden Milk)',
  'Vietnamese Iced Coffee', 'Cortado', 'Dalgona Coffee', 'Bulletproof Coffee (Keto)', 
  'Pumpkin Spice Latte'
];
const DESSERTS = ['Ice Cream', 'Gulab Jamun', 'Rasmalai', 'Brownie', 'Cake', 'Halwa', 'Payasam', 'Falooda', 'Chocolate Cake', 'Fruit Salad'];

// New Combo Data
const GYM_DISHES = [
  'Grilled Chicken Breast & Sweet Potato',
  'Egg White Omelette with Multigrain Toast',
  'Boiled Eggs & Chickpea Salad Bowl',
  'Whey Protein Shake & Banana',
  'Grilled Fish with Steamed Broccoli',
  'Chicken Salad with Olive Oil Dressing',
  'Soya Chunks Masala & 2 Chapatis',
  'Peanut Butter Banana Oat Smoothie',
  'Oatmeal with Almonds & Berries',
  'Lean Mutton Curry & Brown Rice',
  'Lemon Herb Grilled Chicken',
  'Scrambled Eggs with Spinach',
  'Paneer & Broccoli Stir Fry',
  'High-Protein Soya Pulao',
  'Grilled Fish Salad Bowl',
  'Chicken Clear Soup & Salad',
  'Oats & Whey Protein Porridge',
  'Egg Bhurji with Multigrain Roti',
  'Chicken Breast with Quinoa & Asparagus',
  'Salmon Fillet with Roasted Veggies',
  'Tofu Scramble with Avocado Toast',
  'Protein Pancakes with Honey & Berries',
  'Turkey Meatballs with Zucchini Noodles',
  'Greek Yogurt Parfait with Granola',
  'Tuna Salad Sandwich (Whole Wheat)',
  'Lentil Soup with Grilled Chicken',
  'Cottage Cheese Steak with Corn',
  'Post-Workout Watermelon Slush & Protein Bar',
  'Grilled Shrimp with Avocado Salad',
  'High Protein Bean Salad',
  'Keto Chicken Salad',
  'Grilled Mutton Chops',
  'Protein Smoothie Bowl',
  'Egg & Avocado Wrap',
  'Chickpea & Quinoa Bowl',
  'Soya Keema Matar',
  'Chicken Tikka Salad (Oil-Free)',
  'Fish Tacos (Lettuce Wrap)',
  'Berry Protein Shake',
  'Greek Yogurt with Honey & Walnuts',
  'Chicken Breast Stuffed with Spinach',
  'Boiled Egg Whites (6) & Apple',
  'Peanut Butter Toast with Banana',
  'Grilled Prawns with Lemon Garlic'
];

const HEALTHY_COMBOS_DISHES = [
  'Millet Dosa with Mint Chutney',
  'Quinoa Upma & Green Tea',
  'Multigrain Roti & Yellow Dal',
  'Fresh Fruit Bowl & Mixed Nuts',
  'Sprouts Salad & Buttermilk',
  'Vegetable Clear Soup & Wheat Toast',
  'Grilled Paneer & Sauteed Beans',
  'Brown Rice & Palak Paneer Combo',
  'Detox Cucumber Juice & Salad',
  'Ragi Malt & Jaggery with Dry Fruits',
  'Vegetable Stew & Appam',
  'Corn & Spinach Sandwich',
  'Mushroom Pepper Fry & Roti',
  'Curd Rice with Pomegranate',
  'Roasted Sweet Potato Salad',
  'Palak Khichdi',
  'Mixed Sprout Chaat',
  'Beetroot & Carrot Juice Combo',
  'Avocado & Tomato Bruschetta',
  'Watermelon & Feta Salad',
  'Green Mung Bean Dosa (Pesarattu)',
  'Barley Soup & Garlic Bread',
  'Papaya & Chia Seed Bowl',
  'Steamed Wheat Momos with Soup',
  'Zucchini Noodles with Pesto',
  'Baked Sweet Potato Fries & Dip',
  'Aloe Vera Juice & Nuts',
  'Coconut Water & Fruit Platter',
  'Lotus Seed (Makhana) Chaat',
  'Chia Pudding with Mango',
  'Bajra Roti & Baingan Bharta',
  'Jowar Bhakri with Green Chutney',
  'Pumpkin Soup & Garlic Croutons',
  'Beetroot Poriyal & Red Rice',
  'Methi Thepla with Low-fat Curd',
  'Stir-fried Tofu & Bell Peppers',
  'Cucumber & Mint Cooler',
  'Roasted Makhana & Green Tea Combo',
  'Fruit Chaat with Chaat Masala',
  'Moong Dal Chilla with Paneer',
  'Vegetable Khichdi with Curd',
  'Mushroom Soup & Garlic Toast',
  'Sprouts Bhel',
  'Horsegram Soup (Kollu Rasam)',
  'Tender Coconut Pudding'
];

// Mock Restaurants
const RESTAURANTS = [
  { name: "Spice Garden", location: "Anna Nagar" },
  { name: "Madras Kitchen", location: "T. Nagar" },
  { name: "Chettinad Court", location: "Velachery" },
  { name: "Royal Tandoor", location: "Adyar" },
  { name: "Sangeetha Veg", location: "Mylapore" },
  { name: "Buhari Hotel", location: "Mount Road" },
  { name: "Anjappar", location: "Chromepet" },
  { name: "Cream Centre", location: "Nungambakkam" },
  { name: "Murugan Idli Shop", location: "Besant Nagar" },
  { name: "Saravana Bhavan", location: "Vadapalani" },
  { name: "Amma Chettinad", location: "Tambaram" },
  { name: "The Bowl Company", location: "OMR" },
  { name: "Fit & Fuel", location: "Alwarpet" },
  { name: "Green Leaf Organic", location: "Besant Nagar" },
  { name: "Cafe Coffee Day", location: "Phoenix Mall" },
  { name: "Starbucks", location: "Velachery" }
];

// Helper to generate random number
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper to get random rating
const getRandomRating = () => (Math.random() * (5.0 - 3.5) + 3.5).toFixed(1);

// Helper to get random restaurant
const getRandomRestaurant = () => RESTAURANTS[randomInt(0, RESTAURANTS.length - 1)];

// --- Image Mapping Logic ---
const FOOD_IMAGE_MAP: Record<string, string> = {
  // South Indian Veg
  'dosa': 'https://images.unsplash.com/photo-1668236346578-535eeb4203bf',
  'masala dosa': 'https://images.unsplash.com/photo-1589301760574-d81d5a1b0c8c',
  'idli': 'https://images.unsplash.com/photo-1589301760574-d81d5a1b0c8c',
  'vada': 'https://images.unsplash.com/photo-1606213791012-3213a8b44924',
  'pongal': 'https://images.unsplash.com/photo-1596450516809-a79622d9b626',
  'upma': 'https://images.unsplash.com/photo-1525455986968-450f6448375e',
  'sambar': 'https://images.unsplash.com/photo-1626082927389-e175950db78d',
  'curd rice': 'https://images.unsplash.com/photo-1616641680371-c06631b74705',
  'lemon rice': 'https://images.unsplash.com/photo-1626082927389-e175950db78d',
  'veg meals': 'https://images.unsplash.com/photo-1626082927389-e175950db78d',
  'appam': 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e0',
  'khichdi': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0',
  'chilla': 'https://images.unsplash.com/photo-1631452180519-c0253810f545',

  // North Indian Veg
  'paneer': 'https://images.unsplash.com/photo-1631452180519-c0253810f545',
  'paneer tikka': 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8',
  'butter masala': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641',
  'aloo': 'https://images.unsplash.com/photo-1626074353765-517a681e40be',
  'paratha': 'https://images.unsplash.com/photo-1626074353765-517a681e40be',
  'naan': 'https://images.unsplash.com/photo-1626074353765-517a681e40be',
  'roti': 'https://images.unsplash.com/photo-1626074353765-517a681e40be',
  'dal': 'https://images.unsplash.com/photo-1546833999-b9f581602932',
  'mushroom': 'https://images.unsplash.com/photo-1625937329535-6187747e9b06',
  'gobi': 'https://images.unsplash.com/photo-1624552178128-47274457d87b',
  'manchurian': 'https://images.unsplash.com/photo-1624552178128-47274457d87b',
  'korma': 'https://images.unsplash.com/photo-1585937427243-7117464b6e38',
  'baingan': 'https://images.unsplash.com/photo-1615485925763-867862f80877',
  'bharta': 'https://images.unsplash.com/photo-1615485925763-867862f80877',

  // Biryani & Rice
  'veg biryani': 'https://images.unsplash.com/photo-1644682534575-a0435cc38519',
  'chicken biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8',
  'mutton biryani': 'https://images.unsplash.com/photo-1643912144704-5856b3cb9123',
  'prawn biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8',
  'fried rice': 'https://images.unsplash.com/photo-1603133872878-684f108fd4f4',
  'pulao': 'https://images.unsplash.com/photo-1596797038530-2c107229654b',
  'rice': 'https://images.unsplash.com/photo-1596797038530-2c107229654b',

  // Non-Veg
  'chicken': 'https://images.unsplash.com/photo-1610057099494-25ee5b53e5a5',
  'tandoori': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0',
  'grilled chicken': 'https://images.unsplash.com/photo-1598514987221-59e3ef69e9b6',
  'chicken 65': 'https://images.unsplash.com/photo-1610057099494-25ee5b53e5a5',
  'tikka': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641',
  'mutton': 'https://images.unsplash.com/photo-1543826173-70651703c5a4',
  'keema': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0',
  'fish': 'https://images.unsplash.com/photo-1534939561336-386c79643e48',
  'prawn': 'https://images.unsplash.com/photo-1559847844-5315695dadae',
  'crab': 'https://images.unsplash.com/photo-1559847844-5315695dadae',
  'egg': 'https://images.unsplash.com/photo-1529563026365-d6216858e805',
  'boiled egg': 'https://images.unsplash.com/photo-1529563026365-d6216858e805',
  'scrambled': 'https://images.unsplash.com/photo-1525351463629-48705386a583',
  'omelette': 'https://images.unsplash.com/photo-1510693206972-df098062cb71',
  'shawarma': 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783',
  'grill': 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783',
  'bbq': 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783',

  // Drinks
  'coffee': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd',
  'cold coffee': 'https://images.unsplash.com/photo-1572442388796-11668a67e53d',
  'tea': 'https://images.unsplash.com/photo-1576092762791-34e877475d79',
  'chai': 'https://images.unsplash.com/photo-1576092762791-34e877475d79',
  'green tea': 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5',
  'juice': 'https://images.unsplash.com/photo-1613478221278-289862981434',
  'lassi': 'https://images.unsplash.com/photo-1560505167-96a58b8d0c24',
  'buttermilk': 'https://images.unsplash.com/photo-1605273105342-882298642784',
  'milkshake': 'https://images.unsplash.com/photo-1579954115545-2b8560086e43',
  'smoothie': 'https://images.unsplash.com/photo-1505252585461-04db1eb84625',
  'mojito': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd',
  'soda': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd',
  
  // Coffee Specific
  'cappuccino': 'https://images.unsplash.com/photo-1572442388796-11668a67e53d',
  'latte': 'https://images.unsplash.com/photo-1561882468-48573deb1742',
  'espresso': 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04',
  'mocha': 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e',
  'americano': 'https://images.unsplash.com/photo-1551024601-bec78aea704b',
  'filter coffee': 'https://images.unsplash.com/photo-1596920566829-d737e606f35b',
  'macchiato': 'https://images.unsplash.com/photo-1485808191679-5f86510681a2',
  'flat white': 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61',
  'hazelnut': 'https://images.unsplash.com/photo-1618214227918-62d46e9df159',
  'frappe': 'https://images.unsplash.com/photo-1572442388796-11668a67e53d',
  'chocolate': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574',
  'affogato': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd',
  'nitro': 'https://images.unsplash.com/photo-1511920170033-f8396924c348',
  'turkish': 'https://images.unsplash.com/photo-1596450516809-a79622d9b626',
  'ginger': 'https://images.unsplash.com/photo-1596920566829-d737e606f35b',
  'turmeric': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5',
  'vietnamese': 'https://images.unsplash.com/photo-1595267072979-447bd8193077',
  'cortado': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd',
  'dalgona': 'https://images.unsplash.com/photo-1587080266227-677cc2a4e76e',
  'bulletproof': 'https://images.unsplash.com/photo-1621221703879-117570d426d4',
  'pumpkin spice': 'https://images.unsplash.com/photo-1509456272305-639202e07eb8',

  // Desserts
  'ice cream': 'https://images.unsplash.com/photo-1497034825451-b22e5a014756',
  'brownie': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c',
  'cake': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587',
  'gulab jamun': 'https://images.unsplash.com/photo-1593466176543-982c578f4b50',
  'rasmalai': 'https://images.unsplash.com/photo-1629007358763-71887e492212',
  'payasam': 'https://images.unsplash.com/photo-1629007358763-71887e492212',
  'halwa': 'https://images.unsplash.com/photo-1629007358763-71887e492212',
  'falooda': 'https://images.unsplash.com/photo-1556910103-1c02745a30bf',
  'fruit salad': 'https://images.unsplash.com/photo-1615486511484-92e109d902be',
  'pudding': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',

  // Healthy & Gym
  'salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
  'bowl': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
  'soup': 'https://images.unsplash.com/photo-1547592166-23ac45744acd',
  'pumpkin': 'https://images.unsplash.com/photo-1570586437263-ab629fhd818',
  'fruit': 'https://images.unsplash.com/photo-1615486511484-92e109d902be',
  'protein': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
  'whey': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
  'oat': 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf',
  'quinoa': 'https://images.unsplash.com/photo-1586511925558-a4c6376fe65f',
  'sprouts': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
  'millet': 'https://images.unsplash.com/photo-1648416625807-6f8d38647008',
  'grilled': 'https://images.unsplash.com/photo-1598514987221-59e3ef69e9b6',
  'sandwich': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af',
  'wrap': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f',
  'taco': 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f',
  'stew': 'https://images.unsplash.com/photo-1547592166-23ac45744acd',
  'chaat': 'https://images.unsplash.com/photo-1601050690597-df0568f70950',
  'pancakes': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445',
  'waffle': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
  'salmon': 'https://images.unsplash.com/photo-1519708227418-c8fd9a3a2b7b',
  'tuna': 'https://images.unsplash.com/photo-1534483509319-a423027a8108',
  'tofu': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
  'shrimp': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641',
  'yogurt': 'https://images.unsplash.com/photo-1488477181946-6428a029177b',
  'makhana': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0',
  'avocado': 'https://images.unsplash.com/photo-1601039641847-7857b994d704',
  'sweet potato': 'https://images.unsplash.com/photo-1517036080480-4b34f42a512a',
  'chickpea': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
  'corn': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076',
  'coconut water': 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054',
  'granola': 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf',
  'curry': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641',
  'masala': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641',
};

// Prioritize checking keys sorted by length (descending) ONCE to optimize repeated calls
// This ensures specific matches (e.g. "masala dosa") are found before generic ones (e.g. "dosa")
const SORTED_IMAGE_KEYS = Object.keys(FOOD_IMAGE_MAP).sort((a, b) => b.length - a.length);

export const getRelevantFoodImage = (name: string): string => {
  const lowerName = name.toLowerCase();
  const base = "https://images.unsplash.com/photo-";
  const params = "?auto=format&fit=crop&w=600&h=400&q=80";

  for (const key of SORTED_IMAGE_KEYS) {
    if (lowerName.includes(key)) {
      return FOOD_IMAGE_MAP[key] + params;
    }
  }
  
  // Specific checks for common variations
  if (lowerName.includes('egg white')) return FOOD_IMAGE_MAP['egg'] + params;
  if (lowerName.includes('omelet')) return FOOD_IMAGE_MAP['omelette'] + params;

  // Fallbacks
  if (lowerName.includes('veg')) return `https://images.unsplash.com/photo-1546833999-b9f581602932${params}`;
  if (lowerName.includes('chicken') || lowerName.includes('meat')) return `https://images.unsplash.com/photo-1588166524941-3bf61a9c41db${params}`;
  
  return PLACEHOLDER_IMAGE; // Generic food image
};

// Helper to generate Ingredients based on dish name
const generateIngredients = (name: string, isVeg: boolean): Ingredient[] => {
  const ingredients: Ingredient[] = [];

  // Special Protein Handling for New Items
  if (name.includes('Salmon') || name.includes('Tuna') || name.includes('Shrimp') || name.includes('Turkey')) {
       if (name.includes('Salmon')) ingredients.push({ name: 'Salmon Fillet', amount: '200g' });
       else if (name.includes('Tuna')) ingredients.push({ name: 'Tuna Chunks', amount: '150g' });
       else if (name.includes('Shrimp')) ingredients.push({ name: 'Fresh Shrimp', amount: '150g' });
       else if (name.includes('Turkey')) ingredients.push({ name: 'Lean Turkey', amount: '200g' });

       ingredients.push({ name: 'Salad Greens', amount: '100g' });
       ingredients.push({ name: 'Olive Oil', amount: '1 tbsp' });
       return ingredients;
  }
  
  // Tofu/Pancakes
  if (name.includes('Tofu')) {
      ingredients.push({ name: 'Firm Tofu', amount: '150g' });
      ingredients.push({ name: 'Avocado', amount: 'Half' });
      ingredients.push({ name: 'Whole Wheat Toast', amount: '1 Slice' });
      return ingredients;
  }
  if (name.includes('Pancakes')) {
      ingredients.push({ name: 'Whey Protein Powder', amount: '1 Scoop' });
      ingredients.push({ name: 'Oat Flour', amount: '50g' });
      ingredients.push({ name: 'Egg Whites', amount: '2' });
      ingredients.push({ name: 'Honey', amount: '1 tsp' });
      return ingredients;
  }
  
  // Wraps / Tacos
  if (name.includes('Wrap') || name.includes('Taco')) {
      ingredients.push({ name: 'Whole Wheat Tortilla/Lettuce', amount: '1 no' });
      ingredients.push({ name: 'Protein Filling (Egg/Chicken/Tofu)', amount: '100g' });
      ingredients.push({ name: 'Fresh Salad', amount: '50g' });
      return ingredients;
  }

  // Keema / Minced
  if (name.includes('Keema')) {
      ingredients.push({ name: 'Minced Soya/Meat', amount: '200g' });
      ingredients.push({ name: 'Green Peas', amount: '50g' });
      ingredients.push({ name: 'Spices', amount: 'To Taste' });
      return ingredients;
  }
  
  // Chilla
  if (name.includes('Chilla')) {
      ingredients.push({ name: 'Moong Dal Batter', amount: '150ml' });
      ingredients.push({ name: 'Paneer Crumble', amount: '50g' });
      ingredients.push({ name: 'Green Chili & Ginger', amount: '1 tsp' });
      return ingredients;
  }

  // Biryani Logic
  if (name.includes('Biryani')) {
    ingredients.push({ name: 'Basmati Rice', amount: '250g' });
    ingredients.push({ name: 'Biryani Masala (Star Anise, Cloves, Cinnamon)', amount: '2 tbsp' });
    ingredients.push({ name: 'Ghee', amount: '50g' });
    ingredients.push({ name: 'Fried Onions', amount: '1 cup' });
    ingredients.push({ name: 'Mint & Coriander Leaves', amount: '1/2 cup' });
    ingredients.push({ name: 'Curd/Yogurt', amount: '100ml' });
    ingredients.push({ name: 'Ginger Garlic Paste', amount: '1 tbsp' });

    if (name.includes('Chicken')) {
        ingredients.push({ name: 'Chicken Pieces', amount: '300g' });
    } else if (name.includes('Mutton')) {
        ingredients.push({ name: 'Mutton Pieces', amount: '300g' });
    } else if (name.includes('Veg') || name.includes('Paneer') || name.includes('Mushroom')) {
        ingredients.push({ name: 'Mixed Vegetables (Carrot, Beans, Peas)', amount: '200g' });
        if (name.includes('Paneer')) ingredients.push({ name: 'Paneer Cubes', amount: '150g' });
    }
  } 
  // Dosa/Idli/Appam/Pulao/Khichdi Logic
  else if (name.includes('Dosa') || name.includes('Idli') || name.includes('Uttapam') || name.includes('Appam') || name.includes('Pulao') || name.includes('Khichdi')) {
    if (name.includes('Pulao')) ingredients.push({ name: 'Basmati Rice', amount: '200g' });
    else if (name.includes('Khichdi')) { ingredients.push({ name: 'Rice & Dal', amount: '200g' }); ingredients.push({ name: 'Spinach', amount: '50g' }); }
    else ingredients.push({ name: 'Rice Batter (Fermented)', amount: '200ml' });
    
    if (name.includes('Soya')) ingredients.push({ name: 'Soya Chunks', amount: '100g' });
    if (name.includes('Millet') || name.includes('Ragi')) ingredients.push({ name: 'Millet/Ragi Flour', amount: '50g' });
    
    if (name.includes('Ghee') || name.includes('Butter')) {
        ingredients.push({ name: 'Pure Ghee/Butter', amount: '2 tbsp' });
    } else {
        ingredients.push({ name: 'Oil', amount: '1 tbsp' });
    }
    if (name.includes('Appam')) {
        ingredients.push({ name: 'Coconut Milk', amount: '100ml' });
        if (name.includes('Stew')) ingredients.push({ name: 'Mixed Veg Stew', amount: '150ml' });
    } else if (!name.includes('Pulao') && !name.includes('Khichdi')) {
        ingredients.push({ name: 'Coconut Chutney', amount: '50g (Side)' });
        ingredients.push({ name: 'Sambar', amount: '100ml (Side)' });
    }
  }
  // Sandwich Logic
  else if (name.includes('Sandwich') || name.includes('Toast')) {
    ingredients.push({ name: 'Multigrain/Wheat Bread', amount: '2 slices' });
    if (name.includes('Spinach')) ingredients.push({ name: 'Fresh Spinach', amount: '50g' });
    if (name.includes('Corn')) ingredients.push({ name: 'Sweet Corn', amount: '50g' });
    if (name.includes('Egg')) ingredients.push({ name: 'Egg Whites', amount: '2 nos' });
    ingredients.push({ name: 'Pepper & Salt', amount: 'Pinch' });
  }
  // Curry/Stew/Fry Logic
  else if (name.includes('Curry') || name.includes('Korma') || name.includes('Masala') || name.includes('Gravy') || name.includes('Stew') || name.includes('Fry') || name.includes('Bharta') || name.includes('Poriyal')) {
    ingredients.push({ name: 'Onion & Tomato Base', amount: '150g' });
    ingredients.push({ name: 'Ginger Garlic Paste', amount: '1 tsp' });
    ingredients.push({ name: 'Spice Mix', amount: '2 tbsp' });
    if (!name.includes('Stew')) ingredients.push({ name: 'Oil', amount: '2 tbsp' });
    else ingredients.push({ name: 'Coconut Milk', amount: '100ml' });
    
    if (name.includes('Chicken')) ingredients.push({ name: 'Chicken', amount: '250g' });
    else if (name.includes('Mutton')) ingredients.push({ name: 'Mutton', amount: '250g' });
    else if (name.includes('Paneer')) ingredients.push({ name: 'Paneer', amount: '200g' });
    else if (name.includes('Mushroom')) ingredients.push({ name: 'Mushrooms', amount: '200g' });
    else if (name.includes('Fish')) ingredients.push({ name: 'Fish', amount: '250g' });
    else if (name.includes('Soya')) ingredients.push({ name: 'Soya Chunks', amount: '150g' });
    else ingredients.push({ name: 'Vegetables', amount: '250g' });
  }
  // Coffee Logic
  else if (name.includes('Coffee') || name.includes('Latte') || name.includes('Cappuccino') || name.includes('Espresso') || name.includes('Mocha') || name.includes('Americano') || name.includes('Macchiato') || name.includes('Frappe') || name.includes('Brew') || name.includes('Affogato') || name.includes('Turkish') || name.includes('Kaapi') || name.includes('Cortado')) {
      ingredients.push({ name: 'Roasted Coffee Beans', amount: '1 Shot' });
      if (!name.includes('Espresso') && !name.includes('Americano') && !name.includes('Nitro')) {
          if (name.includes('Turmeric')) ingredients.push({ name: 'Almond/Soy Milk', amount: '150ml' });
          else if (name.includes('Vietnamese')) ingredients.push({ name: 'Condensed Milk', amount: '2 tbsp' });
          else ingredients.push({ name: 'Steamed Milk', amount: '150ml' });
      }
      if (name.includes('Mocha') || name.includes('Chocolate')) {
          ingredients.push({ name: 'Cocoa/Chocolate', amount: '2 tbsp' });
      }
      if (name.includes('Caramel')) {
          ingredients.push({ name: 'Caramel Drizzle', amount: '1 tbsp' });
      }
      if (name.includes('Hazelnut')) {
          ingredients.push({ name: 'Hazelnut Syrup', amount: '1 pump' });
      }
      if (name.includes('Affogato')) {
          ingredients.push({ name: 'Vanilla Ice Cream', amount: '1 Scoop' });
      }
      if (name.includes('Turmeric')) {
          ingredients.push({ name: 'Turmeric & Pepper', amount: '1 tsp' });
      }
      if (name.includes('Ginger') || name.includes('Sukku')) {
          ingredients.push({ name: 'Dry Ginger & Spices', amount: '1 tsp' });
      }
      if (name.includes('Pumpkin')) {
          ingredients.push({ name: 'Pumpkin Spice Mix', amount: '1 tsp' });
          ingredients.push({ name: 'Pumpkin Puree', amount: '1 tbsp' });
      }
      if (name.includes('Bulletproof')) {
          ingredients.push({ name: 'Grass-fed Butter/Ghee', amount: '1 tbsp' });
          ingredients.push({ name: 'MCT Oil', amount: '1 tsp' });
      }
      if (name.includes('Dalgona')) {
          ingredients.push({ name: 'Whipped Coffee Foam', amount: 'Top Layer' });
          ingredients.push({ name: 'Chilled Milk', amount: '200ml' });
      }
  }
  // Dessert Logic
  else if (name.includes('Ice Cream') || name.includes('Shake') || name.includes('Dessert') || name.includes('Cake') || name.includes('Slush') || name.includes('Parfait') || name.includes('Pudding')) {
    ingredients.push({ name: 'Milk/Cream/Yogurt', amount: '200ml' });
    if (name.includes('Honey')) ingredients.push({ name: 'Honey', amount: '1 tbsp' });
    else ingredients.push({ name: 'Sugar', amount: '2 tbsp' });
    
    ingredients.push({ name: 'Flavoring', amount: 'few drops' });
    if (name.includes('Chocolate')) ingredients.push({ name: 'Cocoa Powder', amount: '2 tbsp' });
    if (name.includes('Fruit') || name.includes('Berry') || name.includes('Mango') || name.includes('Watermelon') || name.includes('Coconut')) {
        ingredients.push({ name: 'Fresh Fruit', amount: '100g' });
    }
  }
  // Healthy Bowl/Salad/Chaat Logic
  else if (name.includes('Healthy') || name.includes('Bowl') || name.includes('Salad') || name.includes('Chaat')) {
    if (name.includes('Quinoa')) ingredients.push({ name: 'Quinoa', amount: '150g' });
    else if (name.includes('Rice')) ingredients.push({ name: 'Brown Rice', amount: '150g' });
    else if (name.includes('Makhana') || name.includes('Lotus Seed')) ingredients.push({ name: 'Roasted Makhana', amount: '50g' });
    
    ingredients.push({ name: 'Mixed Greens/Sprouts', amount: '1 cup' });
    if (name.includes('Paneer')) ingredients.push({ name: 'Grilled Paneer', amount: '100g' });
    if (name.includes('Fish')) ingredients.push({ name: 'Grilled Fish', amount: '150g' });
    if (name.includes('Chicken')) ingredients.push({ name: 'Grilled Chicken', amount: '150g' });
    if (name.includes('Sweet Potato')) ingredients.push({ name: 'Roasted Sweet Potato', amount: '150g' });
    
    ingredients.push({ name: 'Olive Oil/Lemon Dressing', amount: '1 tbsp' });
  }
  // Gym Combo Logic (Specifics)
  else if (name.includes('Gym') || name.includes('Protein') || name.includes('Whey') || name.includes('Boiled Egg') || name.includes('Scrambled') || name.includes('Oat') || name.includes('Lean') || name.includes('Grilled')) {
    ingredients.push({ name: 'Lean Protein Source', amount: '200g' });
    if (name.includes('Sweet Potato')) ingredients.push({ name: 'Sweet Potato', amount: '150g' });
    else if (name.includes('Oat')) ingredients.push({ name: 'Oats', amount: '100g' });
    else ingredients.push({ name: 'Multigrain Bread/Rice', amount: '100g' });
    
    ingredients.push({ name: 'Steamed Vegetables', amount: '1 cup' });
    
    if (name.includes('Shake') || name.includes('Whey')) ingredients.push({ name: 'Whey Protein', amount: '1 Scoop' });
    if (name.includes('Egg')) ingredients.push({ name: 'Eggs', amount: '3 nos' });
  }
  // Juices/Water
  else if (name.includes('Juice') || name.includes('Water') || name.includes('Cooler')) {
    if (name.includes('Coconut')) ingredients.push({ name: 'Tender Coconut Water', amount: '300ml' });
    else if (name.includes('Aloe')) ingredients.push({ name: 'Aloe Vera Pulp', amount: '50g' });
    else if (name.includes('Cucumber')) ingredients.push({ name: 'Fresh Cucumber', amount: '100g' });
    else ingredients.push({ name: 'Fresh Fruit/Veg', amount: '300g' });
    
    if (!name.includes('Water')) ingredients.push({ name: 'No Added Sugar', amount: '' });
  }
  // Generic Fallback
  else {
     ingredients.push({ name: 'Main Ingredient', amount: '200g' });
     ingredients.push({ name: 'Spices & Seasoning', amount: 'To Taste' });
     ingredients.push({ name: 'Oil/Butter', amount: '1 tbsp' });
     if (!isVeg) ingredients.push({ name: 'Meat', amount: '150g' });
  }

  return ingredients;
};

// Helper function to calculate dietary tags
const calculateDietaryTags = (item: FoodItem): DietaryTag[] => {
  const tags: DietaryTag[] = [];
  const nameLower = item.name.toLowerCase();
  
  // High-Protein Check
  if ((item.protein || 0) > 20) {
      tags.push('High-Protein');
  }

  // Low-Carb Check
  if ((item.carbs || 0) < 40) {
      tags.push('Low-Carb');
  }

  // Vegan Check (Vegetarian + no dairy/egg)
  if (item.isVegetarian) {
      const dairyIngredients = ['milk', 'curd', 'ghee', 'butter', 'paneer', 'cheese', 'yogurt', 'cream', 'whey', 'egg', 'omelette', 'scrambled', 'honey'];
      const hasDairy = item.ingredients?.some(ing => dairyIngredients.some(d => ing.name.toLowerCase().includes(d))) || dairyIngredients.some(d => nameLower.includes(d));
      
      if (!hasDairy && !nameLower.includes('honey')) {
          tags.push('Vegan');
      }
  }

  return tags;
};

// --- Menu Generation Logic ---
const generateMenu = (): FoodItem[] => {
  const menu: FoodItem[] = [];
  let idCounter = 1;

  const createItem = (name: string, category: FoodCategory, isVeg: boolean, basePrice: number): FoodItem => {
      const restaurant = getRandomRestaurant();
      const rating = parseFloat(getRandomRating());
      const reviewCount = randomInt(50, 500);
      const ingredients = generateIngredients(name, isVeg);
      
      // Nutrients calculation (approximate)
      let calories = randomInt(200, 600);
      let protein = randomInt(5, 20);
      let carbs = randomInt(20, 80);

      if (category === FoodCategory.GYM_COMBO) {
          protein = randomInt(25, 50);
          carbs = randomInt(20, 50);
          calories = randomInt(300, 550);
      } else if (category === FoodCategory.HEALTHY_COMBO) {
          protein = randomInt(10, 25);
          carbs = randomInt(30, 60);
          calories = randomInt(250, 450);
      } else if (category === FoodCategory.DESSERT) {
          calories = randomInt(300, 800);
          carbs = randomInt(40, 100);
          protein = randomInt(2, 8);
      } else if (category === FoodCategory.COFFEE) {
          calories = randomInt(80, 250);
          protein = randomInt(2, 6);
          carbs = randomInt(10, 30);
      }

      const item: FoodItem = {
          id: `ITEM-${idCounter++}`,
          name,
          description: `Delicious ${name} prepared with authentic ingredients.`,
          price: basePrice + randomInt(0, 50),
          category,
          isVegetarian: isVeg,
          imageUrl: getRelevantFoodImage(name),
          rating,
          reviewCount,
          restaurantName: restaurant.name,
          restaurantLocation: restaurant.location,
          calories,
          protein,
          carbs,
          ingredients,
          isCookedToOrder: true,
          customizationAvailable: category === FoodCategory.COFFEE || category === FoodCategory.DRINKS
      };

      item.dietaryTags = calculateDietaryTags(item);
      // Heuristic for healthy recommendation in common menu
      item.isRecommendedForHealth = (category === FoodCategory.HEALTHY_COMBO || category === FoodCategory.GYM_COMBO || (calories < 500 && protein > 10));

      return item;
  };

  // Add Categories
  DISH_TYPES_VEG.forEach(name => menu.push(createItem(name, FoodCategory.VEG, true, 80)));
  DISH_TYPES_NON_VEG.forEach(name => menu.push(createItem(name, FoodCategory.NON_VEG, false, 180)));
  DRINKS.forEach(name => menu.push(createItem(name, FoodCategory.DRINKS, true, 40)));
  COFFEE_VARIANTS.forEach(name => menu.push(createItem(name, FoodCategory.COFFEE, true, 80)));
  DESSERTS.forEach(name => menu.push(createItem(name, FoodCategory.DESSERT, true, 100)));
  
  // Add Gym & Healthy Combos
  GYM_DISHES.forEach(name => {
      // Improved isVeg detection for new items
      const isNonVeg = name.includes('Chicken') || name.includes('Egg') || name.includes('Fish') || name.includes('Mutton') || name.includes('Tuna') || name.includes('Salmon') || name.includes('Turkey') || name.includes('Shrimp') || name.includes('Prawn') || name.includes('Beef') || name.includes('Keema');
      menu.push(createItem(name, FoodCategory.GYM_COMBO, !isNonVeg, 200));
  });
  HEALTHY_COMBOS_DISHES.forEach(name => {
      // Mostly veg, but check just in case
      const isNonVeg = name.includes('Chicken') || name.includes('Fish') || name.includes('Egg');
      menu.push(createItem(name, FoodCategory.HEALTHY_COMBO, !isNonVeg, 150));
  });

  return menu;
};

export const MOCK_MENU = generateMenu();
export const MOCK_HEALTHY_MENU = MOCK_MENU.filter(i => i.isRecommendedForHealth || i.category === FoodCategory.GYM_COMBO || i.category === FoodCategory.HEALTHY_COMBO);
