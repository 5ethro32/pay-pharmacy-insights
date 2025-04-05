
import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface UsePharmacyDashboardDataProps {
  view: "summary" | "details" | "financial";
  onLoad?: () => void;
}

export const usePharmacyDashboardData = ({ view, onLoad }: UsePharmacyDashboardDataProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const clearTimeouts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Safe state updater that checks if component is still mounted
  const safeSetState = useCallback(<T>(setter: React.Dispatch<React.SetStateAction<T>>, value: T) => {
    if (mountedRef.current) {
      setter(value);
    }
  }, []);

  const loadData = useCallback(async () => {
    // Clear any previous timeouts
    clearTimeouts();
    
    // Only set loading state if we're still mounted
    safeSetState(setIsLoading, true);
    safeSetState(setHasError, false);
    safeSetState(setHasTimedOut, false);
    
    // Timeout for loading process (5 seconds)
    timeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        safeSetState(setHasTimedOut, true);
        safeSetState(setIsLoading, false);
        
        toast({
          title: "Loading timed out",
          description: "We couldn't load your data in time. Please try again.",
          variant: "destructive",
        });
      }
    }, 5000);
    
    try {
      // Simulate data loading with a shorter loading time (1 second) for better UX
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 1000);
      });
      
      // Only update state if component is still mounted
      if (mountedRef.current) {
        clearTimeouts();
        safeSetState(setIsLoading, false);
        safeSetState(setHasError, false);
        
        if (onLoad) onLoad();
        
        toast({
          title: "Data loaded successfully",
          description: `Your ${view} view has been updated.`,
        });
      }
    } catch (err) {
      if (mountedRef.current) {
        clearTimeouts();
        console.error("Failed to load dashboard data:", err);
        safeSetState(setHasError, true);
        safeSetState(setIsLoading, false);
        
        toast({
          title: "Error loading data",
          description: "Please try again or contact support if the issue persists.",
          variant: "destructive",
        });
      }
    }
  }, [view, onLoad, toast, clearTimeouts, safeSetState]);

  // Handle component mounting/unmounting
  useEffect(() => {
    // Mark as mounted
    mountedRef.current = true;
    
    // Initial data load
    loadData();
    
    // Cleanup function
    return () => {
      // Mark as unmounted to prevent state updates
      mountedRef.current = false;
      
      // Clear any pending timeouts
      clearTimeouts();
    };
  }, [loadData, clearTimeouts]);

  // Retry loading handler
  const retryLoading = useCallback(() => {
    setRetryCount(prev => prev + 1);
    loadData();
  }, [loadData]);

  return {
    isLoading,
    hasError,
    hasTimedOut,
    retryLoading,
    retryCount
  };
};
