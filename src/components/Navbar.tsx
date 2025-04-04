
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white py-4 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/">
            <span className="text-red-900 font-display font-bold text-2xl">CPS</span>
            <span className="ml-2 text-red-800 font-display font-bold text-2xl">eSchedule</span>
          </Link>
        </div>
        
        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/#features" className="text-gray-700 hover:text-red-800 font-medium transition-colors">Features</Link>
          <Link to="/#dashboard" className="text-gray-700 hover:text-red-800 font-medium transition-colors">Dashboard</Link>
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
            <Link 
              to="/#dashboard" 
              className="text-gray-700 hover:text-red-800 font-medium transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
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
