import React, { useEffect, useState, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, MapPin, Phone, User, XCircle, AlertCircle, PackageCheck, Share2, Check } from 'lucide-react';

declare const L: any; // Leaflet global type definition

const Tracking: React.FC = () => {
  const { activeOrder, cancelOrder, user } = useAppContext();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Map Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const driverMarkerRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);

  // Dynamic Locations State
  const [restaurantLoc, setRestaurantLoc] = useState<[number, number] | null>(null);
  const [userLoc, setUserLoc] = useState<[number, number] | null>(null);

  const DEFAULT_CHENNAI_LOC: [number, number] = [13.0827, 80.2707];

  useEffect(() => {
    if (!activeOrder) {
      navigate('/menu');
      return;
    }

    // Determine User Location (Use Real or Default)
    const userLat = user?.address.lat || DEFAULT_CHENNAI_LOC[0];
    const userLng = user?.address.lng || DEFAULT_CHENNAI_LOC[1];
    const uLoc: [number, number] = [userLat, userLng];
    setUserLoc(uLoc);

    // Determine Restaurant Location Dynamically
    // Simulate nearby restaurant (approx 1-3km away) based on User's location
    // This ensures the route looks realistic regardless of where the user registered
    const latOffset = (Math.random() > 0.5 ? 1 : -1) * (0.01 + Math.random() * 0.02); // ~1-3km offset
    const lngOffset = (Math.random() > 0.5 ? 1 : -1) * (0.01 + Math.random() * 0.02);
    const rLoc: [number, number] = [userLat + latOffset, userLng + lngOffset];
    setRestaurantLoc(rLoc);
    
    // Status Logic
    if (activeOrder.status === 'Cancelled') {
        setProgress(0);
        return;
    }

    if (activeOrder.status === 'Delivered') {
        setProgress(100);
        return;
    }

    // Simulate progress visually if not cancelled/delivered
    const timer = setInterval(() => {
      setProgress(old => {
        if (old >= 100) {
          clearInterval(timer);
          return 100;
        }
        return old + 0.5;
      });
    }, 200);

    return () => clearInterval(timer);
  }, [activeOrder, navigate, user]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current || !activeOrder || !restaurantLoc || !userLoc) return;

    // 1. Initialize Map
    const map = L.map(mapContainerRef.current, { zoomControl: false });
    
    // 2. Add OpenStreetMap Tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // 3. Custom Icons
    const createIcon = (iconHtml: string, colorClass: string) => L.divIcon({
        className: 'custom-map-icon',
        html: `<div class="w-8 h-8 ${colorClass} rounded-full border-2 border-white shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 text-base">
                 ${iconHtml}
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });

    const restaurantIcon = createIcon('🏪', 'bg-blue-500 text-white');
    const userIcon = createIcon('🏠', 'bg-orange-600 text-white');
    const driverIcon = createIcon('🛵', 'bg-white text-gray-800 border-orange-500');

    // 4. Add Static Markers (Restaurant & User)
    L.marker(restaurantLoc, { icon: restaurantIcon }).addTo(map).bindPopup("Restaurant: Preparing your food");
    L.marker(userLoc, { icon: userIcon }).addTo(map).bindPopup("Your Location");

    // 5. Draw Route Line
    const routeLine = L.polyline([restaurantLoc, userLoc], {
        color: '#f97316', // Orange-500
        weight: 5,
        opacity: 0.8,
        dashArray: '10, 10',
        lineCap: 'round'
    }).addTo(map);
    routeLineRef.current = routeLine;

    // 6. Fit Bounds to show full route with padding
    const bounds = L.latLngBounds([restaurantLoc, userLoc]);
    map.fitBounds(bounds, { padding: [80, 80] });

    // 7. Add Driver Marker (Starting at Restaurant)
    const driverMarker = L.marker(restaurantLoc, { icon: driverIcon, zIndexOffset: 1000 }).addTo(map);
    driverMarkerRef.current = driverMarker;

    mapInstanceRef.current = map;

    return () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }
    };
  }, [restaurantLoc, userLoc]); // Re-init if locations settle

  // Update Driver Position based on Progress
  useEffect(() => {
    if (!driverMarkerRef.current || !activeOrder || activeOrder.status === 'Cancelled' || !restaurantLoc || !userLoc) return;

    // Calculate interpolated position
    const latDiff = userLoc[0] - restaurantLoc[0];
    const lngDiff = userLoc[1] - restaurantLoc[1];
    
    // Simple Linear Interpolation
    const currentLat = restaurantLoc[0] + (latDiff * (progress / 100));
    const currentLng = restaurantLoc[1] + (lngDiff * (progress / 100));
    
    const newPos = [currentLat, currentLng];
    
    driverMarkerRef.current.setLatLng(newPos);

  }, [progress, userLoc, restaurantLoc]);

  const handleCancelOrder = () => {
    if (activeOrder) {
      cancelOrder(activeOrder.id);
      setShowCancelModal(false);
    }
  };

  const handleShareTracking = () => {
    if (!activeOrder) return;
    
    const textToShare = `Track my FOODS66 order ${activeOrder.id}!\nStatus: ${activeOrder.status}\nETA: ${Math.max(1, activeOrder.deliveryBoy!.etaMinutes - Math.floor(progress / 4))} mins\nDelivery Partner: ${activeOrder.deliveryBoy?.name}`;
    
    navigator.clipboard.writeText(textToShare).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!activeOrder) return null;

  // Handle Cancelled View
  if (activeOrder.status === 'Cancelled') {
      return (
        <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 text-center">
                <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle size={40} className="text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Cancelled</h2>
                <p className="text-gray-500 mb-8">Your order {activeOrder.id} has been cancelled successfully.</p>
                <button onClick={() => navigate('/menu')} className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition">
                    Browse Menu
                </button>
            </div>
        </div>
      );
  }

  // Handle Delivered View
  if (activeOrder.status === 'Delivered') {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 text-center animate-fadeIn">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <PackageCheck size={40} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Delivered!</h2>
              <p className="text-gray-500 mb-8">Enjoy your meal! We hope to serve you again soon.</p>
              <div className="space-y-3">
                 <button onClick={() => navigate('/orders')} className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition">
                     View Receipt
                 </button>
                 <button onClick={() => navigate('/menu')} className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition">
                     Order Again
                 </button>
              </div>
          </div>
      </div>
    );
  }

  const isCancellable = activeOrder.status === 'Preparing' || activeOrder.status === 'Out for Delivery';
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Interactive Map Container */}
        <div className="h-96 relative bg-gray-200 border-b border-gray-200">
            <div ref={mapContainerRef} className="w-full h-full z-0 outline-none"></div>
            
            {/* Live Status Badge */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-2 rounded-lg shadow-md z-[1000] border border-gray-100">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                    </span>
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase leading-none">Live Tracking</p>
                        <p className="text-xs font-bold text-orange-800 leading-none mt-1">Order #{activeOrder.id.slice(-6)}</p>
                    </div>
                </div>
            </div>
            
            {/* Share Button */}
            <button 
                onClick={handleShareTracking}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-md z-[1000] border border-gray-100 text-gray-600 hover:text-orange-600 transition"
                title="Share Tracking Link"
            >
                {copied ? <Check size={20} className="text-green-500" /> : <Share2 size={20} />}
            </button>
            
            <div className="absolute bottom-1 left-1 bg-white/80 px-2 py-0.5 rounded text-[10px] text-gray-500 z-[1000]">
               Leaflet | © OpenStreetMap
            </div>
        </div>

        {/* Order Summary & Details */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Order Placed!</h2>
              <p className="text-orange-600 font-medium mt-1">{activeOrder.status}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">{Math.max(1, activeOrder.deliveryBoy!.etaMinutes - Math.floor(progress / 4))} min</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Estimated Arrival</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-gray-200 p-3 rounded-full mr-4">
                <User size={24} className="text-gray-600"/>
              </div>
              <div>
                <p className="font-bold text-gray-800">{activeOrder.deliveryBoy?.name}</p>
                <p className="text-xs text-gray-500">Delivery Partner ({activeOrder.deliveryBoy?.vehicle})</p>
              </div>
            </div>
            <button className="bg-orange-100 text-orange-700 p-3 rounded-full hover:bg-orange-200 transition">
              <Phone size={20} />
            </button>
          </div>
          
          {/* Items Summary */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
             <h3 className="text-sm font-bold text-gray-700 mb-3 border-b border-gray-100 pb-2">Order Summary</h3>
             <div className="space-y-2 mb-3">
               {activeOrder.items.map((item, idx) => (
                 <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      <span className="font-bold text-gray-800 mr-2">{item.quantity}x</span> 
                      {item.name}
                    </span>
                    <span className="text-gray-800 font-medium">₹{item.price * item.quantity}</span>
                 </div>
               ))}
             </div>
             <div className="flex justify-between border-t border-gray-100 pt-3">
                <span className="font-bold text-gray-800">Total</span>
                <span className="font-bold text-orange-600 text-lg">₹{activeOrder.total}</span>
             </div>
          </div>

          <div className="space-y-4 mb-8">
             <div className="flex items-center text-gray-600">
               <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${progress > 10 ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}>
                 <CheckCircle size={16} />
               </div>
               <span className={progress > 10 ? 'font-medium text-orange-900' : ''}>Order Confirmed</span>
             </div>
             <div className="h-4 w-0.5 bg-gray-200 ml-4"></div>
             <div className="flex items-center text-gray-600">
               <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${progress > 30 ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}>
                 <Clock size={16} />
               </div>
               <span className={progress > 30 ? 'font-medium text-orange-900' : ''}>Preparing Food</span>
             </div>
             <div className="h-4 w-0.5 bg-gray-200 ml-4"></div>
             <div className="flex items-center text-gray-600">
               <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${progress > 60 || activeOrder.status === 'Out for Delivery' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}>
                 <span className="text-sm">🛵</span>
               </div>
               <span className={progress > 60 || activeOrder.status === 'Out for Delivery' ? 'font-medium text-orange-900' : ''}>Out for Delivery</span>
             </div>
          </div>
          
          {isCancellable && (
             <button 
                onClick={() => setShowCancelModal(true)}
                className="w-full flex items-center justify-center text-red-600 font-bold border border-red-200 rounded-xl py-3 hover:bg-red-50 transition"
             >
                <XCircle size={20} className="mr-2"/> Cancel Order
             </button>
          )}

          <div className="mt-4 text-center">
            <button onClick={() => navigate('/menu')} className="text-orange-600 font-medium hover:underline">Place Another Order</button>
          </div>
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-red-100 transform transition-all scale-100">
             <div className="flex flex-col items-center text-center mb-6">
                <div className="bg-red-100 p-3 rounded-full mb-4">
                   <AlertCircle size={32} className="text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Cancel Order?</h3>
                <p className="text-gray-500 mt-2">Are you sure you want to cancel this order? This action cannot be undone.</p>
             </div>
             
             <div className="flex gap-3">
               <button 
                 onClick={() => setShowCancelModal(false)} 
                 className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition"
               >
                 No, Keep
               </button>
               <button 
                 onClick={handleCancelOrder} 
                 className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg hover:shadow-red-500/30 transition"
               >
                 Yes, Cancel
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tracking;