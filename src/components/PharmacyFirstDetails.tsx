import React, { useState, useEffect } from 'react';
import { PFSDetails, PaymentData, Financials } from '@/types/paymentTypes';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  MinusIcon,
  Info,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  Activity,
  AlertCircle,
  Sparkles,
  LineChart,
  Cross,
  Pill,
  Stethoscope,
  Lightbulb,
  DollarSign,
  PoundSterling,
  Brain,
  Calendar,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PharmacyFirstDetailsProps {
  currentData: PaymentData | null;
  previousData: PaymentData | null;
  month: string;
  year: string;
  documents?: PaymentData[];
  onMonthSelect?: (monthKey: string) => void;
}

interface ServiceMetrics {
  treatments: number;
  consultations: number;
  referrals: number;
  totalWeightedActivity: number;
}

interface CategoryData {
  name: string;
  current: number;
  previous: number;
  change: number;
  percentChange: number;
}

interface ComparisonItem {
  name: string;
  value: number;
  previousValue: number | null;
  change: number | null;
  percentChange: number | null;
  trend: 'up' | 'down' | 'neutral';
  contribution: number;
}

interface Insight {
  message: string;
  type: 'positive' | 'negative' | 'neutral' | 'warning' | 'info';
  icon: React.ReactNode;
  title: string;
}

// Fix the type mismatch for payment comparison table
interface PaymentComparisonData extends CategoryData {
  // Add any additional properties needed
}

const PharmacyFirstDetails: React.FC<PharmacyFirstDetailsProps> = ({
  currentData,
  previousData,
  month,
  year,
  documents = [],
  onMonthSelect,
}) => {
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    uti: false,
    impetigo: false,
    shingles: false,
    skinInfection: false,
    hayfever: false
  });
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [localCurrentData, setLocalCurrentData] = useState<PaymentData | null>(currentData);
  const [localPreviousData, setLocalPreviousData] = useState<PaymentData | null>(previousData);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Toggle collapse state
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Toggle detailed sections visibility
  const toggleDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDetails(!showDetails);
  };

  // Set initial selected month when component mounts or when props change
  useEffect(() => {
    if (month && year && !selectedMonth) {
      setSelectedMonth(`${month} ${year}`);
    }
  }, [month, year, selectedMonth]);

  // Update local data when props change
  useEffect(() => {
    setLocalCurrentData(currentData);
    setLocalPreviousData(previousData);
  }, [currentData, previousData]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Helper function to format month names
  const formatMonth = (month: string): string => {
    return month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
  };

  // Helper function to sort documents chronologically
  const sortDocuments = (docs: PaymentData[]) => {
    // Create a more explicit month mapping
    const monthToIndex = {
      'january': 0,
      'february': 1, 
      'march': 2, 
      'april': 3, 
      'may': 4, 
      'june': 5,
      'july': 6, 
      'august': 7, 
      'september': 8, 
      'october': 9, 
      'november': 10, 
      'december': 11
    };
    
    // Create a stable sort with explicit year and month comparison
    return [...docs].sort((a, b) => {
      // First sort by year (descending)
      if (a.year !== b.year) {
        return b.year - a.year;
      }
      
      // Get the month indices with careful normalization
      const aMonth = a.month ? a.month.toLowerCase().trim() : '';
      const bMonth = b.month ? b.month.toLowerCase().trim() : '';
      
      const aMonthIndex = monthToIndex[aMonth] !== undefined ? monthToIndex[aMonth] : -1;
      const bMonthIndex = monthToIndex[bMonth] !== undefined ? monthToIndex[bMonth] : -1;
      
      // If we can't determine the month, fall back to string comparison
      if (aMonthIndex === -1 || bMonthIndex === -1) {
        return aMonth.localeCompare(bMonth);
      }
      
      // Sort months in descending order (December before November)
      return bMonthIndex - aMonthIndex;
    });
  };

  const sortedDocuments = sortDocuments(documents);

  // Function to handle month selection
  const handleMonthSelect = (monthKey: string) => {
    if (monthKey === selectedMonth) return;
    
    setSelectedMonth(monthKey);
    
    // Find the selected document
    const [month, yearStr] = monthKey.split(' ');
    const year = parseInt(yearStr);
    
    const selectedDoc = documents.find(doc => 
      doc.month.toLowerCase() === month.toLowerCase() && doc.year === year
    );
    
    if (selectedDoc) {
      setLocalCurrentData(selectedDoc);
      
      // Find previous month's data
      const sortedDocs = sortDocuments(documents);
      const currentIndex = sortedDocs.findIndex(
        doc => doc.month.toLowerCase() === selectedDoc.month.toLowerCase() && doc.year === selectedDoc.year
      );
      
      if (currentIndex !== -1 && currentIndex < sortedDocs.length - 1) {
        setLocalPreviousData(sortedDocs[currentIndex + 1]);
      } else {
        setLocalPreviousData(null);
      }
      
      // Call parent's onMonthSelect if provided
      if (onMonthSelect) {
        onMonthSelect(monthKey);
      }
    }
  };

  if (!localCurrentData) {
    return (
      <Card>
        <CardHeader className="bg-gradient-to-r from-red-900/90 to-red-700 text-white">
          <CardTitle className="flex items-center">
            <Cross className="mr-2 h-5 w-5" />
            Pharmacy First Service Details
          </CardTitle>
          <CardDescription className="text-white/80">
            No current data available
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { pfsDetails } = localCurrentData;

  if (!pfsDetails) {
    return (
      <Card>
        <CardHeader className="bg-gradient-to-r from-red-900/90 to-red-700 text-white">
          <CardTitle className="flex items-center">
            <Cross className="mr-2 h-5 w-5" />
            Pharmacy First Service Details
          </CardTitle>
          <CardDescription className="text-white/80">
            No PFS details available in current data
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Safely get values with fallbacks to 0
  const safeGet = (obj: any, key: string): number => {
    const value = obj?.[key];
    if (value === undefined || value === null || isNaN(Number(value))) {
      return 0;
    }
    return typeof value === 'string' ? parseFloat(value) : value;
  };

  // Calculate total weighted activity
  const calculateTotalWeightedActivity = (data: PaymentData): number => {
    if (!data?.pfsDetails) return 0;
    
    const treatmentItems = safeGet(data.pfsDetails, 'treatmentWeightedSubtotal');
    const consultationItems = safeGet(data.pfsDetails, 'consultationsWeightedSubtotal');
    const referralItems = safeGet(data.pfsDetails, 'referralsWeightedSubtotal');
    
    // Include UTI
    const utiTreatment = safeGet(data.pfsDetails, 'utiTreatmentWeightedSubtotal');
    const utiConsultation = safeGet(data.pfsDetails, 'utiConsultationsWeightedSubtotal');
    const utiReferral = safeGet(data.pfsDetails, 'utiReferralsWeightedSubtotal');
    
    // Include Impetigo
    const impetigoTreatment = safeGet(data.pfsDetails, 'impetigoTreatmentWeightedSubtotal');
    const impetigoConsultation = safeGet(data.pfsDetails, 'impetigoConsultationsWeightedSubtotal');
    const impetigoReferral = safeGet(data.pfsDetails, 'impetigoReferralsWeightedSubtotal');
    
    // Include Shingles
    const shinglesTreatment = safeGet(data.pfsDetails, 'shinglesTreatmentWeightedSubtotal');
    const shinglesConsultation = safeGet(data.pfsDetails, 'shinglesConsultationsWeightedSubtotal');
    const shinglesReferral = safeGet(data.pfsDetails, 'shinglesReferralsWeightedSubtotal');
    
    // Include Skin Infection
    const skinInfectionTreatment = safeGet(data.pfsDetails, 'skinInfectionWeightedSubtotal');
    const skinInfectionConsultation = safeGet(data.pfsDetails, 'skinInfectionConsultationsWeightedSubtotal');
    const skinInfectionReferral = safeGet(data.pfsDetails, 'skinInfectionReferralsWeightedSubtotal');
    
    // Include Hayfever
    const hayfeverTreatment = safeGet(data.pfsDetails, 'hayfeverWeightedSubtotal');
    const hayfeverConsultation = safeGet(data.pfsDetails, 'hayfeverConsultationsWeightedSubtotal');
    const hayfeverReferral = safeGet(data.pfsDetails, 'hayfeverReferralsWeightedSubtotal');
    
    return treatmentItems + consultationItems + referralItems +
           utiTreatment + utiConsultation + utiReferral +
           impetigoTreatment + impetigoConsultation + impetigoReferral +
           shinglesTreatment + shinglesConsultation + shinglesReferral +
           skinInfectionTreatment + skinInfectionConsultation + skinInfectionReferral +
           hayfeverTreatment + hayfeverConsultation + hayfeverReferral;
  };

  // Calculate service metrics
  const calculateServiceMetrics = (data: PaymentData): ServiceMetrics => {
    if (!data?.pfsDetails) {
      return {
        treatments: 0,
        consultations: 0,
        referrals: 0,
        totalWeightedActivity: 0,
      };
    }
    
    const pfs = data.pfsDetails;
    
    const treatments = safeGet(pfs, 'treatmentItems') +
                       safeGet(pfs, 'utiTreatmentItems') +
                       safeGet(pfs, 'impetigoTreatmentItems') +
                       safeGet(pfs, 'shinglesTreatmentItems') +
                       safeGet(pfs, 'skinInfectionItems') +
                       safeGet(pfs, 'hayfeverItems');
                       
    const consultations = safeGet(pfs, 'consultations') +
                          safeGet(pfs, 'utiConsultations') +
                          safeGet(pfs, 'impetigoConsultations') +
                          safeGet(pfs, 'shinglesConsultations') +
                          safeGet(pfs, 'skinInfectionConsultations') +
                          safeGet(pfs, 'hayfeverConsultations');
                          
    const referrals = safeGet(pfs, 'referrals') +
                      safeGet(pfs, 'utiReferrals') +
                      safeGet(pfs, 'impetigoReferrals') +
                      safeGet(pfs, 'shinglesReferrals') +
                      safeGet(pfs, 'skinInfectionReferrals') +
                      safeGet(pfs, 'hayfeverReferrals');
    
    return {
      treatments,
      consultations,
      referrals,
      totalWeightedActivity: calculateTotalWeightedActivity(data),
    };
  };

  // Calculate financial metrics
  const getFinancialValue = (data: PaymentData, key: keyof Financials): number => {
    if (!data?.financials) return 0;
    return safeGet(data.financials, key);
  };

  const currentMetrics = calculateServiceMetrics(localCurrentData);
  const previousMetrics = localPreviousData ? calculateServiceMetrics(localPreviousData) : null;

  // Calculate payment components
  const currentBase = getFinancialValue(localCurrentData, 'pharmacyFirstBase');
  const currentActivity = getFinancialValue(localCurrentData, 'pharmacyFirstActivity');
  const currentTotal = currentBase + currentActivity;

  const previousBase = localPreviousData ? getFinancialValue(localPreviousData, 'pharmacyFirstBase') : 0;
  const previousActivity = localPreviousData ? getFinancialValue(localPreviousData, 'pharmacyFirstActivity') : 0;
  const previousTotal = previousBase + previousActivity;

  // Calculate percentage changes
  const calculatePercentChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // Determine trend direction
  const getTrend = (percentChange: number): 'up' | 'down' | 'neutral' => {
    if (percentChange > 0) return 'up';
    if (percentChange < 0) return 'down';
    return 'neutral';
  };

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(value);
  };

  // Format percentage
  const formatPercent = (value: number): string => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // Generate comparison data
  const paymentComparison: ComparisonItem[] = [
    {
      name: 'Base Payment',
      value: currentBase,
      previousValue: previousBase,
      change: currentBase - previousBase,
      percentChange: calculatePercentChange(currentBase, previousBase),
      trend: getTrend(calculatePercentChange(currentBase, previousBase)),
      contribution: (currentBase - previousBase) / (currentTotal - previousTotal) * 100,
    },
    {
      name: 'Activity Payment',
      value: currentActivity,
      previousValue: previousActivity,
      change: currentActivity - previousActivity,
      percentChange: calculatePercentChange(currentActivity, previousActivity),
      trend: getTrend(calculatePercentChange(currentActivity, previousActivity)),
      contribution: (currentActivity - previousActivity) / (currentTotal - previousTotal) * 100,
    },
    {
      name: 'Total Payment',
      value: currentTotal,
      previousValue: previousTotal,
      change: currentTotal - previousTotal,
      percentChange: calculatePercentChange(currentTotal, previousTotal),
      trend: getTrend(calculatePercentChange(currentTotal, previousTotal)),
      contribution: 100,
    },
  ];

  // Activity metrics comparison
  const activityComparison: CategoryData[] = [
    {
      name: 'Treatment Items',
      current: currentMetrics.treatments,
      previous: previousMetrics?.treatments || 0,
      change: currentMetrics.treatments - (previousMetrics?.treatments || 0),
      percentChange: calculatePercentChange(
        currentMetrics.treatments, 
        previousMetrics?.treatments || 0
      ),
    },
    {
      name: 'Consultation Items',
      current: currentMetrics.consultations,
      previous: previousMetrics?.consultations || 0,
      change: currentMetrics.consultations - (previousMetrics?.consultations || 0),
      percentChange: calculatePercentChange(
        currentMetrics.consultations, 
        previousMetrics?.consultations || 0
      ),
    },
    {
      name: 'Referral Items',
      current: currentMetrics.referrals,
      previous: previousMetrics?.referrals || 0,
      change: currentMetrics.referrals - (previousMetrics?.referrals || 0),
      percentChange: calculatePercentChange(
        currentMetrics.referrals, 
        previousMetrics?.referrals || 0
      ),
    },
    {
      name: 'Total Weighted Activity',
      current: currentMetrics.totalWeightedActivity,
      previous: previousMetrics?.totalWeightedActivity || 0,
      change: currentMetrics.totalWeightedActivity - (previousMetrics?.totalWeightedActivity || 0),
      percentChange: calculatePercentChange(
        currentMetrics.totalWeightedActivity, 
        previousMetrics?.totalWeightedActivity || 0
      ),
    }
  ];

  // Generate service-specific metrics
  const generateServiceMetrics = (service: string) => {
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    const servicePrefix = service.charAt(0).toLowerCase() + service.slice(1);
    
    const treatmentItems = safeGet(localCurrentData.pfsDetails!, `${servicePrefix}TreatmentItems`);
    const consultations = safeGet(localCurrentData.pfsDetails!, `${servicePrefix}Consultations`);
    const referrals = safeGet(localCurrentData.pfsDetails!, `${servicePrefix}Referrals`);
    const treatmentWeighted = safeGet(localCurrentData.pfsDetails!, `${servicePrefix}TreatmentWeightedSubtotal`);
    const consultationWeighted = safeGet(localCurrentData.pfsDetails!, `${servicePrefix}ConsultationsWeightedSubtotal`);
    const referralWeighted = safeGet(localCurrentData.pfsDetails!, `${servicePrefix}ReferralsWeightedSubtotal`);
    
    const prevTreatmentItems = localPreviousData ? safeGet(localPreviousData.pfsDetails!, `${servicePrefix}TreatmentItems`) : 0;
    const prevConsultations = localPreviousData ? safeGet(localPreviousData.pfsDetails!, `${servicePrefix}Consultations`) : 0;
    const prevReferrals = localPreviousData ? safeGet(localPreviousData.pfsDetails!, `${servicePrefix}Referrals`) : 0;
    const prevTreatmentWeighted = localPreviousData ? safeGet(localPreviousData.pfsDetails!, `${servicePrefix}TreatmentWeightedSubtotal`) : 0;
    const prevConsultationWeighted = localPreviousData ? safeGet(localPreviousData.pfsDetails!, `${servicePrefix}ConsultationsWeightedSubtotal`) : 0;
    const prevReferralWeighted = localPreviousData ? safeGet(localPreviousData.pfsDetails!, `${servicePrefix}ReferralsWeightedSubtotal`) : 0;
    
    return [
      {
        name: 'Treatment Items',
        current: treatmentItems,
        previous: prevTreatmentItems,
        change: treatmentItems - prevTreatmentItems,
        percentChange: calculatePercentChange(treatmentItems, prevTreatmentItems),
      },
      {
        name: 'Consultation Items',
        current: consultations,
        previous: prevConsultations,
        change: consultations - prevConsultations,
        percentChange: calculatePercentChange(consultations, prevConsultations),
      },
      {
        name: 'Referral Items',
        current: referrals,
        previous: prevReferrals,
        change: referrals - prevReferrals,
        percentChange: calculatePercentChange(referrals, prevReferrals),
      },
      {
        name: 'Weighted Treatment Items',
        current: treatmentWeighted,
        previous: prevTreatmentWeighted,
        change: treatmentWeighted - prevTreatmentWeighted,
        percentChange: calculatePercentChange(treatmentWeighted, prevTreatmentWeighted),
      },
      {
        name: 'Weighted Consultation Items',
        current: consultationWeighted,
        previous: prevConsultationWeighted,
        change: consultationWeighted - prevConsultationWeighted,
        percentChange: calculatePercentChange(consultationWeighted, prevConsultationWeighted),
      },
      {
        name: 'Weighted Referral Items',
        current: referralWeighted,
        previous: prevReferralWeighted,
        change: referralWeighted - prevReferralWeighted,
        percentChange: calculatePercentChange(referralWeighted, prevReferralWeighted),
      }
    ];
  };

  // Generate insights
  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];

    // Total payment insight
    const totalChange = paymentComparison[2].change || 0;
    if (Math.abs(totalChange) > 0) {
      insights.push({
        title: `${totalChange > 0 ? 'Increased' : 'Decreased'} Pharmacy First Payments`,
        message: `Total Pharmacy First payments ${totalChange > 0 ? 'increased' : 'decreased'} by ${formatCurrency(Math.abs(totalChange))} (${formatPercent(paymentComparison[2].percentChange || 0)}) compared to previous period.`,
        type: totalChange > 0 ? 'positive' : 'negative',
        icon: totalChange > 0 ? <Sparkles className="h-5 w-5 text-emerald-500" /> : <AlertCircle className="h-5 w-5 text-rose-500" />,
      });
    }

    // Activity related insights
    const activityChange = activityComparison[3].change;
    if (Math.abs(activityChange) > 0) {
      insights.push({
        title: `${activityChange > 0 ? 'Increased' : 'Decreased'} Weighted Activity`,
        message: `Total weighted activity ${activityChange > 0 ? 'increased' : 'decreased'} by ${activityChange.toFixed(1)} (${formatPercent(activityComparison[3].percentChange)}).`,
        type: activityChange > 0 ? 'positive' : 'negative',
        icon: activityChange > 0 ? <Sparkles className="h-5 w-5 text-emerald-500" /> : <AlertCircle className="h-5 w-5 text-rose-500" />,
      });
    }

    // Find biggest contributing factor
    const activityItems = activityComparison.slice(0, 3);
    let biggestChange = { name: '', percentChange: 0 };
    
    activityItems.forEach(item => {
      if (Math.abs(item.percentChange) > Math.abs(biggestChange.percentChange)) {
        biggestChange = item;
      }
    });

    if (biggestChange.name && Math.abs(biggestChange.percentChange) > 5) {
      insights.push({
        title: `Significant Change in ${biggestChange.name}`,
        message: `${biggestChange.name} showed the largest change with a ${formatPercent(biggestChange.percentChange)}.`,
        type: biggestChange.percentChange > 0 ? 'positive' : 'negative',
        icon: biggestChange.percentChange > 0 ? <Sparkles className="h-5 w-5 text-emerald-500" /> : <AlertCircle className="h-5 w-5 text-rose-500" />,
      });
    }

    return insights;
  };

  const insights = generateInsights();

  const getInsightBgColor = (type: string) => {
    switch (type) {
      case 'positive': return 'bg-green-50 border-green-200';
      case 'negative': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-amber-50 border-amber-200';
      case 'neutral': return 'bg-gray-50 border-gray-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const renderTrendIcon = (trend: 'up' | 'down' | 'neutral'): React.ReactNode => {
    if (trend === 'up') {
      return <ArrowUpIcon className="h-4 w-4 text-emerald-500" />;
    } else if (trend === 'down') {
      return <ArrowDownIcon className="h-4 w-4 text-rose-500" />;
    } else if (trend === 'neutral') {
      return <MinusIcon className="h-4 w-4 text-gray-500" />;
    }
    // Default case to handle any unexpected values
    return <MinusIcon className="h-4 w-4 text-gray-500" />;
  };

  // Update the renderActivityMetricsTable function to accept both types
  const renderActivityMetricsTable = (metrics: CategoryData[] | ComparisonItem[]) => {
    // Determine what kind of data we're dealing with
    const isComparisonItem = 'value' in (metrics[0] as ComparisonItem);
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left">
              <th className="pb-2 font-medium">{isComparisonItem ? 'Component' : 'Metric'}</th>
              <th className="pb-2 font-medium text-right">Current</th>
              {localPreviousData && <th className="pb-2 font-medium text-right">Previous</th>}
              {localPreviousData && <th className="pb-2 font-medium text-right">Change</th>}
              {localPreviousData && <th className="pb-2 font-medium text-right">% Change</th>}
            </tr>
          </thead>
          <TableBody>
            {metrics.map((item, index) => {
              if (isComparisonItem) {
                const compItem = item as ComparisonItem;
                const isTotal = compItem.name.includes('Total');
                
                return (
                  <TableRow key={index} className={isTotal ? 'font-bold' : ''}>
                    <TableCell>{compItem.name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(compItem.value)}</TableCell>
                    {localPreviousData && (
                      <>
                        <TableCell className="text-right">
                          {compItem.previousValue !== null ? formatCurrency(compItem.previousValue) : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          {compItem.change !== null ? (
                            <div className="flex items-center justify-end gap-1">
                              {renderTrendIcon(compItem.trend)}
                              {formatCurrency(Math.abs(compItem.change || 0))}
                            </div>
                          ) : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          {compItem.percentChange !== null ? (
                            <div className="flex items-center justify-end gap-1">
                              {renderTrendIcon(compItem.trend)}
                              {formatPercent(compItem.percentChange)}
                            </div>
                          ) : 'N/A'}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                );
              } else {
                const catItem = item as CategoryData;
                const isTotal = catItem.name.includes('Total');
                const changeType = catItem.change > 0 ? 'positive' : catItem.change < 0 ? 'negative' : 'neutral';
                
                return (
                  <TableRow key={index} className={isTotal ? 'font-bold' : ''}>
                    <TableCell>{catItem.name}</TableCell>
                    <TableCell className="text-right">
                      {catItem.name.includes('Payment') ? formatCurrency(catItem.current) : catItem.current.toFixed(1)}
                    </TableCell>
                    {localPreviousData && (
                      <>
                        <TableCell className="text-right">
                          {catItem.name.includes('Payment') ? formatCurrency(catItem.previous) : catItem.previous.toFixed(1)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {changeType === 'positive' ? (
                              <ArrowUpIcon className="h-4 w-4 text-emerald-600" />
                            ) : changeType === 'negative' ? (
                              <ArrowDownIcon className="h-4 w-4 text-rose-600" />
                            ) : (
                              <MinusIcon className="h-4 w-4 text-gray-500" />
                            )}
                            {catItem.name.includes('Payment') 
                              ? formatCurrency(Math.abs(catItem.change)) 
                              : Math.abs(catItem.change).toFixed(1)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {changeType === 'positive' ? (
                              <ArrowUpIcon className="h-4 w-4 text-emerald-600" />
                            ) : changeType === 'negative' ? (
                              <ArrowDownIcon className="h-4 w-4 text-rose-600" />
                            ) : (
                              <MinusIcon className="h-4 w-4 text-gray-500" />
                            )}
                            <span className={changeType === 'positive' ? 'text-emerald-600' : changeType === 'negative' ? 'text-rose-600' : 'text-gray-500'}>
                              {formatPercent(catItem.percentChange)}
                            </span>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                );
              }
            })}
          </TableBody>
        </table>
      </div>
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-white border-b cursor-pointer py-4" onClick={toggleCollapse}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold flex items-center text-gray-900">
            <Stethoscope className="mr-2 h-5 w-5 text-red-800" />
            Pharmacy First Service Details
          </CardTitle>
          <div className="flex items-center">
            {documents.length > 0 && (
              <div className="mr-2" onClick={(e) => e.stopPropagation()}>
                <Select
                  value={selectedMonth || ""}
                  onValueChange={handleMonthSelect}
                >
                  <SelectTrigger className="w-[180px] bg-white text-gray-900">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedDocuments.map((doc) => (
                      <SelectItem 
                        key={`${doc.month}-${doc.year}`} 
                        value={`${doc.month} ${doc.year}`}
                      >
                        {formatMonth(doc.month)} {doc.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {isCollapsed && insights.length > 0 && (
              <span className="ml-2 flex items-center text-foreground/80 text-sm">
                <Sparkles className="h-3.5 w-3.5 text-amber-500 mr-1" />
                {insights[0]?.type === 'positive' 
                  ? `${formatCurrency(currentTotal)} total, up ${formatPercent(paymentComparison[2].percentChange || 0)}`
                  : insights[0]?.type === 'negative'
                    ? `${formatCurrency(currentTotal)} total, down ${formatPercent(Math.abs(paymentComparison[2].percentChange || 0))}`
                    : `${currentMetrics.treatments + currentMetrics.consultations + currentMetrics.referrals} items processed`}
              </span>
            )}
            <Button variant="ghost" size="sm" className="ml-2 p-0 h-auto" onClick={(e) => {
              e.stopPropagation();
              toggleCollapse();
            }}>
              {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="space-y-6 pt-6">
          {/* AI Insights Banner */}
          <div className="overflow-hidden rounded-lg">
            <div className="bg-gradient-to-r from-red-900/90 to-red-700 text-white py-4 px-6">
              <div className="flex items-center text-xl">
                <Sparkles className="mr-2 h-5 w-5" />
                AI Insights & Analysis
              </div>
            </div>
          </div>

          {/* Insights Cards */}
          {insights.length > 0 && (
            <div className="grid gap-4 md:grid-cols-3">
              {insights.map((insight, index) => (
                <Card
                  key={index}
                  className={cn(
                    "border-l-4",
                    getInsightBgColor(insight.type)
                  )}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base font-medium">
                      {insight.type === "positive" && <Sparkles className="h-4 w-4 text-emerald-500" />}
                      {insight.type === "negative" && <AlertCircle className="h-4 w-4 text-rose-500" />}
                      {insight.type === "neutral" && <Pill className="h-4 w-4 text-gray-500" />}
                      {insight.type === "warning" && <AlertCircle className="h-4 w-4 text-amber-500" />}
                      {insight.type === "info" && <Stethoscope className="h-4 w-4 text-blue-500" />}
                      {insight.title}
                    </CardTitle>
                    <CardDescription className="text-foreground/80">{insight.message}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}

          {/* Main metrics cards - Always visible when not collapsed */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">Total Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(currentTotal)}</div>
                {localPreviousData && (
                  <div className="flex items-center pt-1">
                    {renderTrendIcon(paymentComparison[2].trend)}
                    <span className="text-sm ml-1">
                      {formatPercent(paymentComparison[2].percentChange || 0)} from previous month
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">Total Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(currentMetrics.treatments + currentMetrics.consultations + currentMetrics.referrals).toLocaleString()}
                </div>
                {localPreviousData && (
                  <div className="flex items-center pt-1">
                    {getTrend((currentMetrics.treatments + currentMetrics.consultations + currentMetrics.referrals) - 
                             (previousMetrics?.treatments || 0 + previousMetrics?.consultations || 0 + previousMetrics?.referrals || 0)) === 'up' 
                      ? <ArrowUpIcon className="h-4 w-4 text-emerald-500" />
                      : getTrend((currentMetrics.treatments + currentMetrics.consultations + currentMetrics.referrals) - 
                               (previousMetrics?.treatments || 0 + previousMetrics?.consultations || 0 + previousMetrics?.referrals || 0)) === 'down'
                        ? <ArrowDownIcon className="h-4 w-4 text-rose-500" />
                        : <MinusIcon className="h-4 w-4 text-gray-500" />
                    }
                    <span className="text-sm ml-1">
                      {formatPercent(calculatePercentChange(
                        (currentMetrics.treatments + currentMetrics.consultations + currentMetrics.referrals),
                        (previousMetrics?.treatments || 0) + (previousMetrics?.consultations || 0) + (previousMetrics?.referrals || 0)
                      ))} from previous month
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">Weighted Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentMetrics.totalWeightedActivity.toLocaleString()}</div>
                {localPreviousData && (
                  <div className="flex items-center pt-1">
                    {getTrend(currentMetrics.totalWeightedActivity - (previousMetrics?.totalWeightedActivity || 0)) === 'up' 
                      ? <ArrowUpIcon className="h-4 w-4 text-emerald-500" />
                      : getTrend(currentMetrics.totalWeightedActivity - (previousMetrics?.totalWeightedActivity || 0)) === 'down'
                        ? <ArrowDownIcon className="h-4 w-4 text-rose-500" />
                        : <MinusIcon className="h-4 w-4 text-gray-500" />
                    }
                    <span className="text-sm ml-1">
                      {formatPercent(calculatePercentChange(
                        currentMetrics.totalWeightedActivity,
                        previousMetrics?.totalWeightedActivity || 0
                      ))} from previous month
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Show More Button */}
          <div className="pt-2">
            <Button 
              variant="outline" 
              onClick={toggleDetails}
              className="w-full flex items-center justify-center py-2"
            >
              {showDetails ? "Show Less" : "Show More Details"}
              {showDetails ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
            </Button>
          </div>

          {/* Detailed content - only shown when expanded AND showDetails is true */}
          {showDetails && (
            <>
              {/* Tabs for Payment and Activity */}
              <Tabs defaultValue="payment" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="payment">
                    Payment Components
                  </TabsTrigger>
                  <TabsTrigger value="activity">
                    Activity Metrics
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="payment" className="mt-4">
                  <Card className="col-span-12 md:col-span-6">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-base font-medium">
                        Payment Components Analysis
                      </CardTitle>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-gray-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Breakdown of financial components</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardHeader>
                    <CardContent>
                      {renderActivityMetricsTable(paymentComparison)}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="activity" className="mt-4">
                  <Card className="col-span-12 md:col-span-6">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-base font-medium">
                        Activity Metrics
                      </CardTitle>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-gray-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Breakdown of service metrics</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardHeader>
                    <CardContent>
                      {renderActivityMetricsTable(activityComparison)}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Service-specific sections in a single card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>
                    Service Breakdown
                  </CardTitle>
                  <CardDescription>Detailed metrics for each Pharmacy First service</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {/* UTI Section */}
                  <div className="border-b">
                    <div 
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/20"
                      onClick={() => toggleSection('uti')}
                    >
                      <div className="space-y-1">
                        <h3 className="text-lg font-medium">UTI Service</h3>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">{safeGet(localCurrentData.pfsDetails!, 'utiTreatmentItems') + safeGet(localCurrentData.pfsDetails!, 'utiConsultations') + safeGet(localCurrentData.pfsDetails!, 'utiReferrals')}</span> items, <span className="font-medium text-foreground">{formatCurrency(safeGet(localCurrentData.pfsDetails!, 'utiTreatmentWeightedSubtotal') + safeGet(localCurrentData.pfsDetails!, 'utiConsultationsWeightedSubtotal') + safeGet(localCurrentData.pfsDetails!, 'utiReferralsWeightedSubtotal'))}</span> weighted value
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        {expandedSections.uti ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                    {expandedSections.uti && (
                      <div className="p-4 pt-0">
                        {renderActivityMetricsTable(generateServiceMetrics('uti'))}
                      </div>
                    )}
                  </div>

                  {/* Impetigo Section */}
                  <div className="border-b">
                    <div 
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/20"
                      onClick={() => toggleSection('impetigo')}
                    >
                      <div className="space-y-1">
                        <h3 className="text-lg font-medium">Impetigo Service</h3>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">{safeGet(localCurrentData.pfsDetails!, 'impetigoTreatmentItems') + safeGet(localCurrentData.pfsDetails!, 'impetigoConsultations') + safeGet(localCurrentData.pfsDetails!, 'impetigoReferrals')}</span> items, <span className="font-medium text-foreground">{formatCurrency(safeGet(localCurrentData.pfsDetails!, 'impetigoTreatmentWeightedSubtotal') + safeGet(localCurrentData.pfsDetails!, 'impetigoConsultationsWeightedSubtotal') + safeGet(localCurrentData.pfsDetails!, 'impetigoReferralsWeightedSubtotal'))}</span> weighted value
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        {expandedSections.impetigo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                    {expandedSections.impetigo && (
                      <div className="p-4 pt-0">
                        {renderActivityMetricsTable(generateServiceMetrics('impetigo'))}
                      </div>
                    )}
                  </div>

                  {/* Shingles Section */}
                  <div className="border-b">
                    <div 
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/20"
                      onClick={() => toggleSection('shingles')}
                    >
                      <div className="space-y-1">
                        <h3 className="text-lg font-medium">Shingles Service</h3>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">{safeGet(localCurrentData.pfsDetails!, 'shinglesTreatmentItems') + safeGet(localCurrentData.pfsDetails!, 'shinglesConsultations') + safeGet(localCurrentData.pfsDetails!, 'shinglesReferrals')}</span> items, <span className="font-medium text-foreground">{formatCurrency(safeGet(localCurrentData.pfsDetails!, 'shinglesTreatmentWeightedSubtotal') + safeGet(localCurrentData.pfsDetails!, 'shinglesConsultationsWeightedSubtotal') + safeGet(localCurrentData.pfsDetails!, 'shinglesReferralsWeightedSubtotal'))}</span> weighted value
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        {expandedSections.shingles ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                    {expandedSections.shingles && (
                      <div className="p-4 pt-0">
                        {renderActivityMetricsTable(generateServiceMetrics('shingles'))}
                      </div>
                    )}
                  </div>

                  {/* Skin Infection Section */}
                  <div className="border-b">
                    <div 
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/20"
                      onClick={() => toggleSection('skinInfection')}
                    >
                      <div className="space-y-1">
                        <h3 className="text-lg font-medium">Skin Infection Service</h3>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">{safeGet(localCurrentData.pfsDetails!, 'skinInfectionItems') + safeGet(localCurrentData.pfsDetails!, 'skinInfectionConsultations') + safeGet(localCurrentData.pfsDetails!, 'skinInfectionReferrals')}</span> items, <span className="font-medium text-foreground">{formatCurrency(safeGet(localCurrentData.pfsDetails!, 'skinInfectionWeightedSubtotal') + safeGet(localCurrentData.pfsDetails!, 'skinInfectionConsultationsWeightedSubtotal') + safeGet(localCurrentData.pfsDetails!, 'skinInfectionReferralsWeightedSubtotal'))}</span> weighted value
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        {expandedSections.skinInfection ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                    {expandedSections.skinInfection && (
                      <div className="p-4 pt-0">
                        {renderActivityMetricsTable(generateServiceMetrics('skinInfection'))}
                      </div>
                    )}
                  </div>

                  {/* Hayfever Section */}
                  <div>
                    <div 
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/20"
                      onClick={() => toggleSection('hayfever')}
                    >
                      <div className="space-y-1">
                        <h3 className="text-lg font-medium">Hayfever Service</h3>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">{safeGet(localCurrentData.pfsDetails!, 'hayfeverItems') + safeGet(localCurrentData.pfsDetails!, 'hayfeverConsultations') + safeGet(localCurrentData.pfsDetails!, 'hayfeverReferrals')}</span> items, <span className="font-medium text-foreground">{formatCurrency(safeGet(localCurrentData.pfsDetails!, 'hayfeverWeightedSubtotal') + safeGet(localCurrentData.pfsDetails!, 'hayfeverConsultationsWeightedSubtotal') + safeGet(localCurrentData.pfsDetails!, 'hayfeverReferralsWeightedSubtotal'))}</span> weighted value
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        {expandedSections.hayfever ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                    {expandedSections.hayfever && (
                      <div className="p-4 pt-0">
                        {renderActivityMetricsTable(generateServiceMetrics('hayfever'))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default PharmacyFirstDetails; 