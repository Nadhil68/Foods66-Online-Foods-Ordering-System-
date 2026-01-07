import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogOut, Utensils, Activity, Clock, Heart, Truck, Info } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { DeliveryVehicle } from '../types';

const Navbar: React.FC = () => {
  const { user, cart, logout, deliveryVehicle, setDeliveryVehicle } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-white p-2 rounded-full shadow-md">
              <span className="text-orange-600 font-bold text-xl">F66</span>
            </div>
            <span className="font-bold text-xl tracking-wide text-white drop-shadow-sm">FOODS66</span>
          </Link>

          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <Link to="/about" className={`flex items-center space-x-1 hover:text-orange-100 ${location.pathname === '/about' ? 'text-white font-bold bg-white/20 px-3 py-1 rounded-full' : 'text-orange-50 font-medium'}`}>
                  <Info size={18} />
                  <span className="hidden md:inline">About</span>
                </Link>

                <Link to="/common-foods" className={`flex items-center space-x-1 hover:text-orange-100 ${location.pathname === '/common-foods' ? 'text-white font-bold bg-white/20 px-3 py-1 rounded-full' : 'text-orange-50 font-medium'}`}>
                  <Utensils size={18} />
                  <span className="hidden md:inline">Menu</span>
                </Link>

                <Link to="/recommended-foods" className={`flex items-center space-x-1 hover:text-orange-100 ${location.pathname === '/recommended-foods' ? 'text-white font-bold bg-white/20 px-3 py-1 rounded-full' : 'text-orange-50 font-medium'}`}>
                  <Heart size={18} />
                  <span className="hidden md:inline">Recommended</span>
                </Link>

                <Link to="/orders" className={`flex items-center space-x-1 hover:text-orange-100 ${location.pathname === '/orders' ? 'text-white font-bold bg-white/20 px-3 py-1 rounded-full' : 'text-orange-50 font-medium'}`}>
                  <Clock size={18} />
                  <span className="hidden md:inline">History</span>
                </Link>
                
                <div className="hidden lg:flex items-center bg-black/20 rounded-lg px-2 py-1 border border-white/10">
                   <Truck size={16} className="mr-2 text-orange-200" />
                   <select 
                     value={deliveryVehicle} 
                     onChange={(e) => setDeliveryVehicle(e.target.value as DeliveryVehicle)}
                     className="bg-transparent text-xs font-medium text-white focus:outline-none cursor-pointer border-none outline-none"
                   >
                     <option value="Bike" className="text-gray-800">Bike Delivery</option>
                     <option value="Scooter" className="text-gray-800">Scooter Delivery</option>
                     <option value="Cycle" className="text-gray-800">Cycle Delivery</option>
                     <option value="Walking" className="text-gray-800">Walking Delivery</option>
                   </select>
                </div>

                <Link 
                  to="/cart" 
                  className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 ${
                    totalItems > 0 
                      ? 'bg-white text-orange-600 shadow-md transform hover:scale-105' 
                      : 'text-orange-50 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <ShoppingCart size={20} className={totalItems > 0 ? 'fill-current' : ''} />
                  {totalItems > 0 ? (
                    <span className="font-extrabold text-sm">
                      {totalItems}
                    </span>
                  ) : (
                    <span className="text-sm font-medium hidden sm:inline">Cart</span>
                  )}
                </Link>

                <div className="flex items-center space-x-4 border-l border-white/30 pl-4">
                  <Link to="/profile" className="text-right hidden sm:block group">
                    <div className="flex items-center justify-end gap-2">
                        <p className="text-sm font-medium group-hover:text-orange-100 transition-colors">{user.firstName}</p>
                        {user.healthProfile.hasIssues && (
                           <div className="flex items-center bg-emerald-500/20 text-emerald-100 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-500/30 shadow-sm animate-pulse" title="Health Mode Active">
                              <Activity size={10} className="mr-1" />
                              <span>Health Mode</span>
                           </div>
                        )}
                    </div>
                    <p className="text-xs text-orange-100 group-hover:text-white transition-colors">{user.username}</p>
                  </Link>
                  <button onClick={handleLogout} className="hover:text-red-200 transition-colors" title="Logout">
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/about" className="hover:text-orange-100 font-medium text-white hidden sm:block">About</Link>
                <Link to="/" className="hover:text-orange-100 font-medium text-white">Login</Link>
                <Link to="/register" className="bg-white text-orange-600 px-5 py-2 rounded-full font-bold hover:bg-orange-50 transition shadow-md">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;