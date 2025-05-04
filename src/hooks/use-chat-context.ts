
import { useLocation } from 'react-router-dom';
import { PaymentData } from '@/types/paymentTypes';
import { MetricKey, METRICS } from '@/constants/chartMetrics';

export function useChatContext(documents: PaymentData[] = [], selectedMetric?: MetricKey) {
  const location = useLocation();
  
  // Extract current page context based on URL
  const getPageContext = (): string => {
    const path = location.pathname;
    
    // Extract basic navigation context
    if (path === '/dashboard') {
      return createDashboardContext(documents, selectedMetric);
    } else if (path.includes('/insights')) {
      return 'The user is viewing AI insights about their pharmacy payments data.';
    } else if (path.includes('/documents')) {
      return 'The user is viewing their uploaded pharmacy payment documents.';
    } else if (path.includes('/upload')) {
      return 'The user is uploading new pharmacy payment documents.';
    }
    
    return 'The user is viewing the Scriptly Analytics dashboard.';
  };
  
  // Create more detailed context for dashboard
  const createDashboardContext = (documents: PaymentData[], selectedMetric?: MetricKey): string => {
    if (!documents.length) {
      return 'The user is viewing the dashboard, but no payment data has been uploaded yet.';
    }
    
    // Get the most recent document
    const sortedDocs = [...documents].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      
      const months = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
      ];
      return months.indexOf(b.month) - months.indexOf(a.month);
    });
    
    const latestDoc = sortedDocs[0];
    const previousDoc = sortedDocs[1];
    
    let context = `The user is viewing their dashboard. Latest data is from ${latestDoc.month} ${latestDoc.year}.`;
    
    // Add metric-specific context if available
    if (selectedMetric) {
      context += ` They are currently viewing the "${METRICS[selectedMetric].label}" metric.`;
    }
    
    // Add trend information if possible
    if (previousDoc && latestDoc.netPayment && previousDoc.netPayment) {
      const change = ((latestDoc.netPayment - previousDoc.netPayment) / previousDoc.netPayment) * 100;
      context += ` Net payment has ${change >= 0 ? 'increased' : 'decreased'} by ${Math.abs(change).toFixed(1)}% compared to ${previousDoc.month} ${previousDoc.year}.`;
    }
    
    return context;
  };
  
  return getPageContext();
}
