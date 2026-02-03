import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaLeaf } from 'react-icons/fa';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('userName'));

  useEffect(() => {
    const handleStorage = () => {
      setIsLoggedIn(!!localStorage.getItem('userName'));
    };
    window.addEventListener('storage', handleStorage);
    // Also update on route change
    handleStorage();
    return () => window.removeEventListener('storage', handleStorage);
  }, [location.pathname]);

  const hidePublicLinks = isLoggedIn && (location.pathname.startsWith('/farmer-dashboard') || location.pathname.startsWith('/agro-dashboard') || location.pathname.startsWith('/marketplace') || location.pathname.startsWith('/my-orders'));

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-[#F7FAFC] shadow-md border-b border-[#E2E8F0] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <FaLeaf className="h-10 w-10 text-[#2F855A] mr-3" />
            <Link to="/" className="text-3xl font-extrabold text-[#2F855A] tracking-tight drop-shadow-sm">
              AgriBudget
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-10">
            {!hidePublicLinks && (
              <Link to="/" className="text-lg font-semibold text-gray-700 hover:text-[#2F855A] transition-colors relative group">
                Home
                <span className="block h-1 bg-[#D69E2E] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200 rounded-full" />
              </Link>
            )}
            {!hidePublicLinks && (
              <>
                <Link to="/about" className="text-lg font-semibold text-gray-700 hover:text-[#2F855A] transition-colors relative group">
                  About
                  <span className="block h-1 bg-[#D69E2E] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200 rounded-full" />
                </Link>
                <Link to="/login" className="text-lg font-semibold text-gray-700 hover:text-[#2F855A] transition-colors relative group">
                  Login
                  <span className="block h-1 bg-[#D69E2E] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200 rounded-full" />
                </Link>
                <button className="ml-4 bg-[#D69E2E] text-white px-6 py-2 rounded-lg font-bold text-lg shadow hover:bg-[#B7791F] transition-colors">
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-[#2F855A] focus:outline-none"
            >
              {isOpen ? <FaTimes size={28} /> : <FaBars size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-[#F7FAFC] border-t border-[#E2E8F0] pb-6">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {!hidePublicLinks && (
                <Link
                  to="/"
                  className="block px-3 py-3 text-lg font-semibold text-gray-700 hover:text-[#2F855A] group"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                  <span className="block h-1 bg-[#D69E2E] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200 rounded-full" />
                </Link>
              )}
              {!hidePublicLinks && (
                <>
                  <Link
                    to="/about"
                    className="block px-3 py-3 text-lg font-semibold text-gray-700 hover:text-[#2F855A] group"
                    onClick={() => setIsOpen(false)}
                  >
                    About
                    <span className="block h-1 bg-[#D69E2E] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200 rounded-full" />
                  </Link>
                  <Link
                    to="/login"
                    className="block px-3 py-3 text-lg font-semibold text-gray-700 hover:text-[#2F855A] group"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                    <span className="block h-1 bg-[#D69E2E] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200 rounded-full" />
                  </Link>
                  <button className="w-full mt-4 bg-[#D69E2E] text-white px-6 py-3 rounded-lg font-bold text-lg shadow hover:bg-[#B7791F] transition-colors">
                    Get Started
                  </button>
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