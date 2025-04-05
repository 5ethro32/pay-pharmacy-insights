
import { PaymentData } from "@/types/paymentTypes";
import { MetricKey } from "@/constants/chartMetrics";
import { getMonthIndex, calculateMarginPercent } from "@/utils/chartUtils";

export interface ChartDataPoint {
  name: string;
  fullName: string;
  value: number;
  fullMonth: string;
  year: number;
  dateObj: Date;
}

export const transformPaymentDataToChartData = (
  sortedDocuments: PaymentData[],
  selectedMetric: MetricKey
): ChartDataPoint[] => {
  return sortedDocuments.map(doc => {
    let metricValue: number | undefined;
    
    switch(selectedMetric) {
      case "netPayment":
        metricValue = doc.netPayment;
        break;
      case "totalItems":
        metricValue = doc.totalItems;
        break;
      case "grossValue":
        metricValue = doc.financials?.averageGrossValue;
        break;
      case "pharmacyFirstTotal":
        metricValue = doc.pfsDetails?.totalPayment || 
                     (doc.financials?.pharmacyFirstBase || 0) + (doc.financials?.pharmacyFirstActivity || 0);
        break;
      case "margin":
        metricValue = calculateMarginPercent(doc);
        break;
      default:
        metricValue = 0;
    }
    
    const monthIndex = getMonthIndex(doc.month);
    const dateObj = new Date(doc.year, monthIndex, 1);
    
    return {
      name: `${doc.month.substring(0, 3)} ${doc.year}`,
      fullName: `${doc.month} ${doc.year}`,
      value: metricValue || 0,
      fullMonth: doc.month,
      year: doc.year,
      dateObj: dateObj,
    };
  });
};

export const sortChartDataChronologically = (chartData: ChartDataPoint[]): ChartDataPoint[] => {
  // IMPORTANT: Sort in true chronological order - oldest to newest
  // This ensures the chart displays dates from left to right in chronological order
  return [...chartData].sort((a, b) => {
    // First compare by year
    if (a.year !== b.year) {
      return a.year - b.year;
    }
    
    // If same year, compare by month index
    const monthIndexA = getMonthIndex(a.fullMonth);
    const monthIndexB = getMonthIndex(b.fullMonth);
    return monthIndexA - monthIndexB;
  });
};
