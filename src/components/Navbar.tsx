
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  const navigateToDashboard = () => {
    if (window.location.pathname === '/') {
      // If on homepage, scroll to the dashboard section
      const dashboardSection = document.getElementById('dashboard');
      if (dashboardSection) {
        dashboardSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If on another page, navigate to homepage and then to dashboard
      navigate('/#dashboard');
    }
    
    if (isOpen) {
      setIsOpen(false);
    }
  };

  return (
    <nav className="bg-white py-4 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/">
            <span className="text-red-900 font-display font-bold text-2xl">eP</span>
            <span className="ml-0 text-red-800 font-display font-bold text-2xl">Schedule</span>
          </Link>
        </div>
        
        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/#features" className="text-gray-700 hover:text-red-800 font-medium transition-colors">Features</Link>
          <button 
            onClick={navigateToDashboard}
            className="text-gray-700 hover:text-red-800 font-medium transition-colors bg-transparent"
          >
            Dashboard
          </button>
          <Link to="/#benefits" className="text-gray-700 hover:text-red-800 font-medium transition-colors">Benefits</Link>
          <Link to="/demo" className="text-gray-700 hover:text-red-800 font-medium transition-colors">Demo</Link>
          <Button className="bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600 text-white">Get Started</Button>
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-700 hover:text-red-800"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white py-4 px-4 shadow-lg absolute w-full animate-fade-in">
          <div className="flex flex-col space-y-4">
            <Link 
              to="/#features" 
              className="text-gray-700 hover:text-red-800 font-medium transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Features
            </Link>
            <button 
              onClick={navigateToDashboard}
              className="text-left text-gray-700 hover:text-red-800 font-medium transition-colors bg-transparent"
            >
              Dashboard
            </button>
            <Link 
              to="/#benefits" 
              className="text-gray-700 hover:text-red-800 font-medium transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Benefits
            </Link>
            <Link 
              to="/demo" 
              className="text-gray-700 hover:text-red-800 font-medium transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Demo
            </Link>
            <Button className="bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600 text-white w-full">Get Started</Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
