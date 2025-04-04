
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white py-4 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-pharmacy-primary font-display font-bold text-2xl">CPS</span>
          <span className="ml-2 text-pharmacy-dark font-display font-bold text-2xl">eSchedule</span>
        </div>
        
        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-6">
          <a href="#features" className="text-gray-700 hover:text-pharmacy-primary font-medium transition-colors">Features</a>
          <a href="#dashboard" className="text-gray-700 hover:text-pharmacy-primary font-medium transition-colors">Dashboard</a>
          <a href="#benefits" className="text-gray-700 hover:text-pharmacy-primary font-medium transition-colors">Benefits</a>
          <Button className="bg-pharmacy-primary hover:bg-pharmacy-dark text-white">Get Started</Button>
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-700 hover:text-pharmacy-primary"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white py-4 px-4 shadow-lg absolute w-full animate-fade-in">
          <div className="flex flex-col space-y-4">
            <a 
              href="#features" 
              className="text-gray-700 hover:text-pharmacy-primary font-medium transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Features
            </a>
            <a 
              href="#dashboard" 
              className="text-gray-700 hover:text-pharmacy-primary font-medium transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </a>
            <a 
              href="#benefits" 
              className="text-gray-700 hover:text-pharmacy-primary font-medium transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Benefits
            </a>
            <Button className="bg-pharmacy-primary hover:bg-pharmacy-dark text-white w-full">Get Started</Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
