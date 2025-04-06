
import React, { createContext, useState, useContext, useEffect } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  showParticleAnimation: boolean;
  setLoading: (loading: boolean) => void;
  setShowParticleAnimation: (show: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: true,
  showParticleAnimation: false,
  setLoading: () => {},
  setShowParticleAnimation: () => {},
});

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showParticleAnimation, setShowParticleAnimation] = useState(false);
  
  // Auto-hide loading after a minimum time (prevents flashing for fast loads)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Auto-hide particle animation after 5 seconds when it's shown
  useEffect(() => {
    if (showParticleAnimation) {
      const timer = setTimeout(() => {
        setShowParticleAnimation(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showParticleAnimation]);

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  return (
    <LoadingContext.Provider value={{ 
      isLoading, 
      showParticleAnimation, 
      setLoading, 
      setShowParticleAnimation 
    }}>
      {children}
    </LoadingContext.Provider>
  );
};
