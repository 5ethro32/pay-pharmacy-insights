
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
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimeouts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      // Clear any previous timeouts
      clearTimeouts();
      
      setIsLoading(true);
      setHasError(false);
      setHasTimedOut(false);
      
      // Set up a timeout for the loading process
      timeoutRef.current = setTimeout(() => {
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
        await new Promise<void>((resolve) => {
          // Use a shorter loading time for testing
          setTimeout(() => resolve(), 2000);
        });
        
        clearTimeouts();
        setIsLoading(false);
        setHasError(false);
        
        if (onLoad) onLoad();
        
        toast({
          title: "Data loaded successfully",
          description: `Your ${view} view has been updated.`,
        });
      } catch (err: any) {
        clearTimeouts();
        
        console.error("Failed to load dashboard data:", err);
        setHasError(true);
        toast({
          title: "Error loading data",
          description: "Please try again or contact support if the issue persists.",
          variant: "destructive",
        });
        
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      clearTimeouts();
      setHasError(true);
      setIsLoading(false);
    }
  }, [view, onLoad, toast, clearTimeouts]);

  useEffect(() => {
    loadData();
    
    return () => {
      clearTimeouts();
    };
  }, [loadData, clearTimeouts]);

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
