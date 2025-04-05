
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface UsePharmacyDashboardDataProps {
  view: "summary" | "details" | "financial";
  onLoad?: () => void;
}

export const usePharmacyDashboardData = ({ view, onLoad }: UsePharmacyDashboardDataProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      setHasTimedOut(false);
      
      const controller = new AbortController();
      const signal = controller.signal;
      
      const timeoutId = setTimeout(() => {
        controller.abort();
        setHasTimedOut(true);
        setIsLoading(false);
        
        toast({
          title: "Loading timed out",
          description: "We couldn't load your data in time. Please try again.",
          variant: "destructive",
        });
      }, 8000);
      
      try {
        // Simulate data loading with a more predictable timing
        await new Promise((resolve, reject) => {
          // Use a fixed loading time for testing - in production this would be an actual API call
          const loadTime = 2000; // 2 seconds
          setTimeout(() => resolve(true), loadTime);
        });
        
        clearTimeout(timeoutId);
        setIsLoading(false);
        setHasError(false);
        
        if (onLoad) onLoad();
        
        toast({
          title: "Data loaded successfully",
          description: `Your ${view} view has been updated.`,
          variant: "default",
        });
      } catch (err: any) {
        clearTimeout(timeoutId);
        
        if (err.name === 'AbortError') {
          console.warn('Data loading timed out');
          setHasTimedOut(true);
        } else {
          console.error("Failed to load dashboard data:", err);
          setHasError(true);
          toast({
            title: "Error loading data",
            description: "Please try again or contact support if the issue persists.",
            variant: "destructive",
          });
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      setHasError(true);
      setIsLoading(false);
    }
    
    return () => {};
  }, [view, onLoad, toast]);

  useEffect(() => {
    const loadDataAsync = async () => {
      await loadData();
    };
    
    loadDataAsync();
  }, [loadData]);

  const retryLoading = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    isLoading,
    hasError,
    hasTimedOut,
    retryLoading
  };
};
