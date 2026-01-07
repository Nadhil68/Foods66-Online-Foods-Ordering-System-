
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { MOCK_MENU, MOCK_HEALTHY_MENU } from '../constants';
import { FoodItem, FoodCategory, CoffeeCustomization } from '../types';
import { getHealthRecommendations, checkFoodSafety } from '../services/geminiService';
import { AlertTriangle, Coffee, X, Heart, Utensils, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import FoodCard from '../components/FoodCard';

const ITEMS_PER_PAGE = 12;

const Menu: React.FC = () => {
  const { user, addToCart } = useAppContext();
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<'common' | 'recommended'>(user?.healthProfile.hasIssues ? 'recommended' : 'common');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Data State
  const [aiRecommendedItems, setAiRecommendedItems] = useState<FoodItem[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  
  // Modals
  const [customizationItem, setCustomizationItem] = useState<FoodItem | null>(null);
  const [customizationOptions, setCustomizationOptions] = useState<CoffeeCustomization>({ sugarSpoons: 1, powderLevel: 'Medium', temperature: 'Hot' });
  const [warningModal, setWarningModal] = useState<{show: boolean, item: FoodItem | null, reason: string}>({ show: false, item: null, reason: '' });
  const [pendingQuantity, setPendingQuantity] = useState(1);

  // Fetch AI Recommendations
  useEffect(() => {
    const fetchRecs = async () => {
      if (user?.healthProfile.hasIssues) {
        setLoadingRecs(true);
        const recs = await getHealthRecommendations(user.healthProfile);
        setAiRecommendedItems(recs);
        setLoadingRecs(false);
      }
    };
    if (activeTab === 'recommended' && aiRecommendedItems.length === 0) {
      fetchRecs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user?.healthProfile.diseaseName]);

  // Reset page when category or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activeTab]);

  const handleAddToCart = async (item: FoodItem, quantity: number, customImage?: string) => {
    // If a custom image was generated, ensure we use it for the cart item
    const itemToAdd = customImage ? { ...item, imageUrl: customImage } : item;

    // 1. Check for Drink/Item Customization
    if (itemToAdd.customizationAvailable) {
      setCustomizationItem(itemToAdd);
      setPendingQuantity(quantity);
      // Reset options to defaults
      setCustomizationOptions({ sugarSpoons: 1, powderLevel: 'Medium', temperature: 'Hot' });
      return;
    }

    // 2. Health Safety Check (AI) - Only check if user is in Common Menu and has issues
    if (user?.healthProfile.hasIssues && activeTab === 'common' && !itemToAdd.isRecommendedForHealth) {
       try {
         const check = await checkFoodSafety(itemToAdd, user.healthProfile);
         if (!check.safe) {
             setWarningModal({ show: true, item: itemToAdd, reason: check.reason || "This might conflict with your condition." });
             setPendingQuantity(quantity);
             return;
         }
       } catch (e) {
         // Handle failure gracefully
         setWarningModal({ show: true, item: itemToAdd, reason: "Safety check unavailable, proceed with caution." });
         setPendingQuantity(quantity);
         return;
       }
    }

    addToCart(itemToAdd, quantity);
  };

  const confirmCustomization = () => {
    if (customizationItem) {
      addToCart(customizationItem, pendingQuantity, customizationOptions);
      setCustomizationItem(null);
      setPendingQuantity(1);
    }
  };

  const confirmUnsafeAdd = () => {
    if (warningModal.item) {
      addToCart(warningModal.item, pendingQuantity);
      setWarningModal({ show: false, item: null, reason: '' });
      setPendingQuantity(1);
    }
  };

  // Filter Logic
  const getSourceData = () => {
    if (activeTab === 'recommended') {
        return MOCK_HEALTHY_MENU;
    }
    return MOCK_MENU;
  };

  const allSourceItems = getSourceData();
  const filteredItems = activeCategory === 'All' 
    ? allSourceItems 
    : allSourceItems.filter(i => i.category === activeCategory);

  // Pagination Logic
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-20">
      
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Discover Food</h1>
        <p className="text-gray-500">
            {user?.healthProfile.hasIssues 
                ? `Personalized for your health needs.` 
                : "Over 1000+ dishes from across India."}
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 p-1 rounded-full inline-flex shadow-inner">
          <button 
            onClick={() => setActiveTab('common')}
            className={`px-6 py-3 rounded-full flex items-center font-semibold transition-all duration-300 ${activeTab === 'common' ? 'bg-white shadow text-emerald-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Utensils size={18} className="mr-2" /> Common Menu 
            <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded-full text-gray-600">1000+</span>
          </button>
          <button 
             onClick={() => setActiveTab('recommended')}
             className={`px-6 py-3 rounded-full flex items-center font-semibold transition-all duration-300 ${activeTab === 'recommended' ? 'bg-emerald-600 shadow text-white' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Heart size={18} className="mr-2" /> 
            {user?.healthProfile.hasIssues ? 'My Recommendations' : 'Healthy Options'}
            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${activeTab === 'recommended' ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-600'}`}>100+</span>
          </button>
        </div>
      </div>

      {/* Categories (Only for Common Menu mostly, but kept for both) */}
      <div className="flex overflow-x-auto space-x-2 mb-8 pb-2 scrollbar-hide justify-center">
          <button onClick={() => setActiveCategory('All')} className={`px-5 py-2 rounded-full whitespace-nowrap transition border ${activeCategory === 'All' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>All</button>
          {Object.values(FoodCategory).map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-2 rounded-full whitespace-nowrap transition border ${activeCategory === cat ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>{cat}</button>
          ))}
      </div>

      {/* AI Generated Recommendations Section (Only visible in Recommended Tab) */}
      {activeTab === 'recommended' && user?.healthProfile.hasIssues && (
        <div className="mb-12 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-end mb-6">
             <div>
                <h2 className="text-2xl font-bold text-emerald-900 flex items-center">
                    <span className="bg-emerald-600 text-white px-2 py-1 rounded mr-3 text-xs uppercase font-bold tracking-wider">Gemini AI</span>
                    Specially Curated for You
                </h2>
                <p className="text-emerald-700 mt-1">Based on your profile: <span className="font-semibold">{user.healthProfile.diseaseName} (Stage {user.healthProfile.stage})</span></p>
             </div>
          </div>
          
          {loadingRecs ? (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-fadeIn">
              <div className="bg-white p-4 rounded-full shadow-lg mb-4 border border-emerald-100">
                <Loader size={32} className="text-emerald-600 animate-spin" />
              </div>
              <h3 className="text-xl font-bold text-emerald-800">Curating Your Menu</h3>
              <p className="text-emerald-600 mt-2 max-w-md">
                Gemini AI is analyzing your health profile to suggest the best meals.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiRecommendedItems.map(item => (
                <FoodCard key={item.id} item={item} onAdd={(qty, img) => handleAddToCart(item, qty, img)} recommended={true} />
              ))}
            </div>
          )}
          {aiRecommendedItems.length === 0 && !loadingRecs && <p className="text-emerald-600">We are generating personalized recommendations...</p>}
        </div>
      )}

      {/* Main Grid */}
      <div className="mb-4 flex justify-between items-center">
         <h2 className="text-xl font-bold text-gray-700">
            {activeTab === 'common' ? `Common Menu (${filteredItems.length} items)` : `Healthy Database (${filteredItems.length} items)`}
         </h2>
         <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
      </div>

      {filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-xl">
              <p className="text-gray-500 text-lg">No items found in this category.</p>
              <button onClick={() => setActiveCategory('All')} className="mt-4 text-emerald-600 font-bold hover:underline">View All</button>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {paginatedItems.map(item => (
            <FoodCard key={item.id} item={item} onAdd={(qty, img) => handleAddToCart(item, qty, img)} recommended={activeTab === 'recommended'} />
            ))}
          </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-8">
            <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1}
                className="p-3 rounded-full bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
            >
                <ChevronLeft size={20} />
            </button>
            
            <div className="flex space-x-2">
                {/* Simple pagination logic showing generic dots for simplicity in this demo */}
                <span className={`w-3 h-3 rounded-full ${currentPage === 1 ? 'bg-emerald-600' : 'bg-gray-300'}`}></span>
                {totalPages > 1 && <span className={`w-3 h-3 rounded-full ${currentPage > 1 && currentPage < totalPages ? 'bg-emerald-600' : 'bg-gray-300'}`}></span>}
                {totalPages > 2 && <span className={`w-3 h-3 rounded-full ${currentPage === totalPages ? 'bg-emerald-600' : 'bg-gray-300'}`}></span>}
            </div>

            <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                disabled={currentPage === totalPages}
                className="p-3 rounded-full bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
            >
                <ChevronRight size={20} />
            </button>
        </div>
      )}

      {/* Customization Modal */}
      {customizationItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-scaleIn">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-xl font-bold flex items-center"><Coffee className="mr-2 text-brown-600" /> Customize {customizationItem.name}</h3>
               <button onClick={() => setCustomizationItem(null)}><X size={24} className="text-gray-400 hover:text-gray-600"/></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sugar (Spoons)</label>
                <div className="flex items-center space-x-4">
                  <button onClick={() => setCustomizationOptions(p => ({...p, sugarSpoons: Math.max(0, p.sugarSpoons - 0.5)}))} className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-lg">-</button>
                  <span className="font-mono text-lg">{customizationOptions.sugarSpoons}</span>
                  <button onClick={() => setCustomizationOptions(p => ({...p, sugarSpoons: p.sugarSpoons + 0.5}))} className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-lg">+</button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Powder Level / Strength</label>
                <div className="flex space-x-2">
                  {['Mild', 'Medium', 'Strong'].map(l => (
                    <button key={l} onClick={() => setCustomizationOptions(p => ({...p, powderLevel: l as any}))} 
                    className={`flex-1 py-2 rounded-lg border ${customizationOptions.powderLevel === l ? 'bg-amber-700 text-white border-amber-700' : 'text-gray-600 border-gray-300'}`}>{l}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
                <div className="flex space-x-2">
                  {['Hot', 'Cold', 'Lukewarm'].map(t => (
                     <button key={t} onClick={() => setCustomizationOptions(p => ({...p, temperature: t as any}))} 
                     className={`flex-1 py-2 rounded-lg border ${customizationOptions.temperature === t ? 'bg-red-500 text-white border-red-500' : 'text-gray-600 border-gray-300'}`}>{t}</button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={confirmCustomization} className="w-full mt-6 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700">Add to Cart ({pendingQuantity})</button>
          </div>
        </div>
      )}

      {/* Health Warning Modal */}
      {warningModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border-l-4 border-amber-500">
             <div className="flex items-start mb-4">
                <AlertTriangle size={32} className="text-amber-500 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Health Alert</h3>
                  <p className="text-sm text-gray-600 mt-1">Based on your condition ({user?.healthProfile.diseaseName}), this item might be unsuitable.</p>
                  <div className="mt-2 bg-amber-50 p-2 rounded text-xs font-medium text-amber-800">
                    Reason: {warningModal.reason}
                  </div>
                </div>
             </div>
             <div className="flex gap-3">
               <button onClick={() => setWarningModal({show:false, item:null, reason:''})} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">Cancel</button>
               <button onClick={confirmUnsafeAdd} className="flex-1 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600">Order Anyway ({pendingQuantity})</button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Menu;
