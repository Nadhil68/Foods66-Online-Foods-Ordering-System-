import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { Trash2, ShoppingBag, MapPin, AlertCircle, FileText, Undo, X, Activity, Flame, Dumbbell, Wheat } from 'lucide-react';
import { CartItem } from '../types';
import { PLACEHOLDER_IMAGE } from '../constants';

const Cart: React.FC = () => {
  const { cart, removeFromCart, placeOrder, user, reorder } = useAppContext();
  const navigate = useNavigate();
  const [altAddress, setAltAddress] = useState('');
  const [useAltAddress, setUseAltAddress] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Undo State
  const [undoState, setUndoState] = useState<{ show: boolean; items: CartItem[] }>({ show: false, items: [] });
  const [undoTimer, setUndoTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (undoTimer) clearTimeout(undoTimer);
    };
  }, [undoTimer]);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 40;
  const taxes = Math.round(subtotal * 0.05); // 5% Tax
  const grandTotal = subtotal + deliveryFee + taxes;

  // Nutritional Calculations
  const totalCalories = cart.reduce((acc, item) => acc + (item.calories || 0) * item.quantity, 0);
  const totalProtein = cart.reduce((acc, item) => acc + (item.protein || 0) * item.quantity, 0);
  const totalCarbs = cart.reduce((acc, item) => acc + (item.carbs || 0) * item.quantity, 0);

  // Daily Recommended Guidelines (Approximate)
  const RDI = {
      calories: 2000,
      protein: 50,
      carbs: 275
  };

  const getPercent = (value: number, total: number) => Math.min(100, Math.round((value / total) * 100));

  const handleRemoveItem = (itemToRemove: CartItem) => {
    // Capture all items with this ID
    const items = cart.filter(i => i.id === itemToRemove.id);
    
    // Clear previous timer if exists
    if (undoTimer) clearTimeout(undoTimer);
    
    // Perform Remove
    removeFromCart(itemToRemove.id);
    
    // Show Undo Option
    setUndoState({ show: true, items });
    
    // Set timer to hide
    const timer = setTimeout(() => {
      setUndoState({ show: false, items: [] });
    }, 5000);
    setUndoTimer(timer);
  };

  const handleUndo = () => {
    if (undoState.items.length > 0) {
       reorder(undoState.items);
       setUndoState({ show: false, items: [] });
       if (undoTimer) clearTimeout(undoTimer);
    }
  };

  const handleCheckoutClick = () => {
    const address = useAltAddress ? altAddress : `${user?.address.doorNo}, ${user?.address.landmark}, ${user?.address.district}`;
    if (!address) return alert("Please provide an address");
    
    setShowConfirmation(true);
  };

  const confirmOrder = () => {
    const address = useAltAddress ? altAddress : `${user?.address.doorNo}, ${user?.address.landmark}, ${user?.address.district}`;
    
    placeOrder(address, specialInstructions);
    setShowConfirmation(false);
    // Simulate order processing
    setTimeout(() => {
        navigate('/tracking');
    }, 1000);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <ShoppingBag size={64} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-600 mb-2">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't made your choice yet.</p>
        <button onClick={() => navigate('/menu')} className="bg-orange-600 text-white px-6 py-2 rounded-full font-bold hover:bg-orange-700 transition">Browse Menu</button>
        
        {/* Allow Undo even if cart becomes empty */}
        {undoState.show && (
            <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-4 animate-fadeIn">
               <span className="text-sm font-medium">Item removed from cart</span>
               <button 
                 onClick={handleUndo} 
                 className="text-orange-400 font-bold text-sm flex items-center hover:text-orange-300 transition"
               >
                 <Undo size={16} className="mr-1" /> Undo
               </button>
               <button onClick={() => setUndoState(prev => ({ ...prev, show: false }))} className="ml-2 text-gray-500 hover:text-white">
                 <X size={16} />
               </button>
            </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
              <img 
                src={item.imageUrl || PLACEHOLDER_IMAGE} 
                alt={item.name} 
                className="w-20 h-20 rounded-lg object-cover mr-4 bg-gray-100" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                }}
              />
              <div className="flex-grow">
                <h3 className="font-extrabold text-lg text-gray-900 mb-1">{item.name}</h3>
                <div className="text-sm text-gray-500">
                  Quantity: {item.quantity} | ₹{item.price * item.quantity}
                </div>
                {item.customization && (
                   <div className="text-xs text-amber-700 bg-amber-50 inline-block px-2 py-1 rounded mt-1">
                      {item.customization.temperature}, {item.customization.powderLevel} Strength, {item.customization.sugarSpoons} spoon(s) sugar
                   </div>
                )}
              </div>
              <button onClick={() => handleRemoveItem(item)} className="p-2 text-gray-400 hover:text-red-500 transition">
                <Trash2 size={20} />
              </button>
            </div>
          ))}

          {/* Nutritional Analytics Dashboard */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 mt-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5">
                <Activity size={100} className="text-orange-500"/>
             </div>
             
             <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center relative z-10">
                <Activity size={20} className="mr-2 text-orange-600" /> Nutritional Breakdown
             </h3>

             <div className="space-y-4 relative z-10">
                {/* Calories */}
                <div>
                   <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center font-medium text-gray-700"><Flame size={14} className="mr-1 text-orange-500"/> Calories</span>
                      <span className="text-gray-600"><span className="font-bold text-gray-900">{totalCalories}</span> / {RDI.calories} kcal</span>
                   </div>
                   <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${totalCalories > RDI.calories ? 'bg-red-500' : 'bg-orange-500'}`} 
                        style={{ width: `${getPercent(totalCalories, RDI.calories)}%` }}
                      ></div>
                   </div>
                   {totalCalories > RDI.calories && <p className="text-[10px] text-red-500 mt-1">* Exceeds daily recommended intake</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                   {/* Protein */}
                   <div>
                      <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center font-medium text-gray-700"><Dumbbell size={14} className="mr-1 text-blue-500"/> Protein</span>
                          <span className="text-gray-600"><span className="font-bold text-gray-900">{totalProtein}g</span></span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${getPercent(totalProtein, RDI.protein)}%` }}></div>
                      </div>
                   </div>
                   
                   {/* Carbs */}
                   <div>
                      <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center font-medium text-gray-700"><Wheat size={14} className="mr-1 text-yellow-500"/> Carbs</span>
                          <span className="text-gray-600"><span className="font-bold text-gray-900">{totalCarbs}g</span></span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${totalCarbs > RDI.carbs ? 'bg-red-400' : 'bg-yellow-500'}`} style={{ width: `${getPercent(totalCarbs, RDI.carbs)}%` }}></div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Summary & Address */}
        <div className="lg:col-span-1">
           <div className="bg-white p-6 rounded-xl shadow-lg sticky top-24">
              <h3 className="text-xl font-bold mb-4">Order Summary</h3>
              <div className="flex justify-between mb-2 text-gray-600">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between mb-2 text-gray-600">
                <span>Delivery Fee</span>
                <span>₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between mb-4 text-gray-600">
                <span>Taxes (5%)</span>
                <span>₹{taxes}</span>
              </div>
              <div className="border-t pt-4 flex justify-between font-bold text-lg text-orange-800 mb-6">
                 <span>Total</span>
                 <span>₹{grandTotal}</span>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold mb-2 flex items-center"><MapPin size={16} className="mr-1"/> Delivery Address</h4>
                <div className="space-y-2">
                   <label className="flex items-start p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                     <input type="radio" name="addr" className="mt-1 text-orange-600 focus:ring-orange-500" checked={!useAltAddress} onChange={() => setUseAltAddress(false)} />
                     <div className="ml-2 text-sm">
                       <span className="font-bold block">Registered Address</span>
                       <span className="text-gray-500">{user?.address.doorNo}, {user?.address.landmark}, {user?.address.district}</span>
                     </div>
                   </label>
                   
                   <label className="flex items-start p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                     <input type="radio" name="addr" className="mt-1 text-orange-600 focus:ring-orange-500" checked={useAltAddress} onChange={() => setUseAltAddress(true)} />
                     <div className="ml-2 text-sm w-full">
                       <span className="font-bold block">Alternative Address</span>
                       {useAltAddress && (
                         <textarea className="w-full mt-1 p-2 border rounded text-xs" placeholder="Enter new address..." value={altAddress} onChange={(e) => setAltAddress(e.target.value)} />
                       )}
                     </div>
                   </label>
                </div>
              </div>

              <div className="mb-6">
                 <h4 className="font-semibold mb-2 flex items-center"><FileText size={16} className="mr-1"/> Special Instructions <span className="text-xs text-gray-400 font-normal ml-1">(Optional)</span></h4>
                 <textarea
                   className="w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                   placeholder="E.g., Less spicy, leave at door, call upon arrival..."
                   rows={3}
                   value={specialInstructions}
                   onChange={(e) => setSpecialInstructions(e.target.value)}
                 />
              </div>

              <button onClick={handleCheckoutClick} className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 shadow-md transform active:scale-95 transition">
                Place Order
              </button>
           </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-orange-100 transform transition-all scale-100">
             <div className="flex flex-col items-center text-center mb-6">
                <div className="bg-orange-100 p-3 rounded-full mb-4">
                   <AlertCircle size={32} className="text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Confirm Order</h3>
                <div className="text-gray-500 mt-2 space-y-1">
                  <p>Are you sure you want to place this order?</p>
                  <p className="font-bold text-gray-800">Total: ₹{grandTotal}</p>
                </div>
             </div>
             
             <div className="flex gap-3">
               <button 
                 onClick={() => setShowConfirmation(false)} 
                 className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition"
               >
                 Cancel
               </button>
               <button 
                 onClick={confirmOrder} 
                 className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 shadow-lg hover:shadow-orange-500/30 transition"
               >
                 Yes, Place Order
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Undo Snackbar */}
      {undoState.show && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-4 animate-fadeIn">
           <span className="text-sm font-medium">Item removed from cart</span>
           <button 
             onClick={handleUndo} 
             className="text-orange-400 font-bold text-sm flex items-center hover:text-orange-300 transition"
           >
             <Undo size={16} className="mr-1" /> Undo
           </button>
           <button onClick={() => setUndoState(prev => ({ ...prev, show: false }))} className="ml-2 text-gray-500 hover:text-white">
             <X size={16} />
           </button>
        </div>
      )}
    </div>
  );
};

export default Cart;