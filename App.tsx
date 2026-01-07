import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import CommonMenu from './pages/CommonMenu';
import RecommendedMenu from './pages/RecommendedMenu';
import Cart from './pages/Cart';
import Tracking from './pages/Tracking';
import OrderHistory from './pages/OrderHistory';
import Profile from './pages/Profile';
import About from './pages/About';
import ToastContainer from './components/ToastContainer';
import AIChatBot from './components/AIChatBot';
import { AppProvider, useAppContext } from './contexts/AppContext';

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user } = useAppContext();
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const AppContent: React.FC = () => {
  const { user } = useAppContext();
  
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/common-foods" element={
          <ProtectedRoute><CommonMenu /></ProtectedRoute>
        } />
        <Route path="/recommended-foods" element={
          <ProtectedRoute><RecommendedMenu /></ProtectedRoute>
        } />
        {/* Fallback redirect for old /menu path if accessed directly */}
        <Route path="/menu" element={<Navigate to="/common-foods" replace />} />
        
        <Route path="/cart" element={
          <ProtectedRoute><Cart /></ProtectedRoute>
        } />
        <Route path="/tracking" element={
          <ProtectedRoute><Tracking /></ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute><OrderHistory /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
      </Routes>
      <AIChatBot />
      <ToastContainer />
    </>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
};

export default App;