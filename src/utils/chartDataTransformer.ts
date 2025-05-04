
import { PaymentData } from "@/types/paymentTypes";
import { MetricKey } from "@/constants/chartMetrics";
import { getMonthIndex } from "@/utils/chartUtils";

export interface ChartDataPoint {
  name: string;
  fullName: string;
  value: number;
  fullMonth: string;
  year: number;
  dateObj: Date;
}

interface PaymentDataWithDate extends PaymentData {
  dateObj?: Date;
}

export const transformPaymentDataToChartData = (
  sortedDocuments: PaymentDataWithDate[],
  selectedMetric: MetricKey
): ChartDataPoint[] => {
  return sortedDocuments.map(doc => {
    let metricValue: number;
    
    switch(selectedMetric) {
      case "netPayment":
        metricValue = doc.netPayment || 0;
        break;
      case "grossIngredientCost":
        metricValue = doc.financials?.grossIngredientCost || 0;
        break;
      case "supplementaryPayments":
        metricValue = doc.financials?.supplementaryPayments || 0;
        break;
      case "totalItems":
        metricValue = doc.totalItems || 0;
        break;
      case "averageValuePerItem":
        metricValue = doc.totalItems ? 
          (doc.financials?.grossIngredientCost || 0) / doc.totalItems : 0;
        break;
      default:
        metricValue = 0;
    }
    
    const monthIndex = getMonthIndex(doc.month);
    const dateObj = doc.dateObj || new Date(doc.year, monthIndex, 1);
    
    // Use month abbreviation with proper case (Jan, Feb, Mar, etc.)
    const monthAbbrev = doc.month.substring(0, 3);
    const properCaseMonth = monthAbbrev.charAt(0).toUpperCase() + monthAbbrev.slice(1).toLowerCase();
    
    return {
      name: properCaseMonth,
      fullName: `${doc.month} ${doc.year}`,
      value: metricValue,
      fullMonth: doc.month,
      year: doc.year,
      dateObj: dateObj,
    };
  });
};

export const sortChartDataChronologically = (chartData: ChartDataPoint[]): ChartDataPoint[] => {
  return [...chartData].sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
};

// New function to transform data for multi-metric comparison
export const transformDataForMultiMetricComparison = (
  documents: PaymentDataWithDate[],
  selectedMetrics: MetricKey[]
): any[] => {
  // Create a base dataset with time information
  const baseDataPoints = documents.map(doc => {
    const monthIndex = getMonthIndex(doc.month);
    const dateObj = doc.dateObj || new Date(doc.year, monthIndex, 1);
    const monthAbbrev = doc.month.substring(0, 3);
    const properCaseMonth = monthAbbrev.charAt(0).toUpperCase() + monthAbbrev.slice(1).toLowerCase();
    
    return {
      name: properCaseMonth,
      fullName: `${doc.month} ${doc.year}`,
      fullMonth: doc.month,
      year: doc.year,
      dateObj: dateObj
    };
  });
  
  // Sort chronologically
  const sortedBase = [...baseDataPoints].sort((a, b) => 
    a.dateObj.getTime() - b.dateObj.getTime()
  );
  
  // For each base data point, add the metric values
  return sortedBase.map(basePoint => {
    const result = { ...basePoint };
    
    // Find the corresponding document
    const doc = documents.find(d => 
      d.month === basePoint.fullMonth && d.year === basePoint.year
    );
    
    if (doc) {
      // Add a value for each selected metric
      selectedMetrics.forEach(metricKey => {
        let metricValue: number;
        
        switch(metricKey) {
          case "netPayment":
            metricValue = doc.netPayment || 0;
            break;
          case "grossIngredientCost":
            metricValue = doc.financials?.grossIngredientCost || 0;
            break;
          case "supplementaryPayments":
            metricValue = doc.financials?.supplementaryPayments || 0;
            break;
          case "totalItems":
            metricValue = doc.totalItems || 0;
            break;
          case "averageValuePerItem":
            metricValue = doc.totalItems ? 
              (doc.financials?.grossIngredientCost || 0) / doc.totalItems : 0;
            break;
          default:
            metricValue = 0;
        }
        
        result[metricKey] = metricValue;
      });
    }
    
    return result;
  });
};
