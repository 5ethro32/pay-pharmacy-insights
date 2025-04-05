
import { useState, useEffect } from "react";

interface UsePharmacyDashboardDataProps {
  view: "summary" | "details" | "financial";
  onLoad?: () => void;
}

export const usePharmacyDashboardData = ({ view, onLoad }: UsePharmacyDashboardDataProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    
    const loadData = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        setHasTimedOut(false);
        
        const timeoutId = setTimeout(() => {
          controller.abort();
          setHasTimedOut(true);
        }, 8000);
        
        try {
          await new Promise((resolve, reject) => {
            const loadTime = Math.random() * 1000 + 500;
            setTimeout(() => resolve(true), loadTime);
          });
          
          clearTimeout(timeoutId);
          setIsLoading(false);
          setHasError(false);
          
          if (onLoad) onLoad();
        } catch (err: any) {
          if (err.name === 'AbortError') {
            console.warn('Data loading timed out');
            setHasTimedOut(true);
          } else {
            console.error("Failed to load dashboard data:", err);
            setHasError(true);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        setHasError(true);
        setIsLoading(false);
      }
    };
    
    loadData();
    
    return () => {
      controller.abort();
    };
  }, [view, onLoad]);

  const retryLoading = () => {
    setIsLoading(true);
    setHasError(false);
    setHasTimedOut(false);
  };

  return {
    isLoading,
    hasError,
    hasTimedOut,
    retryLoading
  };
};
