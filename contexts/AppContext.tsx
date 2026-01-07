
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, FoodItem, CartItem, Order, DeliveryVehicle, AppNotification, ActionLog } from '../types';
import { MOCK_MENU } from '../constants';
import { getHealthRecommendations, getOfflineHealthRecommendations } from '../services/geminiService';

interface AppContextType {
  user: User | null;
  registerUser: (user: User) => boolean;
  loginUser: (username: string, password?: string) => boolean;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  cart: CartItem[];
  addToCart: (item: FoodItem, qty: number, customization?: any) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  reorder: (items: CartItem[]) => void;
  placeOrder: (deliveryAddress: string, specialInstructions?: string) => void;
  cancelOrder: (orderId: string) => void;
  activeOrder: Order | null;
  orders: Order[];
  deliveryVehicle: DeliveryVehicle;
  setDeliveryVehicle: (vehicle: DeliveryVehicle) => void;
  notifications: AppNotification[];
  showNotification: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeNotification: (id: string) => void;
  
  recommendations: FoodItem[];
  isLoadingRecommendations: boolean;
  isOfflineMode: boolean; 
  recommendationsError: string | null;
  refreshRecommendations: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DB_KEYS = {
  USERS: 'f66_db_users',
  ORDERS: 'f66_db_orders',
  LOGS: 'f66_db_logs',
  SESSION: 'f66_session_user',
  CART_PREFIX: 'f66_cart_',
  RECS_PREFIX: 'f66_recs_'
};

const db = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch { return defaultValue; }
  },
  set<T>(key: string, value: T): void {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { console.error(e); }
  },
  appendLog(username: string, action: ActionLog['action'], details: string) {
    try {
      const logs = db.get<ActionLog[]>(DB_KEYS.LOGS, []);
      db.set(DB_KEYS.LOGS, [{
        id: Date.now().toString(), username, action, details, timestamp: new Date().toISOString()
      }, ...logs].slice(0, 500));
    } catch (e) { console.error(e); }
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => db.get<User | null>(DB_KEYS.SESSION, null));
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [deliveryVehicle, setDeliveryVehicle] = useState<DeliveryVehicle>('Bike');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  
  const [recommendations, setRecommendations] = useState<FoodItem[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const showNotification = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    setNotifications(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => removeNotification(id), 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const fetchRecsInternal = async (targetUser: User, force: boolean) => {
    if (!targetUser.healthProfile.hasIssues || !targetUser.healthProfile.diseaseName) {
        setRecommendations([]);
        return;
    }
    
    setIsLoadingRecommendations(true);
    setRecommendationsError(null);
    const key = `${DB_KEYS.RECS_PREFIX}${targetUser.username}`;

    try {
        // Try Online AI
        const recs = await getHealthRecommendations(targetUser.healthProfile);
        setRecommendations(recs);
        db.set(key, recs);
        setIsOfflineMode(false);
    } catch (e: any) {
        console.warn("AI Service unavailable, switching to Offline Heuristic Engine.", e);
        setIsOfflineMode(true);
        
        // Use Offline Logic
        const offlineRecs = getOfflineHealthRecommendations(targetUser.healthProfile);
        setRecommendations(offlineRecs);
        
        if (force) {
            showNotification('Offline Mode', 'Showing offline recommendations due to network issues.', 'warning');
        }
    } finally {
        setIsLoadingRecommendations(false);
    }
  };

  const loadUserData = (username: string) => {
    setCart(db.get<CartItem[]>(`${DB_KEYS.CART_PREFIX}${username}`, []));
    const allOrders = db.get<Order[]>(DB_KEYS.ORDERS, []);
    const userOrders = allOrders.filter(o => o.username === username);
    setOrders(userOrders);
    const active = userOrders.find(o => o.status === 'Preparing' || o.status === 'Out for Delivery');
    if (active) setActiveOrder(active);
  };

  const refreshRecommendations = async () => {
    if (user) await fetchRecsInternal(user, true);
  };

  useEffect(() => {
    if (user) {
      loadUserData(user.username);
      // Fetch recommendations on load
      fetchRecsInternal(user, false);
    }
  }, []);

  const registerUser = (newUser: User): boolean => {
    const users = db.get<User[]>(DB_KEYS.USERS, []);
    if (users.some(u => u.username.toLowerCase() === newUser.username.toLowerCase())) {
        showNotification('Error', 'Username exists', 'error');
        return false;
    }
    db.set(DB_KEYS.USERS, [...users, newUser]);
    return true;
  };

  const loginUser = (username: string, password?: string): boolean => {
    const users = db.get<User[]>(DB_KEYS.USERS, []);
    const foundUser = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    if (foundUser && (!foundUser.password || foundUser.password === password)) {
        setUser(foundUser);
        db.set(DB_KEYS.SESSION, foundUser);
        loadUserData(foundUser.username);
        fetchRecsInternal(foundUser, false);
        return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setCart([]);
    setOrders([]);
    setRecommendations([]);
    localStorage.removeItem(DB_KEYS.SESSION);
  };

  const updateUser = (updatedUser: User) => {
    const healthChanged = JSON.stringify(user?.healthProfile) !== JSON.stringify(updatedUser.healthProfile);
    setUser(updatedUser);
    db.set(DB_KEYS.SESSION, updatedUser);
    const users = db.get<User[]>(DB_KEYS.USERS, []);
    db.set(DB_KEYS.USERS, users.map(u => u.username === updatedUser.username ? updatedUser : u));
    
    if (healthChanged && updatedUser.healthProfile.hasIssues) {
        fetchRecsInternal(updatedUser, true);
    }
  };

  const addToCart = (item: FoodItem, qty: number, customization?: any) => {
    if (!user) return;
    setCart(prev => {
      const existingIdx = prev.findIndex(p => p.id === item.id && JSON.stringify(p.customization) === JSON.stringify(customization));
      const updated = [...prev];
      if (existingIdx > -1) updated[existingIdx].quantity += qty;
      else updated.push({ ...item, quantity: qty, customization });
      db.set(`${DB_KEYS.CART_PREFIX}${user.username}`, updated);
      return updated;
    });
    showNotification('Added', `${qty}x ${item.name}`, 'success');
  };

  const removeFromCart = (itemId: string) => {
    if (!user) return;
    setCart(prev => {
      const updated = prev.filter(item => item.id !== itemId);
      db.set(`${DB_KEYS.CART_PREFIX}${user.username}`, updated);
      return updated;
    });
  };

  const clearCart = () => {
    if (!user) return;
    setCart([]);
    db.set(`${DB_KEYS.CART_PREFIX}${user.username}`, []);
  };

  const reorder = (items: CartItem[]) => {
    items.forEach(i => addToCart(i, i.quantity, i.customization));
  };

  const placeOrder = (deliveryAddress: string, specialInstructions?: string) => {
    if (!user) return;
    const order: Order = {
      id: `ORD-${Date.now()}`,
      username: user.username,
      date: new Date().toISOString(),
      items: [...cart],
      total: cart.reduce((acc, i) => acc + i.price * i.quantity, 0) + 40 + Math.round(cart.reduce((acc, i) => acc + i.price * i.quantity, 0) * 0.05),
      status: 'Preparing',
      deliveryBoy: { name: 'Ramesh', vehicle: deliveryVehicle, location: { lat: 13.0, lng: 80.2 }, etaMinutes: 25 },
      specialInstructions
    };
    setOrders(prev => [order, ...prev]);
    setActiveOrder(order);
    db.set(DB_KEYS.ORDERS, [order, ...db.get<Order[]>(DB_KEYS.ORDERS, [])]);
    clearCart();
    
    // Simulate Lifecycle
    setTimeout(() => {
        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'Out for Delivery' } : o));
        setActiveOrder(prev => prev?.id === order.id ? { ...prev, status: 'Out for Delivery' } : prev);
        showNotification('Update', 'Order Out for Delivery', 'info');
    }, 10000);
    setTimeout(() => {
        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'Delivered' } : o));
        setActiveOrder(prev => prev?.id === order.id ? { ...prev, status: 'Delivered' } : prev);
        showNotification('Update', 'Order Delivered', 'success');
    }, 20000);
  };

  const cancelOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
    setActiveOrder(prev => prev?.id === orderId ? { ...prev, status: 'Cancelled' } : prev);
    const all = db.get<Order[]>(DB_KEYS.ORDERS, []);
    db.set(DB_KEYS.ORDERS, all.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
    showNotification('Cancelled', 'Order cancelled', 'warning');
  };

  return (
    <AppContext.Provider value={{ 
        user, registerUser, loginUser, logout, updateUser, 
        cart, addToCart, removeFromCart, clearCart, reorder,
        placeOrder, cancelOrder, activeOrder, orders, 
        deliveryVehicle, setDeliveryVehicle,
        notifications, showNotification, removeNotification,
        recommendations, isLoadingRecommendations, isOfflineMode, recommendationsError, refreshRecommendations
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};
