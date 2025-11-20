import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  MapPin, 
  AlertCircle, 
  Trophy, 
  User, 
  LogOut, 
  Menu, 
  X,
  Shield,
  Home
} from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <nav className="bg-nepali-blue text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-nepali-red rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl">Rupandehi Samadhan</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="hover:text-nepali-lightblue transition-colors flex items-center space-x-1">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <Link to="/map" className="hover:text-nepali-lightblue transition-colors">
              Map View
            </Link>
            <Link to="/leaderboard" className="hover:text-nepali-lightblue transition-colors">
              Leaderboard
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard" className="hover:text-nepali-lightblue transition-colors">
                  Dashboard
                </Link>
                <Link to="/report" className="bg-nepali-red px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
                  Report Problem
                </Link>
                
                {user.role === 'admin' && (
                  <Link to="/admin" className="flex items-center space-x-1 text-yellow-300">
                    <Shield className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                )}
                
                <div className="relative group">
                  <button className="flex items-center space-x-2">
                    <img 
                      src={user.avatar || '/default-avatar.png'} 
                      alt={user.name}
                      className="w-8 h-8 rounded-full bg-gray-300"
                    />
                    <span>{user.name}</span>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <Link to="/profile" className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100">
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-4 py-2 hover:bg-gray-100 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="hover:text-nepali-lightblue transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-nepali-red px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
                  Register
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-gray-300"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 border-t border-nepali-lightblue">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="hover:text-nepali-lightblue transition-colors" onClick={() => setIsOpen(false)}>
                Home
              </Link>
              <Link to="/map" className="hover:text-nepali-lightblue transition-colors" onClick={() => setIsOpen(false)}>
                Map View
              </Link>
              <Link to="/leaderboard" className="hover:text-nepali-lightblue transition-colors" onClick={() => setIsOpen(false)}>
                Leaderboard
              </Link>
              
              {user ? (
                <>
                  <Link to="/dashboard" className="hover:text-nepali-lightblue transition-colors" onClick={() => setIsOpen(false)}>
                    Dashboard
                  </Link>
                  <Link to="/report" className="bg-nepali-red px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-center" onClick={() => setIsOpen(false)}>
                    Report Problem
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="flex items-center space-x-1 text-yellow-300" onClick={() => setIsOpen(false)}>
                      <Shield className="w-4 h-4" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  <Link to="/profile" className="hover:text-nepali-lightblue transition-colors" onClick={() => setIsOpen(false)}>
                    Profile
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-2 hover:text-nepali-lightblue transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="hover:text-nepali-lightblue transition-colors" onClick={() => setIsOpen(false)}>
                    Login
                  </Link>
                  <Link to="/register" className="bg-nepali-red px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-center" onClick={() => setIsOpen(false)}>
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;