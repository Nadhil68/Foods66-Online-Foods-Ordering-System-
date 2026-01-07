
import React, { useState, useMemo, useEffect } from 'react';
import { FoodItem, FoodCategory } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { Info, Flame, Dumbbell, Wheat, Heart, AlertTriangle, Star, Loader, Check, Award, Sparkles, ChefHat, Dot, Bot } from 'lucide-react';
import { PLACEHOLDER_IMAGE } from '../constants';
import QuantitySelector from './QuantitySelector';
import { generateFoodImage } from '../services/geminiService';

interface FoodCardProps {
  item: FoodItem;
  onAdd: (quantity: number, customImage?: string) => Promise<void> | void;
  recommended?: boolean;
}

const FoodCard: React.FC<FoodCardProps> = ({ item, onAdd, recommended }) => {
  const { user, showNotification } = useAppContext();
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Image Generation State
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [imageSrc, setImageSrc] = useState(item.imageUrl || PLACEHOLDER_IMAGE);

  // Reset state when the item changes
  useEffect(() => {
    setImageSrc(item.imageUrl || PLACEHOLDER_IMAGE);
    setIsExpanded(false);
  }, [item.id, item.imageUrl]);

  const handleImageError = () => {
    if (imageSrc !== PLACEHOLDER_IMAGE) {
        setImageSrc(PLACEHOLDER_IMAGE);
    }
  };
  
  // Initialize favorite state from localStorage safely
  const [isFavorite, setIsFavorite] = useState(() => {
    try {
      const stored = localStorage.getItem('f66_favorites');
      const favorites = stored ? JSON.parse(stored) : [];
      return Array.isArray(favorites) && favorites.includes(item.id);
    } catch (e) {
      return false;
    }
  });

  // Calculate potential safety risk reason based on health profile
  const safetyReason = useMemo(() => {
    if (!user?.healthProfile.hasIssues || recommended) return null;
    
    const disease = user.healthProfile.diseaseName?.toLowerCase() || '';
    const isDiabetes = disease.includes('diabetes');
    const isHypertension = disease.includes('blood pressure') || disease.includes('hypertension');
    const isHeart = disease.includes('heart');
    const isCold = disease.includes('cold') || disease.includes('flu');

    if (isDiabetes && item.category === FoodCategory.DESSERT) return "High sugar content.";
    if (isDiabetes && (item.carbs || 0) > 60) return "High carbs (may spike blood sugar).";
    if (isHypertension && (item.name.includes('Pickle') || item.name.includes('Salt'))) return "High sodium content.";
    if (isHeart && (item.name.includes('Butter') || item.name.includes('Ghee') || item.name.includes('Fried'))) return "High saturated fat.";
    if (isCold && (item.name.includes('Ice') || item.name.includes('Cold'))) return "Cold food warning.";
    if (item.calories && item.calories > 700) return "Very high calorie content.";
    
    return null;
  }, [user, item, recommended]);

  const isPotentiallyUnsafe = !!safetyReason;

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    e.preventDefault();
    try {
      const stored = localStorage.getItem('f66_favorites');
      const favorites = stored ? JSON.parse(stored) : [];
      let newFavorites;
      
      if (isFavorite) {
        newFavorites = favorites.filter((id: string) => id !== item.id);
      } else {
        if (Array.isArray(favorites) && !favorites.includes(item.id)) {
            newFavorites = [...favorites, item.id];
        } else if (!Array.isArray(favorites)) {
            newFavorites = [item.id];
        } else {
            newFavorites = favorites;
        }
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      }
      
      localStorage.setItem('f66_favorites', JSON.stringify(newFavorites));
      setIsFavorite(!isFavorite);
    } catch (e) {
      console.warn("Failed to update favorites preference", e);
    }
  };

  const handleGenerateImage = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isGeneratingImg) return;
    
    setIsGeneratingImg(true);
    showNotification("Visualizing Dish", `Generating AI image for ${item.name}...`, 'info');
    
    try {
      const base64 = await generateFoodImage(item.name);
      if (base64) {
        setImageSrc(base64);
        showNotification("Success", "Image generated successfully!", 'success');
      } else {
        showNotification("Error", "Failed to generate image.", 'error');
      }
    } catch (error) {
      console.error("Failed to generate image", error);
      showNotification("Error", "Generation failed.", 'error');
    } finally {
      setIsGeneratingImg(false);
    }
  };

  const handleAskAI = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      // Dispatch custom event for ChatBot to pick up
      const event = new CustomEvent('ask-ai', { 
          detail: { query: `Is ${item.name} safe or good for my condition?` } 
      });
      window.dispatchEvent(event);
  };

  const handleAddClick = async () => {
    if (isSuccess) return;
    setIsAdding(true);
    try {
      const customImage = imageSrc !== item.imageUrl ? imageSrc : undefined;
      await onAdd(quantity, customImage);
      setIsSuccess(true);
      setQuantity(1);
      setTimeout(() => setIsSuccess(false), 2000);
    } catch (error) {
      console.error("Failed to add item", error);
    } finally {
      setIsAdding(false);
    }
  };

  const increment = () => setQuantity(q => q + 1);
  const decrement = () => setQuantity(q => Math.max(1, q - 1));

  return (
    <div className={`
      bg-white rounded-2xl shadow-sm hover:shadow-xl hover:shadow-orange-500/10
      transition-all duration-300 ease-out transform hover:-translate-y-1
      overflow-hidden border flex flex-col h-full relative group
      ${recommended ? 'border-orange-200 ring-1 ring-orange-100' : 'border-gray-100'}
      hover:ring-2 hover:border-orange-300 hover:ring-orange-200
    `}>
      
      {/* Toast Notification */}
      {showToast && (
        <div className="absolute top-4 right-4 z-30 animate-fadeIn">
          <div className="bg-gray-900/90 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center">
             <Heart size={10} className="fill-red-500 text-red-500 mr-1.5" /> 
             Saved
          </div>
        </div>
      )}

      {/* Image Area */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {isGeneratingImg && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                <Loader size={24} className="text-orange-600 animate-spin" />
            </div>
        )}
        <img 
          src={imageSrc} 
          alt={item.name} 
          onError={handleImageError}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isPotentiallyUnsafe ? 'grayscale-[0.5]' : ''}`} 
        />
        
        {/* Floating Ask AI Button */}
        <button 
            onClick={handleAskAI}
            className="absolute top-2 right-2 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-md hover:bg-orange-600 hover:text-white transition-all transform hover:scale-110 z-20 text-orange-600 border border-orange-100"
            title="Ask Chef AI about this dish"
        >
            <Bot size={16} />
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-grow relative">
        
        {/* Header Row: Title, Favorite, Price */}
        <div className="flex justify-between items-start gap-3 mb-2">
          <div className="flex-1">
              <h3 className={`font-bold text-lg leading-tight transition-colors ${isPotentiallyUnsafe ? 'text-red-700' : 'text-gray-900 group-hover:text-orange-600'}`}>
                  {item.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                 {/* Favorite Button (Inline) */}
                 <button 
                    onClick={toggleFavorite}
                    className="p-1 -ml-1 rounded-full hover:bg-gray-100 transition-colors"
                    title={isFavorite ? "Remove Favorite" : "Add Favorite"}
                 >
                    <Heart size={16} className={`transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`} />
                 </button>
                 
                 {/* Rating */}
                 {(item.rating || item.reviewCount) && (
                    <div className="flex items-center text-xs font-bold text-amber-500">
                        <Star size={10} className="fill-current mr-0.5" />
                        {item.rating || 4.5}
                    </div>
                 )}
              </div>
          </div>
          
          <div className="text-right">
              <span className="font-extrabold text-orange-600 text-lg block">
                  ₹{item.price}
              </span>
          </div>
        </div>

        {/* Sub-Header: Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
           <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase flex items-center border ${item.isVegetarian ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              <Dot size={12} strokeWidth={8} className={item.isVegetarian ? 'text-green-600' : 'text-red-600'} />
              {item.isVegetarian ? 'VEG' : 'NON-VEG'}
           </span>

           {recommended && (
            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-teal-50 text-teal-700 border border-teal-200 flex items-center">
              <Award size={10} className="mr-1"/> Recommended
            </span>
           )}

           <div className="text-xs text-gray-400 flex items-center ml-auto truncate max-w-[100px]">
              {item.restaurantName || 'Food Court'}
           </div>
        </div>

        {/* Safety Warning */}
        {isPotentiallyUnsafe && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-2 mb-2 flex items-start gap-2">
                <AlertTriangle size={14} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-[10px] font-bold text-red-700 uppercase">Health Warning</p>
                    <p className="text-[10px] text-red-600 leading-tight">
                      {safetyReason}
                    </p>
                </div>
            </div>
        )}

        {/* Description */}
        <p className="text-gray-500 text-xs line-clamp-2 mb-3 leading-relaxed">
           {item.description}
        </p>

        {/* Info Toggle */}
        <div className="flex justify-between items-center mb-2 mt-auto">
           <button 
               onClick={handleGenerateImage}
               disabled={isGeneratingImg}
               className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 flex items-center gap-1 transition-colors"
           >
               <Sparkles size={12} /> {isGeneratingImg ? 'Generating...' : 'Visualize Dish'}
           </button>

           <button 
               onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
               className="flex items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-orange-600 uppercase tracking-wide transition-colors"
           >
               {isExpanded ? 'Hide Info' : 'Nutrition Info'} <Info size={12} />
           </button>
        </div>

        {/* Collapsible Detail Section */}
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[500px] opacity-100 mb-3' : 'max-h-0 opacity-0'}`}>
          <div className="bg-orange-50/50 rounded-xl border border-orange-100 p-3 shadow-inner space-y-3">
              <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center justify-center text-center p-2 bg-white rounded-lg shadow-sm border border-orange-100">
                      <Flame size={12} className="text-orange-500 mb-1" />
                      <span className="text-xs font-bold text-gray-800">{item.calories || '-'}</span>
                      <span className="text-[8px] text-gray-400 uppercase">Kcal</span>
                  </div>
                  <div className="flex flex-col items-center justify-center text-center p-2 bg-white rounded-lg shadow-sm border border-blue-100">
                      <Dumbbell size={12} className="text-blue-500 mb-1" />
                      <span className="text-xs font-bold text-gray-800">{item.protein ? `${item.protein}g` : '-'}</span>
                      <span className="text-[8px] text-gray-400 uppercase">Prot</span>
                  </div>
                  <div className="flex flex-col items-center justify-center text-center p-2 bg-white rounded-lg shadow-sm border border-yellow-100">
                      <Wheat size={12} className="text-yellow-500 mb-1" />
                      <span className="text-xs font-bold text-gray-800">{item.carbs ? `${item.carbs}g` : '-'}</span>
                      <span className="text-[8px] text-gray-400 uppercase">Carb</span>
                  </div>
              </div>
              
              {item.ingredients && item.ingredients.length > 0 && (
                  <div className="bg-white p-2 rounded-lg border border-gray-100">
                      <h4 className="text-[9px] font-bold text-gray-500 uppercase mb-1">Ingredients</h4>
                      <div className="flex flex-wrap gap-1">
                          {item.ingredients.slice(0, 6).map((ing, idx) => (
                              <span key={idx} className="text-[9px] text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
                                  {ing.name}
                              </span>
                          ))}
                      </div>
                  </div>
              )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
            <QuantitySelector 
              quantity={quantity}
              onIncrease={increment}
              onDecrease={decrement}
              disabled={isAdding}
              className="bg-gray-50 border border-gray-200 h-9"
              size="sm"
            />

            <button 
              onClick={handleAddClick} 
              className={`
                 flex-1 flex items-center justify-center px-4 h-9 rounded-xl text-sm font-bold transition-all duration-300 shadow-sm transform active:scale-95
                 ${isSuccess ? 'bg-green-600 text-white' : 
                   isPotentiallyUnsafe ? 'bg-red-600 text-white hover:bg-red-700' : 
                   'bg-orange-600 text-white hover:bg-orange-700'}
              `}
              disabled={isAdding || isSuccess}
            >
               {isAdding ? <Loader size={16} className="animate-spin" /> : 
                isSuccess ? <><Check size={16} className="mr-1"/> Added</> : 
                isPotentiallyUnsafe ? 'Add (Risky)' : 'Add to Cart'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
