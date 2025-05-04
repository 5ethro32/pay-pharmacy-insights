
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
    
    // Just use month abbreviation without the day number
    const monthAbbrev = doc.month.substring(0, 3).toUpperCase();
    
    return {
      name: monthAbbrev,  // Just month abbreviation, no day
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
