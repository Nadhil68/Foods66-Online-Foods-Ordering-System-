import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Package, Calendar, MapPin, ArrowRight, XCircle, AlertCircle, Filter, ArrowUpDown, Search, FileText, RefreshCw, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CartItem } from '../types';

const OrderHistory: React.FC = () => {
  const { orders, cancelOrder, reorder } = useAppContext();
  const navigate = useNavigate();
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  
  // Filter & Sort State
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [searchTerm, setSearchTerm] = useState('');

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const handleCancelClick = (orderId: string) => {
    setOrderToCancel(orderId);
  };

  const confirmCancel = () => {
    if (orderToCancel) {
      cancelOrder(orderToCancel);
      setOrderToCancel(null);
    }
  };

  const handleReorder = (items: CartItem[]) => {
      reorder(items);
      // Optional: Navigate to cart to show the user immediately
      navigate('/cart');
  };

  const clearFilters = () => {
    setFilterStatus('All');
    setSearchTerm('');
    setSortOrder('newest');
  };

  // Process Orders: Search -> Filter -> Sort
  const processedOrders = useMemo(() => {
    let result = [...orders];

    // 1. Search (ID or Item Name)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(order => 
        order.id.toLowerCase().includes(term) || 
        order.items.some(item => item.name.toLowerCase().includes(term))
      );
    }

    // 2. Filter Status
    if (filterStatus !== 'All') {
      result = result.filter(order => order.status === filterStatus);
    }

    // 3. Sort
    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [orders, filterStatus, sortOrder, searchTerm]);

  const hasActiveFilters = filterStatus !== 'All' || searchTerm !== '' || sortOrder !== 'newest';

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <Package size={64} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-600 mb-2">No Orders Yet</h2>
        <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
        <button onClick={() => navigate('/menu')} className="bg-orange-600 text-white px-6 py-2 rounded-full font-bold hover:bg-orange-700 transition">
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Order History</h1>
          <p className="text-gray-500 text-sm mt-1">Track and manage your past orders</p>
        </div>
        
        {/* Filter & Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
          
          {/* Search Input */}
          <div className="relative flex-grow sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={16} />
            </div>
            <input 
              type="text"
              placeholder="Search ID or Dish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {/* Status Filter */}
            <div className="relative flex-1 sm:w-40">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Filter size={14} />
                </div>
                <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 appearance-none focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
                >
                <option value="All">All Status</option>
                <option value="Preparing">Preparing</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
                </select>
            </div>

            {/* Date Sort */}
            <div className="relative flex-1 sm:w-40">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <ArrowUpDown size={14} />
                </div>
                <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 appearance-none focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
                >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                </select>
            </div>
          </div>
          
          {/* Clear Filters */}
          {hasActiveFilters && (
            <button 
              onClick={clearFilters}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
              title="Clear Filters"
            >
              <RotateCcw size={18} />
            </button>
          )}
        </div>
      </div>
      
      <div className="space-y-6">
        {processedOrders.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
             <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-gray-400" />
             </div>
             <p className="text-gray-500 font-medium">No orders found matching your filters.</p>
             <button onClick={clearFilters} className="mt-4 text-orange-600 font-bold hover:underline text-sm">
               Reset Filters
             </button>
           </div>
        ) : (
          processedOrders.map((order) => {
            const isCancellable = order.status === 'Preparing' || order.status === 'Out for Delivery';
            
            return (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                {/* Order Header */}
                <div className="bg-gray-50 p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <span className="font-mono bg-white px-2 py-0.5 rounded border text-xs text-gray-500 select-all">{order.id}</span>
                      <span className="flex items-center"><Calendar size={14} className="mr-1"/> {formatDate(order.date)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800 animate-pulse'
                    }`}>
                      {order.status === 'Preparing' && <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>}
                      {order.status}
                    </span>
                    <span className="font-bold text-lg text-gray-900">₹{order.total}</span>
                  </div>
                </div>

                {/* Order Content */}
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Items List */}
                      <div className="md:col-span-2 space-y-3">
                        <h4 className="font-semibold text-gray-700 mb-2">Items Ordered</h4>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                              <div className="flex items-center">
                                <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded mr-3 whitespace-nowrap">{item.quantity}x</span>
                                <div>
                                    <p className="text-gray-800 font-medium">{item.name}</p>
                                    {item.customization && (
                                      <p className="text-xs text-gray-500">
                                        {item.customization.temperature}, {item.customization.sugarSpoons} sugar
                                      </p>
                                    )}
                                </div>
                              </div>
                              <span className="text-gray-600 text-sm whitespace-nowrap ml-2">₹{item.price * item.quantity}</span>
                          </div>
                        ))}

                        {/* Special Instructions Display */}
                        {order.specialInstructions && (
                          <div className="mt-4 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                             <h5 className="text-xs font-bold text-yellow-800 uppercase tracking-wide flex items-center mb-1">
                               <FileText size={12} className="mr-1"/> Note
                             </h5>
                             <p className="text-sm text-yellow-900 italic">"{order.specialInstructions}"</p>
                          </div>
                        )}
                      </div>

                      {/* Delivery Details */}
                      <div className="bg-gray-50 rounded-lg p-4 flex flex-col justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-3 flex items-center"><MapPin size={16} className="mr-2"/> Delivery</h4>
                          <div className="space-y-2 text-sm">
                              <p className="text-gray-600"><span className="font-medium">Partner:</span> {order.deliveryBoy?.name || 'Unassigned'}</p>
                              {order.deliveryBoy && (
                                <p className="text-gray-600"><span className="font-medium">Vehicle:</span> {order.deliveryBoy.vehicle}</p>
                              )}
                          </div>
                        </div>
                        
                        <div className="mt-6 space-y-2">
                            {(order.status === 'Preparing' || order.status === 'Out for Delivery') && (
                              <button onClick={() => navigate('/tracking')} className="w-full flex items-center justify-center text-orange-600 font-bold border border-orange-200 rounded-lg py-2 hover:bg-orange-50 transition shadow-sm">
                                Track Order <ArrowRight size={16} className="ml-1"/>
                              </button>
                            )}
                            
                            {isCancellable && (
                              <button 
                                  onClick={() => handleCancelClick(order.id)}
                                  className="w-full flex items-center justify-center text-red-600 font-bold border border-red-200 rounded-lg py-2 hover:bg-red-50 transition shadow-sm"
                              >
                                  <XCircle size={16} className="mr-1"/> Cancel Order
                              </button>
                            )}

                            {order.status === 'Delivered' && (
                              <button 
                                  onClick={() => handleReorder(order.items)}
                                  className="w-full flex items-center justify-center text-emerald-600 font-bold border border-emerald-200 rounded-lg py-2 hover:bg-emerald-50 transition shadow-sm"
                              >
                                  <RefreshCw size={16} className="mr-1"/> Order Again
                              </button>
                            )}
                        </div>
                      </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cancellation Confirmation Modal */}
      {orderToCancel && (
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
                 onClick={() => setOrderToCancel(null)} 
                 className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition"
               >
                 No, Keep
               </button>
               <button 
                 onClick={confirmCancel} 
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

export default OrderHistory;