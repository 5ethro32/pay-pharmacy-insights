import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSidebar } from "@/components/ui/sidebar";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, toggleSidebar, state, setOpenMobile } = useSidebar();
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  const navigateToDashboard = () => {
    if (window.location.pathname === '/') {
      const dashboardSection = document.getElementById('dashboard');
      if (dashboardSection) {
        dashboardSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (isLoggedIn) {
      sessionStorage.setItem('keepSidebarClosed', 'true');
      window.location.href = '/dashboard';
      if (isMobile) {
        setOpenMobile(false);
      }
      if (isOpen) {
        setIsOpen(false);
      }
    } else {
      navigate('/#dashboard');
    }
    
    if (isOpen) {
      setIsOpen(false);
    }
  };

  const handleLogoClick = () => {
    if (isLoggedIn) {
      sessionStorage.setItem('keepSidebarClosed', 'true');
      window.location.href = '/dashboard';
      if (isMobile) {
        setOpenMobile(false);
      }
      if (isOpen) {
        setIsOpen(false);
      }
    } else {
      navigate('/');
      if (isOpen) {
        setIsOpen(false);
      }
    }
  };

  const isDashboardOrComparison = location.pathname.includes('/dashboard') || location.pathname.includes('/comparison');

  const handleMenuClick = () => {
    if (isDashboardOrComparison) {
      toggleSidebar();
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <nav className="bg-white py-4 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        <div className="flex items-center">
          <button 
            onClick={handleLogoClick}
            className="flex items-center bg-transparent border-none cursor-pointer"
          >
            {isLoggedIn ? (
              <span className="bg-gradient-to-r from-red-800 to-red-600 bg-clip-text text-transparent font-display font-bold text-2xl">Scriptly</span>
            ) : (
              <span className="bg-gradient-to-r from-red-800 to-red-600 bg-clip-text text-transparent font-display font-bold text-2xl">Scriptly RX</span>
            )}
          </button>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/#features" className="text-gray-700 hover:text-red-800 font-medium transition-colors">Features</Link>
          <Link to="/#benefits" className="text-gray-700 hover:text-red-800 font-medium transition-colors">Benefits</Link>
          
          {isLoggedIn ? (
            <Link to="/dashboard">
              <Button className="bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600 text-white">
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600 text-white">
                Sign In
              </Button>
            </Link>
          )}
        </div>
        
        <div className="md:hidden">
          <button 
            onClick={handleMenuClick}
            className="text-gray-700 hover:text-red-800"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {isOpen && !isDashboardOrComparison && (
        <div className="md:hidden bg-white py-4 px-4 shadow-lg absolute w-full animate-fade-in">
          <div className="flex flex-col space-y-4">
            <Link 
              to="/#features" 
              className="text-gray-700 hover:text-red-800 font-medium transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Features
            </Link>
            <Link 
              to="/#benefits" 
              className="text-gray-700 hover:text-red-800 font-medium transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Benefits
            </Link>
            
            {isLoggedIn ? (
              <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                <Button className="bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600 text-white w-full">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/auth" onClick={() => setIsOpen(false)}>
                <Button className="bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600 text-white w-full">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
