import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AppSidebar from "@/components/AppSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaymentData } from "@/types/paymentTypes";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info, ChevronRight, TrendingDown, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useDocuments } from "@/hooks/use-documents";
import { useIsMobile } from "@/hooks/use-mobile";
import { useContractorCodes } from "@/hooks/use-contractor-codes";

const GroupComparisonPage = () => {
  const navigate = useNavigate();
  const { documents, loading, error } = useDocuments();
  const { contractorCodes, hasMultipleCodes } = useContractorCodes(documents);
  const [selectedContractorCodes, setSelectedContractorCodes] = useState<string[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>("netPayment");
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [collectiveData, setCollectiveData] = useState<any>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [isPremium, setIsPremium] = useState<boolean>(true);
  const isMobile = useIsMobile();
  
  // When contractor codes change, initialize selected codes
  useEffect(() => {
    if (contractorCodes.length > 0 && selectedContractorCodes.length === 0) {
      // By default, select all contractor codes
      setSelectedContractorCodes(contractorCodes.map(code => code.code));
    }
  }, [contractorCodes, selectedContractorCodes]);

  // Check redirection if only one pharmacy
  useEffect(() => {
    console.log("Loading state:", loading);
    console.log("Contractor codes:", contractorCodes);
    console.log("Has multiple codes:", hasMultipleCodes);

    // Temporarily commenting out redirection to debug
    // if (contractorCodes.length <= 1 && !loading) {
    //   navigate('/dashboard');
    // }
  }, [contractorCodes, navigate, loading]);

  // Get unique months across all documents
  const availableMonths = documents.reduce((months: string[], doc) => {
    const monthYear = `${doc.month} ${doc.year}`;
    if (!months.includes(monthYear)) {
      months.push(monthYear);
    }
    return months;
  }, []);

  // Set the most recent month as default
  useEffect(() => {
    if (availableMonths.length > 0 && !selectedMonth) {
      // Sort months to find the most recent
      const sortedMonths = [...availableMonths].sort((a, b) => {
        const [monthA, yearA] = a.split(' ');
        const [monthB, yearB] = b.split(' ');
        const monthOrder: Record<string, number> = { 
          "JANUARY": 0, "FEBRUARY": 1, "MARCH": 2, "APRIL": 3, 
          "MAY": 4, "JUNE": 5, "JULY": 6, "AUGUST": 7, 
          "SEPTEMBER": 8, "OCTOBER": 9, "NOVEMBER": 10, "DECEMBER": 11 
        };
        
        // Compare years first
        if (yearA !== yearB) {
          return parseInt(yearB) - parseInt(yearA);
        }
        
        // If same year, compare months
        return (monthOrder[monthB.toUpperCase()] || 0) - (monthOrder[monthA.toUpperCase()] || 0);
      });
      
      setSelectedMonth(sortedMonths[0]);
    }
  }, [availableMonths, selectedMonth]);

  // Prepare comparison data for charts when month or metric changes
  useEffect(() => {
    if (!selectedMonth || !documents.length) return;

    // Filter documents for the selected month
    const monthDocuments = documents.filter(doc => 
      `${doc.month} ${doc.year}` === selectedMonth
    );

    // Group by contractor code
    const groupedByCode = contractorCodes.map(codeInfo => {
      const doc = monthDocuments.find(d => d.contractorCode === codeInfo.code);
      return {
        name: codeInfo.pharmacyName || `Pharmacy ${codeInfo.code}`,
        code: codeInfo.code,
        [selectedMetric]: doc ? getMetricValue(doc, selectedMetric) : 0
      };
    });

    setComparisonData(groupedByCode);
  }, [selectedMonth, selectedMetric, documents, contractorCodes]);
  
  // Calculate collective metrics across selected pharmacies
  useEffect(() => {
    if (!documents.length || !selectedContractorCodes.length) return;
    
    // Filter documents by selected contractor codes
    const filteredDocs = documents.filter(doc => 
      selectedContractorCodes.includes(doc.contractorCode || '')
    );
    
    // Calculate collective metrics
    const totalNetPayment = filteredDocs.reduce((sum, doc) => sum + (doc.netPayment || 0), 0);
    const totalItems = filteredDocs.reduce((sum, doc) => sum + (doc.totalItems || 0), 0);
    const avgItemValue = totalItems > 0 ? totalNetPayment / totalItems : 0;
    
    // Group by month and year for financial calculations
    const monthlyData: Record<string, any> = {};
    filteredDocs.forEach(doc => {
      const key = `${doc.month} ${doc.year}`;
      if (!monthlyData[key]) {
        monthlyData[key] = {
          month: doc.month,
          year: doc.year,
          netPayment: 0,
          totalItems: 0,
          documents: []
        };
      }
      
      monthlyData[key].netPayment += doc.netPayment || 0;
      monthlyData[key].totalItems += doc.totalItems || 0;
      monthlyData[key].documents.push(doc);
    });
    
    // Convert to array and sort by date
    const sortedMonths = Object.values(monthlyData).sort((a: any, b: any) => {
      const monthOrder: Record<string, number> = { 
        "JANUARY": 0, "FEBRUARY": 1, "MARCH": 2, "APRIL": 3, 
        "MAY": 4, "JUNE": 5, "JULY": 6, "AUGUST": 7, 
        "SEPTEMBER": 8, "OCTOBER": 9, "NOVEMBER": 10, "DECEMBER": 11 
      };
      
      // Compare years first
      if (a.year !== b.year) return a.year - b.year;
      
      // Then months
      return (monthOrder[a.month.toUpperCase()] || 0) - (monthOrder[b.month.toUpperCase()] || 0);
    });
    
    // Set collective metrics
    setCollectiveData({
      totalNetPayment,
      totalItems,
      avgItemValue,
      pharmacyCount: selectedContractorCodes.length
    });
    
    // Prepare trend data for the line chart
    const trends: any[] = [];
    for (const monthData of sortedMonths) {
      // Prepare an entry for each contractor code
      const entry: any = { 
        month: `${monthData.month.substring(0, 3)} ${monthData.year}` 
      };
      
      // Add metric data for each selected contractor code
      for (const doc of monthData.documents) {
        if (doc.contractorCode) {
          entry[doc.contractorCode] = getMetricValue(doc, selectedMetric);
        }
      }
      
      // Add to trends
      trends.push(entry);
    }
    
    setTrendData(trends);
  }, [documents, selectedContractorCodes, selectedMetric]);

  // Helper to get value based on selected metric
  const getMetricValue = (doc: PaymentData, metric: string): number => {
    switch(metric) {
      case "netPayment":
        return doc.netPayment || 0;
      case "totalItems":
        return doc.totalItems || 0;
      case "averageItemValue":
        return doc.averageItemValue || 0;
      case "pharmacyFirstTotal":
        return (doc.financials?.pharmacyFirstBase || 0) + (doc.financials?.pharmacyFirstActivity || 0);
      case "grossIngredientCost":
        return doc.financials?.grossIngredientCost || 0;
      default:
        return 0;
    }
  };

  // Format numbers for display
  const formatValue = (value: number, metric: string): string => {
    if (metric === "netPayment" || metric === "pharmacyFirstTotal" || metric === "grossIngredientCost") {
      return `£${value.toLocaleString('en-GB', { maximumFractionDigits: 2 })}`;
    } else if (metric === "averageItemValue") {
      return `£${value.toLocaleString('en-GB', { maximumFractionDigits: 2 })}`;
    } else {
      return value.toLocaleString('en-GB');
    }
  };

  // Format the Y-axis values
  const formatYAxis = (value: number) => {
    if (selectedMetric === "netPayment" || selectedMetric === "pharmacyFirstTotal" || selectedMetric === "grossIngredientCost") {
      return `£${value.toLocaleString('en-GB', { notation: 'compact', maximumFractionDigits: 1 })}`;
    } else if (selectedMetric === "averageItemValue") {
      return `£${value}`;
    } else {
      return value.toLocaleString('en-GB', { notation: 'compact' });
    }
  };
  
  // Render collective metrics dashboard - styled like the dashboard
  const renderCollectiveMetrics = () => {
    if (!collectiveData) return null;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold text-gray-800">Total Net Payment</h3>
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-bold text-red-900">
                  £{collectiveData.totalNetPayment.toLocaleString('en-GB', { maximumFractionDigits: 0 })}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Group total across {collectiveData.pharmacyCount} pharmacies
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold text-gray-800">Total Items</h3>
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-bold text-red-900">
                  {collectiveData.totalItems.toLocaleString('en-GB')}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Total dispensed items across all selected branches
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold text-gray-800">Average Item Value</h3>
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-bold text-red-900">
                  £{collectiveData.avgItemValue.toLocaleString('en-GB', { maximumFractionDigits: 2 })}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Average cost per dispensed item
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Helper to get display name for metrics
  const getMetricDisplayName = (metric: string): string => {
    switch(metric) {
      case "netPayment": return "Net Payment";
      case "totalItems": return "Total Items";
      case "averageItemValue": return "Average Item Value";
      case "pharmacyFirstTotal": return "Pharmacy First Total";
      case "grossIngredientCost": return "Gross Ingredient Cost";
      default: return metric;
    }
  };
  
  // Render multi-pharmacy trend chart
  const renderTrendChart = () => {
    if (!trendData.length) return null;
    
    // Generate colors for each contractor code
    const colors = [
      "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", 
      "#00C49F", "#FFBB28", "#FF8042", "#a4de6c", "#d0ed57"
    ];
    
    // Get pharmacy names for the legend
    const pharmacyNames = contractorCodes
      .filter(code => selectedContractorCodes.includes(code.code))
      .reduce((obj: Record<string, string>, code) => {
        obj[code.code] = code.pharmacyName || `Pharmacy ${code.code}`;
        return obj;
      }, {});
    
    // Calculate average value for the reference line
    const allValues: number[] = [];
    trendData.forEach(item => {
      selectedContractorCodes.forEach(code => {
        if (item[code] !== undefined) {
          allValues.push(item[code]);
        }
      });
    });
    
    const averageValue = allValues.length ? 
      allValues.reduce((sum, val) => sum + val, 0) / allValues.length : 0;
    
    return (
      <Card className="mb-6">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-lg font-semibold">Performance Trends</CardTitle>
            <CardDescription>
              {getMetricDisplayName(selectedMetric)} across pharmacies over time
            </CardDescription>
          </div>
          <Select
            value={selectedMetric}
            onValueChange={setSelectedMetric}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="netPayment">Net Payment</SelectItem>
              <SelectItem value="totalItems">Total Items</SelectItem>
              <SelectItem value="averageItemValue">Average Item Value</SelectItem>
              <SelectItem value="pharmacyFirstTotal">Pharmacy First Total</SelectItem>
              <SelectItem value="grossIngredientCost">Gross Ingredient Cost</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="h-[400px]">
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trendData}
                    margin={{ top: 20, right: 30, left: 30, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      angle={-45} 
                      textAnchor="end" 
                      tick={{ fontSize: 12 }}
                      height={70}
                    />
                    <YAxis 
                      tickFormatter={(value) => {
                        if (selectedMetric === "netPayment" || selectedMetric === "pharmacyFirstTotal" || selectedMetric === "grossIngredientCost" || selectedMetric === "averageItemValue") {
                          return `£${value.toLocaleString('en-GB', { notation: 'compact', maximumFractionDigits: 1 })}`;
                        }
                        return value.toLocaleString('en-GB', { notation: 'compact' });
                      }}
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        const formattedValue = selectedMetric === "netPayment" || 
                          selectedMetric === "pharmacyFirstTotal" || 
                          selectedMetric === "grossIngredientCost" || 
                          selectedMetric === "averageItemValue"
                            ? `£${Number(value).toLocaleString('en-GB', { maximumFractionDigits: 2 })}`
                            : Number(value).toLocaleString('en-GB');
                        return [formattedValue, pharmacyNames[name as string] || name];
                      }}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Legend formatter={(value) => pharmacyNames[value] || value} />
                    
                    {/* Reference line for average */}
                    <ReferenceLine 
                      y={averageValue}
                      stroke="#777777"
                      strokeDasharray="3 3"
                      label={{
                        value: `Avg: ${selectedMetric === "netPayment" || selectedMetric === "pharmacyFirstTotal" || 
                              selectedMetric === "grossIngredientCost" || selectedMetric === "averageItemValue" ? 
                              `£${Math.round(averageValue).toLocaleString('en-GB')}` : 
                              Math.round(averageValue).toLocaleString('en-GB')}`,
                        position: 'insideBottomRight',
                        fill: '#666',
                        fontSize: 12
                      }}
                    />
                    
                    {selectedContractorCodes.map((code, index) => (
                      <Line
                        key={code}
                        type="monotone"
                        dataKey={code}
                        name={code}
                        stroke={colors[index % colors.length]}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        connectNulls={true}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">No trend data available</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  // Render contractor code selector
  const renderContractorSelector = () => {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Select Pharmacies</CardTitle>
          <CardDescription>
            Choose which pharmacies to include in the comparison
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {contractorCodes.map(codeInfo => (
              <div key={codeInfo.code} className="flex items-center space-x-2">
                <Checkbox 
                  id={`code-${codeInfo.code}`} 
                  checked={selectedContractorCodes.includes(codeInfo.code)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedContractorCodes(prev => [...prev, codeInfo.code]);
                    } else {
                      setSelectedContractorCodes(prev => prev.filter(c => c !== codeInfo.code));
                    }
                  }}
                />
                <label 
                  htmlFor={`code-${codeInfo.code}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {codeInfo.pharmacyName || `Pharmacy ${codeInfo.code}`} ({codeInfo.code})
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };
  
  // Render month-specific comparison
  const renderMonthComparison = () => {
    if (!comparisonData.length) return null;
    
    // Bar chart colors
    const barColor = "#8884d8";
    
    // Sort data by the selected metric value
    const sortedData = [...comparisonData].sort((a, b) => b[selectedMetric] - a[selectedMetric]);
    
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            {getMetricDisplayName(selectedMetric)} by Pharmacy for {selectedMonth}
          </CardTitle>
          <CardDescription>
            Comparing {getMetricDisplayName(selectedMetric)} across pharmacies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            {comparisonData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sortedData}
                  margin={{ top: 20, right: 30, left: 40, bottom: 70 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis 
                    type="number"
                    tickFormatter={(value) => {
                      if (selectedMetric === "netPayment" || selectedMetric === "pharmacyFirstTotal" || selectedMetric === "grossIngredientCost" || selectedMetric === "averageItemValue") {
                        return `£${value.toLocaleString('en-GB', { notation: 'compact', maximumFractionDigits: 1 })}`;
                      }
                      return value.toLocaleString('en-GB', { notation: 'compact' });
                    }}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category"
                    width={120}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value) => {
                      const formattedValue = selectedMetric === "netPayment" || 
                        selectedMetric === "pharmacyFirstTotal" || 
                        selectedMetric === "grossIngredientCost" || 
                        selectedMetric === "averageItemValue"
                          ? `£${Number(value).toLocaleString('en-GB', { maximumFractionDigits: 2 })}`
                          : Number(value).toLocaleString('en-GB');
                      return [formattedValue, getMetricDisplayName(selectedMetric)];
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey={selectedMetric} 
                    name={getMetricDisplayName(selectedMetric)}
                    fill={barColor} 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">No data available for the selected month</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AppSidebar activePage="group-comparison" isPremium={isPremium} />
      
      <main className="flex-1 p-4 sm:p-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Group Comparison</h1>
            <p className="text-gray-600 mt-1">Compare performance across multiple pharmacies</p>
          </div>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full max-w-md" />
              <Skeleton className="h-[300px] w-full rounded-md" />
              <Skeleton className="h-[200px] w-full rounded-md" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load documents. Please refresh the page or try again later.
              </AlertDescription>
            </Alert>
          ) : !hasMultipleCodes ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No group data available</AlertTitle>
              <AlertDescription>
                Group comparison is only available when you have uploaded files for multiple contractor codes.
                Please upload documents from different pharmacies to use this feature.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
              {renderContractorSelector()}
              
              {renderCollectiveMetrics()}
              
              {renderTrendChart()}
              
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                <Select
                  value={selectedMonth || ""}
                  onValueChange={setSelectedMonth}
                >
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMonths.map((month) => (
                      <SelectItem key={month} value={month}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedMetric}
                  onValueChange={setSelectedMetric}
                >
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="netPayment">Net Payment</SelectItem>
                    <SelectItem value="totalItems">Total Items</SelectItem>
                    <SelectItem value="averageItemValue">Average Item Value</SelectItem>
                    <SelectItem value="pharmacyFirstTotal">Pharmacy First Total</SelectItem>
                    <SelectItem value="grossIngredientCost">Gross Ingredient Cost</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {renderMonthComparison()}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default GroupComparisonPage; 