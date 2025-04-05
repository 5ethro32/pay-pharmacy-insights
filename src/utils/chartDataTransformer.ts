
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
    
    // Ensure we have a proper date object, using the one from the parent if available
    const monthIndex = getMonthIndex(doc.month);
    const dateObj = doc.dateObj || new Date(doc.year, monthIndex, 1);
    
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
  // Sort by actual date objects for accurate chronological ordering
  return [...chartData].sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
};
