import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { MOCK_HEALTHY_MENU } from '../constants';
import { FoodItem, CoffeeCustomization, FoodCategory } from '../types';
import { Coffee, X, ChevronLeft, ChevronRight, Heart, Sparkles, Utensils, RefreshCw, ArrowUpDown, Loader, ListFilter, WifiOff, FileText } from 'lucide-react';
import FoodCard from '../components/FoodCard';
import { useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 12;

const RecommendedMenu: React.FC = () => {
  const { user, addToCart, recommendations, isLoadingRecommendations, isOfflineMode, refreshRecommendations } = useAppContext();
  const navigate = useNavigate();
  
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [categorySearch, setCategorySearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'default' | 'asc' | 'desc'>('default');
  
  // Modals
  const [customizationItem, setCustomizationItem] = useState<FoodItem | null>(null);
  const [customizationOptions, setCustomizationOptions] = useState<CoffeeCustomization>({ sugarSpoons: 1, powderLevel: 'Medium', temperature: 'Hot' });
  const [pendingQuantity, setPendingQuantity] = useState(1);

  const hasHealthIssues = user?.healthProfile.hasIssues;

  // Reset page on sort or category change
  useEffect(() => {
      setCurrentPage(1);
  }, [sortOrder, activeCategory, categorySearch, recommendations]);

  const handleAddToCart = async (item: FoodItem, quantity: number, customImage?: string) => {
    const itemToAdd = customImage ? { ...item, imageUrl: customImage } : item;

    if (itemToAdd.customizationAvailable) {
      setCustomizationItem(itemToAdd);
      setPendingQuantity(quantity);
      setCustomizationOptions({ sugarSpoons: 1, powderLevel: 'Medium', temperature: 'Hot' });
      return;
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

  // Determine Source Data
  const sourceData = hasHealthIssues ? recommendations : MOCK_HEALTHY_MENU;

  // Processing Logic
  let processedItems = sourceData.filter(item => {
    if (activeCategory === 'All') return true;
    return item.category === activeCategory;
  });
  
  if (sortOrder === 'asc') {
    processedItems.sort((a, b) => a.price - b.price);
  } else if (sortOrder === 'desc') {
    processedItems.sort((a, b) => b.price - a.price);
  }

  // Pagination Logic
  const totalPages = Math.ceil(processedItems.length / ITEMS_PER_PAGE);
  const paginatedItems = processedItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-20">
      
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2 flex justify-center items-center">
           Discover Food
        </h1>
        <p className="text-gray-500">
            {hasHealthIssues 
                ? (isOfflineMode ? "Smart filtered menu (Offline Mode)" : `Personalized AI recommendations based on your verified profile.`)
                : "Curated selection of healthy and nutritious options."}
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 p-1 rounded-full inline-flex shadow-inner">
          <button 
            onClick={() => navigate('/common-foods')}
            className="px-6 py-3 rounded-full flex items-center font-semibold transition-all duration-300 text-gray-500 hover:text-gray-700 hover:bg-gray-200"
          >
            <Utensils size={18} className="mr-2" /> Common Menu 
            <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded-full text-gray-600">1000+</span>
          </button>
          <button 
             className="px-6 py-3 rounded-full flex items-center font-semibold transition-all duration-300 bg-orange-600 shadow text-white"
          >
            <Heart size={18} className="mr-2" /> 
            {hasHealthIssues ? 'My Recommendations' : 'Healthy Options'}
            <span className="ml-2 text-xs bg-orange-500 px-2 py-0.5 rounded-full text-white">
               {hasHealthIssues ? (recommendations.length || 'AI') : '100+'}
            </span>
          </button>
        </div>
      </div>

      {/* Health Profile Header */}
      {hasHealthIssues && (
        <div className={`mb-8 rounded-2xl p-6 border relative overflow-hidden shadow-sm transition-all duration-500 ${isOfflineMode ? 'bg-amber-50 border-amber-200' : 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100'}`}>
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
             <div className="flex-1">
                <h2 className={`text-xl font-bold flex items-center ${isOfflineMode ? 'text-amber-900' : 'text-emerald-900'}`}>
                    {isOfflineMode ? (
                        <span className="bg-amber-600 text-white px-2 py-1 rounded mr-3 text-xs uppercase font-bold tracking-wider flex items-center">
                          <WifiOff size={12} className="mr-1" /> Offline
                        </span>
                    ) : (
                        <span className="bg-emerald-600 text-white px-2 py-1 rounded mr-3 text-xs uppercase font-bold tracking-wider flex items-center">
                          <Sparkles size={12} className="mr-1" /> Gemini AI
                        </span>
                    )}
                    {isOfflineMode ? "Safe Choices" : "Chef AI's Prescription"}
                </h2>
                
                <p className={`${isOfflineMode ? 'text-amber-800' : 'text-emerald-700'} mt-1 text-sm font-medium`}>
                   Verified Condition: {user.healthProfile.diseaseName}
                </p>

                {/* Dietary Memo Display */}
                {user.healthProfile.dietaryMemo && (
                    <div className="mt-3 bg-white/70 p-3 rounded-lg border border-emerald-100 flex items-start gap-2 shadow-sm">
                        <FileText size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-emerald-800 italic font-medium">
                            "{user.healthProfile.dietaryMemo}"
                        </p>
                    </div>
                )}
             </div>
             {!isLoadingRecommendations && (
                <button onClick={refreshRecommendations} className="bg-white/80 hover:bg-white text-emerald-600 p-2 rounded-full shadow-sm transition self-start" title="Refresh Recommendations">
                    <RefreshCw size={18} className={isLoadingRecommendations ? 'animate-spin' : ''} />
                </button>
             )}
           </div>
        </div>
      )}

      {/* Loading State */}
      {isLoadingRecommendations && hasHealthIssues ? (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn min-h-[400px]">
                <div className="bg-white p-4 rounded-full shadow-lg mb-6 border border-orange-100 relative">
                    <Loader size={48} className="text-orange-600 animate-spin" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Curating Your Menu...</h3>
                <p className="text-gray-500 mt-2 max-w-md mx-auto">
                    Gemini AI is filtering recipes based on: <strong>{user?.healthProfile.dietaryMemo || user?.healthProfile.diseaseName}</strong>
                </p>
            </div>
      ) : (
        /* Data Grid */
        <>
            {/* Filter Bar */}
            <div className="sticky top-16 z-40 bg-gray-50/95 backdrop-blur-md shadow-sm border-b border-gray-200 -mx-4 px-4 py-4 mb-6 transition-all">
                <div className="max-w-7xl mx-auto flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 animate-fadeIn">
                        <div className="relative w-full md:w-64 flex-shrink-0">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <ListFilter size={16} className="text-gray-400"/>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Filter categories..." 
                                value={categorySearch}
                                onChange={(e) => setCategorySearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs font-medium focus:ring-1 focus:ring-orange-500 outline-none shadow-sm transition-all focus:bg-white"
                            />
                        </div>
                        
                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                            <span className="text-sm font-bold text-gray-700 whitespace-nowrap">{processedItems.length} Items</span>
                            <div className="relative">
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value as any)}
                                    className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-orange-500 shadow-sm cursor-pointer text-sm"
                                >
                                    <option value="default">Sort by</option>
                                    <option value="asc">Price: Low to High</option>
                                    <option value="desc">Price: High to Low</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                <ArrowUpDown size={14} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex overflow-x-auto space-x-2 pb-1 scrollbar-hide">
                        <button onClick={() => setActiveCategory('All')} className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition border ${activeCategory === 'All' ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>All</button>
                        {Object.values(FoodCategory)
                            .filter(cat => cat.toLowerCase().includes(categorySearch.toLowerCase()))
                            .map(cat => (
                            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition border ${activeCategory === cat ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>{cat}</button>
                        ))}
                    </div>
                </div>
            </div>

            {processedItems.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-xl">
                    <p className="text-gray-500 text-lg mb-2">No items found.</p>
                    <button onClick={() => { setActiveCategory('All'); setCategorySearch(''); }} className="text-orange-600 font-bold hover:underline">
                        View All
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8 animate-fadeIn">
                    {paginatedItems.map(item => (
                    <FoodCard key={item.id} item={item} onAdd={(qty, img) => handleAddToCart(item, qty, img)} recommended={true} />
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
                        <span className={`w-3 h-3 rounded-full ${currentPage === 1 ? 'bg-orange-600' : 'bg-gray-300'}`}></span>
                        {totalPages > 1 && <span className={`w-3 h-3 rounded-full ${currentPage > 1 && currentPage < totalPages ? 'bg-orange-600' : 'bg-gray-300'}`}></span>}
                        {totalPages > 2 && <span className={`w-3 h-3 rounded-full ${currentPage === totalPages ? 'bg-orange-600' : 'bg-gray-300'}`}></span>}
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
        </>
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

            <button onClick={confirmCustomization} className="w-full mt-6 bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 shadow-md">Add to Cart ({pendingQuantity})</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default RecommendedMenu;