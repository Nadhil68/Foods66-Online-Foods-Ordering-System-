import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { MOCK_MENU } from '../constants';
import { FoodItem, FoodCategory, CoffeeCustomization, DietaryTag } from '../types';
import { checkFoodSafety } from '../services/geminiService';
import { AlertTriangle, Coffee, X, ChevronLeft, ChevronRight, Utensils, Heart, Search, RotateCcw, ArrowUpDown, Mic, MicOff, Filter, ListFilter } from 'lucide-react';
import FoodCard from '../components/FoodCard';
import { useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 12;

const CommonMenu: React.FC = () => {
  const { user, addToCart, showNotification } = useAppContext();
  const navigate = useNavigate();
  
  // Navigation State
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeDietaryTag, setActiveDietaryTag] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'default' | 'asc' | 'desc'>('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Voice Search State
  const [isListening, setIsListening] = useState(false);
  const [browserSupportsSpeech, setBrowserSupportsSpeech] = useState(false);

  // Modals
  const [customizationItem, setCustomizationItem] = useState<FoodItem | null>(null);
  const [customizationOptions, setCustomizationOptions] = useState<CoffeeCustomization>({ sugarSpoons: 1, powderLevel: 'Medium', temperature: 'Hot' });
  const [warningModal, setWarningModal] = useState<{show: boolean, item: FoodItem | null, reason: string}>({ show: false, item: null, reason: '' });
  const [pendingQuantity, setPendingQuantity] = useState(1);

  // Favorites State (Read from LS for filtering)
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    // Check Speech Recognition Support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        setBrowserSupportsSpeech(true);
    }

    const loadFavorites = () => {
        try {
            const stored = localStorage.getItem('f66_favorites');
            if (stored) setFavorites(JSON.parse(stored));
        } catch (e) {
            console.error("Error loading favorites", e);
        }
    };
    loadFavorites();
    // Poll for changes in LS to update filter if needed (simple reactivity)
    const interval = setInterval(loadFavorites, 2000);
    return () => clearInterval(interval);
  }, []);

  // Reset page when category, search, or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activeDietaryTag, searchTerm, categorySearch, sortOrder, showFavoritesOnly]);

  const handleVoiceSearch = () => {
    if (!browserSupportsSpeech) return;

    if (isListening) {
        setIsListening(false);
        return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        
        setIsListening(true);

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setSearchTerm(transcript);
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
            if (event.error === 'not-allowed') {
                showNotification('Permission Denied', 'Please allow microphone access to use voice search.', 'error');
            } else {
                showNotification('Voice Search Error', 'Could not understand audio. Please try again.', 'warning');
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    }
  };

  const handleAddToCart = async (item: FoodItem, quantity: number) => {
    // 1. Check for Drink/Item Customization
    if (item.customizationAvailable) {
      setCustomizationItem(item);
      setPendingQuantity(quantity);
      // Reset options to defaults
      setCustomizationOptions({ sugarSpoons: 1, powderLevel: 'Medium', temperature: 'Hot' });
      return;
    }

    // 2. Health Safety Check (AI) - Check if user is in Common Menu and has issues
    if (user?.healthProfile.hasIssues) {
       try {
         const check = await checkFoodSafety(item, user.healthProfile);
         
         if (check.isError) {
             // If AI check failed (network/service), warn via toast but allow add (fail open)
             showNotification(
                 "Safety Check Unavailable", 
                 check.reason || "Network Issue", 
                 "warning"
             );
             addToCart(item, quantity);
             return;
         }

         if (!check.safe) {
             setWarningModal({ show: true, item: item, reason: check.reason || "This might conflict with your condition." });
             setPendingQuantity(quantity);
             return;
         }
       } catch (e) {
         // Fallback if unexpected error occurs
         console.error("Safety check unexpected error", e);
         showNotification("Safety Check Error", "Proceeding without verification.", "error");
         addToCart(item, quantity);
         return;
       }
    }

    addToCart(item, quantity);
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

  const handleClearFilters = () => {
    setActiveCategory('All');
    setCategorySearch('');
    setActiveDietaryTag('All');
    setSearchTerm('');
    setSortOrder('default');
    setShowFavoritesOnly(false);
  };

  // Filter & Sort Logic
  let processedItems = MOCK_MENU.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesDiet = activeDietaryTag === 'All' || (item.dietaryTags && item.dietaryTags.includes(activeDietaryTag as DietaryTag));
    
    const term = searchTerm.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(term) || 
                          item.description.toLowerCase().includes(term) ||
                          (item.ingredients && item.ingredients.some(ing => ing.name.toLowerCase().includes(term))) ||
                          (item.dietaryTags && item.dietaryTags.some(tag => tag.toLowerCase().includes(term)));
                          
    const matchesFav = showFavoritesOnly ? favorites.includes(item.id) : true;
    return matchesCategory && matchesDiet && matchesSearch && matchesFav;
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
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Discover Food</h1>
        <p className="text-gray-500">
            Explore our extensive menu of over 1000+ dishes from across India.
        </p>
      </div>

      {/* Tab Switcher (Navigation) */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 p-1 rounded-full inline-flex shadow-inner">
          <button 
            className="px-6 py-3 rounded-full flex items-center font-semibold transition-all duration-300 bg-white shadow text-orange-600 ring-1 ring-orange-100"
          >
            <Utensils size={18} className="mr-2" /> Common Menu 
            <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">1000+</span>
          </button>
          <button 
             onClick={() => navigate('/recommended-foods')}
             className="px-6 py-3 rounded-full flex items-center font-semibold transition-all duration-300 text-gray-500 hover:text-gray-700 hover:bg-gray-200"
          >
            <Heart size={18} className="mr-2" /> 
            {user?.healthProfile.hasIssues ? 'My Recommendations' : 'Healthy Options'}
            <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded-full text-gray-600">100+</span>
          </button>
        </div>
      </div>

      {/* STICKY FILTER BAR */}
      <div className="sticky top-16 z-40 bg-gray-50/95 backdrop-blur-md shadow-sm border-b border-gray-200 -mx-4 px-4 py-4 mb-6 transition-all">
        <div className="max-w-7xl mx-auto space-y-4">
            
            {/* Top Row: Search and Dropdowns */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                {/* Search Input with Voice */}
                <div className="relative w-full md:w-80 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className={`transition-colors ${isListening ? 'text-orange-500' : 'text-gray-400'}`} size={20} />
                </div>
                <input 
                    type="text"
                    placeholder={isListening ? "Listening..." : "Search dishes, ingredients..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-12 py-2.5 w-full rounded-full border outline-none transition shadow-sm ${
                    isListening 
                        ? 'border-orange-500 ring-2 ring-orange-100 bg-orange-50 text-orange-900 placeholder-orange-400' 
                        : 'border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                    }`}
                />
                
                {browserSupportsSpeech && (
                    <button 
                        onClick={handleVoiceSearch}
                        className={`absolute inset-y-0 right-0 px-4 flex items-center justify-center transition-all duration-200 rounded-r-full ${
                            isListening 
                            ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                            : 'text-gray-400 hover:text-orange-600 hover:bg-gray-50'
                        }`}
                        title={isListening ? "Stop Listening" : "Voice Search"}
                    >
                        {isListening ? (
                            <div className="relative flex items-center justify-center">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <MicOff size={20} className="relative z-10" />
                            </div>
                        ) : (
                            <Mic size={20} />
                        )}
                    </button>
                )}
                </div>
                
                <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 items-center">
                    {/* Favorites Filter */}
                    <button
                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                        className={`flex items-center justify-center px-4 py-2.5 rounded-full font-medium transition whitespace-nowrap border shadow-sm ${showFavoritesOnly ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                    >
                        <Heart size={16} className={`mr-2 ${showFavoritesOnly ? 'fill-current' : ''}`} /> Favorites
                    </button>

                    {/* Dietary Filter */}
                    <div className="relative flex-grow md:flex-grow-0 min-w-[140px]">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                        <Filter size={14} />
                        </div>
                        <select
                            value={activeDietaryTag}
                            onChange={(e) => setActiveDietaryTag(e.target.value)}
                            className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2.5 pl-9 pr-8 rounded-full leading-tight focus:outline-none focus:bg-white focus:border-orange-500 shadow-sm cursor-pointer text-sm"
                        >
                            <option value="All">Dietary (All)</option>
                            <option value="Vegan">Vegan</option>
                            <option value="Gluten-Free">Gluten-Free</option>
                            <option value="High-Protein">High-Protein</option>
                            <option value="Low-Carb">Low-Carb</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                        <ChevronRight size={14} className="rotate-90" />
                        </div>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative flex-grow md:flex-grow-0 min-w-[150px]">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                        <ArrowUpDown size={14} />
                        </div>
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value as any)}
                            className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2.5 pl-9 pr-8 rounded-full leading-tight focus:outline-none focus:bg-white focus:border-orange-500 shadow-sm cursor-pointer text-sm"
                        >
                            <option value="default">Relevance</option>
                            <option value="asc">Price: Low to High</option>
                            <option value="desc">Price: High to Low</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                        <ChevronRight size={14} className="rotate-90" />
                        </div>
                    </div>

                    {/* Clear Filters Button */}
                    {(activeCategory !== 'All' || activeDietaryTag !== 'All' || searchTerm || sortOrder !== 'default' || showFavoritesOnly || categorySearch) && (
                        <button 
                        onClick={handleClearFilters}
                        className="flex items-center justify-center text-red-500 hover:text-red-700 font-medium transition px-4 py-2 rounded-full hover:bg-red-50 bg-white border border-red-100 shadow-sm whitespace-nowrap"
                        >
                        <RotateCcw size={16} className="md:mr-2" /> <span className="hidden md:inline">Reset</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Bottom Row: Categories */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
                 {/* Category Filter Input */}
                 <div className="relative w-full md:w-64 flex-shrink-0">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ListFilter size={16} className="text-gray-400"/>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Filter categories..." 
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs font-medium focus:ring-1 focus:ring-orange-500 outline-none shadow-sm transition-all focus:bg-white"
                    />
                </div>

                <div className="flex overflow-x-auto space-x-2 pb-1 scrollbar-hide w-full">
                    <button onClick={() => setActiveCategory('All')} className={`px-5 py-2 rounded-full whitespace-nowrap transition border text-sm font-medium ${activeCategory === 'All' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>All</button>
                    {Object.values(FoodCategory)
                        .filter(cat => cat.toLowerCase().includes(categorySearch.toLowerCase()))
                        .map(cat => (
                        <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-2 rounded-full whitespace-nowrap transition border text-sm font-medium ${activeCategory === cat ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>{cat}</button>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="mb-4 flex justify-between items-center">
         <h2 className="text-xl font-bold text-gray-700">
            Menu Items ({processedItems.length})
         </h2>
         <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
      </div>

      {processedItems.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-xl">
              <p className="text-gray-500 text-lg mb-2">No items found matching your criteria.</p>
              <p className="text-gray-400 text-sm mb-6">Try adjusting your search or category filter.</p>
              <button onClick={handleClearFilters} className="bg-orange-600 text-white px-6 py-2 rounded-full font-bold hover:bg-orange-700 transition">
                Clear All Filters
              </button>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {paginatedItems.map(item => (
            <FoodCard key={item.id} item={item} onAdd={(qty) => handleAddToCart(item, qty)} recommended={false} />
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

      {/* Health Warning Modal */}
      {warningModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border-l-4 border-amber-500">
             <div className="flex items-start mb-4">
                <AlertTriangle size={32} className="text-amber-500 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Health Alert</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Based on your condition ({user?.healthProfile.diseaseName}), this item might be unsuitable.
                  </p>
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

export default CommonMenu;