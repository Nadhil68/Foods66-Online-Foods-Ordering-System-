import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { CheckCircle } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginUser } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { registered?: boolean; username?: string } | null;
  const registrationSuccess = state?.registered;

  useEffect(() => {
      if (state?.username) {
          setUsername(state.username);
      }
  }, [state]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUser(username, password)) {
      navigate('/common-foods');
    } else {
      setError('Invalid credentials. Please check your username and password.');
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative bg-cover bg-center"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop')" }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-white tracking-tight">
            Sign in to <span className="text-orange-400">FOODS66</span>
          </h2>
          <p className="mt-2 text-sm text-gray-200">
            Or{' '}
            <Link to="/register" className="font-medium text-orange-400 hover:text-orange-300 transition-colors">
              create a new account
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/95 backdrop-blur py-8 px-4 shadow-2xl sm:rounded-xl sm:px-10 border border-white/20">
          
          {registrationSuccess && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center animate-fadeIn">
                  <CheckCircle size={24} className="text-green-500 mr-3" />
                  <div>
                      <h4 className="text-sm font-bold text-green-800">Registration Successful!</h4>
                      <p className="text-xs text-green-700">Your profile is ready. Please sign in below.</p>
                  </div>
              </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg text-center border border-red-100 font-medium">{error}</div>
            )}
            <div>
              <label htmlFor="username" className="block text-sm font-bold text-gray-700">Username</label>
              <div className="mt-1">
                <input id="username" name="username" type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700">Password</label>
              <div className="mt-1">
                <input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
              </div>
            </div>

            <div>
              <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all transform hover:scale-[1.02]">
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;