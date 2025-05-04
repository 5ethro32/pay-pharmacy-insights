import { PaymentData } from "@/types/paymentTypes";
import { MetricKey, METRICS } from "@/constants/chartMetrics";

// Get the month index (0-11) for a month name
export const getMonthIndex = (monthName: string): number => {
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  
  // Handle uppercase month names (normalize input)
  const normalizedName = monthName.charAt(0).toUpperCase() + monthName.slice(1).toLowerCase();
  const index = months.indexOf(normalizedName);
  
  // If not found, try with all uppercase
  if (index === -1) {
    for (let i = 0; i < months.length; i++) {
      if (months[i].toUpperCase() === monthName.toUpperCase()) {
        return i;
      }
    }
    // If still not found, log an error and return 0 (January)
    console.error(`Invalid month name: ${monthName}`);
    return 0;
  }
  
  return index;
};

// Calculate margin percentage
export const calculateMarginPercent = (doc: PaymentData): number | undefined => {
  const netPayment = doc.netPayment;
  const grossIngredientCost = doc.financials?.grossIngredientCost;
  
  if (netPayment !== undefined && grossIngredientCost !== undefined && grossIngredientCost !== 0) {
    return ((netPayment - grossIngredientCost) / grossIngredientCost) * 100;
  }
  return undefined;
};

// Calculate Y-axis domain with padding
export const calculateDomain = (values: number[]): [number, number] => {
  // Handle empty or invalid arrays safely
  if (!values.length || values.some(v => v === undefined || v === null || isNaN(v))) {
    return [0, 100]; // Default domain if no valid values
  }
  
  // Filter out any potential undefined/null values for safety
  const validValues = values.filter(v => v !== undefined && v !== null && !isNaN(v));
  if (!validValues.length) return [0, 100];
  
  const min = Math.min(...validValues);
  const max = Math.max(...validValues);
  const range = max - min;
  
  // Handle case where all values are the same (flat line)
  if (range === 0) {
    // If the value is 0, use [0, 10] as domain
    if (min === 0) return [0, 10];
    
    // Otherwise create a domain centered around the single value
    // with padding of 10% of the value
    const padding = Math.abs(min) * 0.1;
    return [
      min - padding > 0 ? min - padding : 0, // Don't go below 0 for financial metrics
      max + padding
    ];
  }
  
  // For normal ranges, use padding based on the range itself
  // Use less padding (5%) for financial metrics to make changes more visible
  const paddingFactor = 0.05;
  const padding = range * paddingFactor;
  
  // Calculate a more appropriate minimum value that's closer to the actual data
  // For financial data, we want to start closer to the minimum value
  let lowerBound = min - padding;
  
  // Only go to zero if we're already close to it
  if (lowerBound < 0 || min < max * 0.1) {
    lowerBound = 0;
  }
  
  return [lowerBound, max + padding];
};

// Function to check if two domains are significantly different
// This helps determine if we need to rescale when metrics change
export const areDomainsDifferent = (domain1: [number, number], domain2: [number, number]): boolean => {
  // Ensure valid domains
  if (!domain1 || !domain2 || domain1.length !== 2 || domain2.length !== 2) {
    return true;
  }
  
  // Calculate the relative difference in each bound
  const lowerDiff = Math.abs((domain1[0] - domain2[0]) / (Math.abs(domain1[0]) || 1));
  const upperDiff = Math.abs((domain1[1] - domain2[1]) / (Math.abs(domain1[1]) || 1));
  
  // If either bound differs by more than 20%, consider domains different
  return lowerDiff > 0.2 || upperDiff > 0.2;
};

// New function to categorize metrics by scale
export const categorizeMetricsByScale = (
  metrics: MetricKey[],
  data: any[]
): { primary: MetricKey[], secondary: MetricKey[] } => {
  // Default empty result
  const result = {
    primary: [] as MetricKey[],
    secondary: [] as MetricKey[]
  };
  
  if (!metrics.length || !data.length) {
    return result;
  }
  
  // Get the average value for each metric
  const metricAverages = new Map<MetricKey, number>();
  
  metrics.forEach(metric => {
    const values = data
      .map(item => item[metric])
      .filter(v => v !== undefined && v !== null && !isNaN(v));
      
    if (values.length > 0) {
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      metricAverages.set(metric, avg);
    }
  });
  
  // If we only have one metric, put it in primary
  if (metrics.length === 1) {
    return {
      primary: [metrics[0]],
      secondary: []
    };
  }
  
  // If we have multiple metrics, analyze their scales
  const allAverages = Array.from(metricAverages.values());
  
  // Calculate the ratio between the largest and smallest average
  const maxAvg = Math.max(...allAverages);
  const minAvg = Math.min(...allAverages.filter(v => v > 0)); // Filter out zeros
  const ratio = maxAvg / minAvg;
  
  // If ratio is less than 10, all metrics are similar enough for a single axis
  if (ratio < 10) {
    return {
      primary: [...metrics],
      secondary: []
    };
  }
  
  // Otherwise, categorize metrics based on their scale relative to the median
  const sortedAverages = [...allAverages].sort((a, b) => a - b);
  const medianIndex = Math.floor(sortedAverages.length / 2);
  const medianValue = sortedAverages[medianIndex];
  const threshold = medianValue / 5; // Use 20% of median as threshold
  
  // Categorize each metric
  metrics.forEach(metric => {
    const avg = metricAverages.get(metric) || 0;
    
    // Metrics with larger values go to primary axis, smaller to secondary
    if (avg >= threshold) {
      result.primary.push(metric);
    } else {
      result.secondary.push(metric);
    }
  });
  
  // Handle edge case: If all metrics ended up in one category, move at least one to the other
  if (result.primary.length === 0 && result.secondary.length > 1) {
    // Move the metric with largest average to primary
    const largestMetric = metrics.reduce((prev, curr) => {
      const prevAvg = metricAverages.get(prev) || 0;
      const currAvg = metricAverages.get(curr) || 0;
      return currAvg > prevAvg ? curr : prev;
    }, metrics[0]);
    
    result.primary.push(largestMetric);
    result.secondary = result.secondary.filter(m => m !== largestMetric);
  } else if (result.secondary.length === 0 && result.primary.length > 1) {
    // Move the metric with smallest average to secondary
    const smallestMetric = metrics.reduce((prev, curr) => {
      const prevAvg = metricAverages.get(prev) || 0;
      const currAvg = metricAverages.get(curr) || 0;
      return currAvg < prevAvg ? curr : prev;
    }, metrics[0]);
    
    result.secondary.push(smallestMetric);
    result.primary = result.primary.filter(m => m !== smallestMetric);
  }
  
  return result;
};

// Function to determine which axis a metric belongs to
export const getMetricAxis = (
  metric: MetricKey, 
  primaryMetrics: MetricKey[], 
  secondaryMetrics: MetricKey[]
): "primary" | "secondary" => {
  if (secondaryMetrics.includes(metric)) {
    return "secondary";
  }
  return "primary"; // Default to primary
};
