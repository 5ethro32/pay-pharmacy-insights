import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useState } from "react";
import { TrendingUp, TrendingDown, ChevronUp, ChevronDown, Lock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import InsightsPanel from "./InsightsPanel";
import { useIsMobile } from "@/hooks/use-mobile";

interface PharmacyDashboardProps {
  view: "summary" | "details" | "financial";
}

const PharmacyDashboard = ({ view }: PharmacyDashboardProps) => {
  const [isBlurred, setIsBlurred] = useState(true);
  const isMobile = useIsMobile();
  
  const pharmacyInfo = {
    contractorCode: "1737",
    dispensingMonth: "JANUARY 2025",
    inTransition: "No"
  };

  const itemCounts = {
    total: 9868,
    ams: 7751,
    mcr: 783,
    nhs: 342,
    cpus: 207,
    other: 785
  };

  const costs = {
    totalGross: 101708.89,
    amsGross: 84804.68,
    mcrGross: 5447.44,
    nhsGross: 1294.58,
    cpusGross: 1630.87,
    otherGross: 8531.32,
    avgGross: 10.19
  };

  const payments = {
    netIngredientCost: 100388.93,
    outOfPocket: 30.00,
    supplementaryPayments: 25556.52,
    stockOrderSubtotal: 175.89,
    dispensingPoolPayment: 12219.24,
    establishmentPayment: 2500.00,
    pharmacyFirstBase: 1000.00,
    pharmacyFirstActivity: 1400.06,
    phsSmoking: 60.00,
    phsContraceptive: 60.00,
    advancePayment: 138302.12,
    nextMonthAdvance: 138486.11,
    netPayment: 126774.45
  };

  const changes = {
    totalGross: 3.5,
    netIngredientCost: 2.8,
    supplementaryPayments: 5.2,
    netPayment: 4.1,
    itemCounts: -1.2,
    amsItems: 1.8,
    mcrItems: -2.5,
    nhsItems: -0.9
  };

  const insights = [
    {
      title: "Payment Growth Outpacing Volume",
      description: "Your net payments increased by 4.1% while prescription volume decreased by 1.2%. This indicates improved reimbursement rates compared to similar-sized pharmacies which averaged only 2.3% payment growth this quarter.",
      type: "positive" as const
    },
    {
      title: "AMS Performance Above Benchmark",
      description: "AMS items (7,751) represent 78.5% of your total volume, which is 8.2% higher than comparable pharmacies. This service line has grown 1.8% month-over-month while your peer group averaged 0.4% growth.",
      type: "positive" as const
    },
    {
      title: "M:CR Prescription Decline",
      description: "Your M:CR prescription items decreased by 2.5%, which is more than the average decrease of 1.3% seen across pharmacies of your size. Consider reviewing M:CR service promotion strategies.",
      type: "negative" as const
    }
  ];

  const benchmarkInsights = [
    {
      title: "Average Cost Per Item",
      description: "Your average cost per item (£10.19) is 8% higher than similar-sized pharmacies (£9.43). This may indicate a more complex dispensing mix or potential for generic substitution review.",
      type: "warning" as const
    },
    {
      title: "Dispensing Efficiency",
      description: "With 9,868 items processed by your pharmacy, you're operating at 12% higher efficiency than the average for your pharmacy size bracket (8,810 items).",
      type: "positive" as const
    }
  ];
  
  const financialInsights = [
    {
      title: "Category M Price Adjustment Impact",
      description: "Your pharmacy has a favorable position with recent Category M price adjustments, with a potential 2.7% increase in reimbursement value compared to the regional average of 1.9%.",
      type: "positive" as const
    },
    {
      title: "Service Diversification Opportunity",
      description: "Based on your prescription mix, expanding your PHS Contraceptive service could increase supplementary payments by up to £350 per month based on similar pharmacy performance.",
      type: "info" as const
    },
    {
      title: "Advanced Payment Optimization",
      description: "Your advanced payment schedule could be optimized based on your dispensing patterns. Our analysis shows a potential cash flow improvement of £2,800 monthly with adjusted timing.",
      type: "warning" as const
    }
  ];

  const formatCurrency = (value: number, decimals = 2) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-GB').format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const renderChangeIndicator = (changeValue: number, size = "small") => {
    const isPositive = changeValue > 0;
    
    if (Math.abs(changeValue) < 0.1) return null; // No significant change
    
    if (size === "small") {
      return (
        <span className={`inline-flex items-center ml-1 ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
          {isPositive ? 
            <ChevronUp className="h-4 w-4" /> : 
            <ChevronDown className="h-4 w-4" />
          }
        </span>
      );
    } else {
      return (
        <span className={`inline-flex items-center ml-1 ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
          {isPositive ? 
            <TrendingUp className="h-5 w-5" /> : 
            <TrendingDown className="h-5 w-5" />
          }
          <span className="text-xs font-medium ml-0.5">{Math.abs(changeValue).toFixed(1)}%</span>
        </span>
      );
    }
  };

  const serviceBreakdownData = [
    { name: "AMS", value: itemCounts.ams, color: "#9c1f28" },
    { name: "M:CR", value: itemCounts.mcr, color: "#c73845" },
    { name: "NHS PFS", value: itemCounts.nhs, color: "#e85a68" },
    { name: "CPUS", value: itemCounts.cpus, color: "#f27d88" },
    { name: "Other", value: itemCounts.other, color: "#f9a3aa" }
  ];

  const costBreakdownData = [
    { name: "AMS", value: costs.amsGross, color: "#9c1f28" },
    { name: "M:CR", value: costs.mcrGross, color: "#c73845" },
    { name: "NHS PFS", value: costs.nhsGross, color: "#e85a68" },
    { name: "CPUS", value: costs.cpusGross, color: "#f27d88" },
    { name: "Other", value: costs.otherGross, color: "#f9a3aa" }
  ];

  const supplementaryPaymentsData = [
    { name: "Dispensing Pool", value: payments.dispensingPoolPayment },
    { name: "Establishment", value: payments.establishmentPayment },
    { name: "Pharmacy First Base", value: payments.pharmacyFirstBase },
    { name: "Pharmacy First Activity", value: payments.pharmacyFirstActivity },
    { name: "PHS Smoking", value: payments.phsSmoking },
    { name: "PHS Contraceptive", value: payments.phsContraceptive }
  ];

  const handleSignUpPrompt = () => {
    alert("Sign up to access full dashboard features!");
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    if (isMobile) return null;
    
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
        style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}
      >
        {`${name}: ${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  setTimeout(() => {
    if (isBlurred) setIsBlurred(false);
  }, 2000);

  const chartHeight = isMobile ? 250 : 300;

  return (
    <div className="space-y-6 w-full overflow-hidden">
      <Card className="border border-gray-200 shadow-sm relative w-full">
        <CardHeader className="bg-gradient-to-r from-red-900/90 to-red-700 text-white">
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle className="text-xl md:text-2xl font-display">
                COMMUNITY PHARMACY PAYMENT SUMMARY
              </CardTitle>
              <p className="text-white/80 mt-1">Pharmacy eSchedule Dashboard</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-sm">
              <span className="text-white/80">Contractor Code:</span>
              <span className="font-medium md:col-span-2">{pharmacyInfo.contractorCode}</span>
              <span className="text-white/80">Dispensing Month:</span>
              <span className="font-medium md:col-span-2">{pharmacyInfo.dispensingMonth}</span>
              <span className="text-white/80">In Transition:</span>
              <span className="font-medium md:col-span-2">{pharmacyInfo.inTransition}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 overflow-hidden">
          {view === "summary" && (
            <div className={`space-y-6 sm:space-y-8 max-w-full overflow-hidden ${isBlurred ? 'filter blur-sm' : ''}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                <Card className="overflow-hidden border shadow-md bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base sm:text-lg font-medium text-gray-700">Total Items Dispensed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <span className="text-2xl sm:text-3xl font-bold text-red-900">{formatNumber(itemCounts.total)}</span>
                      {renderChangeIndicator(changes.itemCounts, "large")}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Excluding stock orders</p>
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden border shadow-md bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base sm:text-lg font-medium text-gray-700">Gross Ingredient Cost</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-red-900">{formatCurrency(costs.totalGross, 2)}</span>
                      {renderChangeIndicator(changes.totalGross, "large")}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Total cost before deductions</p>
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden border shadow-md bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base sm:text-lg font-medium text-gray-700">Average Value per Item</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold text-red-900">{formatCurrency(costs.avgGross, 2)}</div>
                    <p className="text-sm text-gray-500 mt-1">Average cost per dispensed item</p>
                  </CardContent>
                </Card>
              </div>
              
              <InsightsPanel insights={insights} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                <Card className="max-w-full overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl text-gray-800">Service Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 overflow-hidden">
                    <div className="h-[250px] sm:h-[280px] lg:h-[300px] w-full max-w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                          <Pie
                            data={serviceBreakdownData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={isMobile ? 40 : 70}
                            outerRadius={isMobile ? 70 : 110}
                            paddingAngle={2}
                            labelLine={false}
                            label={renderCustomizedLabel}
                          >
                            {serviceBreakdownData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.color} 
                                stroke="#ffffff" 
                                strokeWidth={2}
                              />
                            ))}
                          </Pie>
                          <Legend 
                            layout="horizontal" 
                            verticalAlign="bottom" 
                            align="center" 
                            wrapperStyle={{ paddingTop: isMobile ? '10px' : '20px' }}
                          />
                          <Tooltip 
                            formatter={(value: any) => [`${formatNumber(value)}`, 'Count']}
                            labelFormatter={(name) => `${name}`}
                            contentStyle={{ 
                              background: 'rgba(255, 255, 255, 0.95)', 
                              borderRadius: '8px',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                              border: '1px solid #f0f0f0'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="max-w-full overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl text-gray-800">Supplementary Payments</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 overflow-hidden">
                    <div className="h-[250px] sm:h-[280px] lg:h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={supplementaryPaymentsData}
                          margin={{ top: 20, right: isMobile ? 0 : 20, left: isMobile ? 0 : 20, bottom: 60 }}
                        >
                          <XAxis 
                            dataKey="name" 
                            angle={-45}
                            textAnchor="end"
                            height={70}
                            tick={{ fontSize: isMobile ? 9 : 11 }}
                          />
                          <YAxis 
                            tickFormatter={(value) => `£${formatNumber(value)}`}
                            width={isMobile ? 40 : 60}
                            tick={{ fontSize: isMobile ? 10 : 12 }}
                          />
                          <Tooltip 
                            formatter={(value: any) => [formatCurrency(value, 2), 'Amount']}
                            contentStyle={{ 
                              background: 'rgba(255, 255, 255, 0.95)', 
                              borderRadius: '8px',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                              border: '1px solid #f0f0f0'
                            }}
                          />
                          <Bar dataKey="value" fill="#b91c1c" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <InsightsPanel insights={benchmarkInsights} />
            </div>
          )}
          
          {view === "details" && (
            <div className={`space-y-6 sm:space-y-8 overflow-hidden max-w-full ${isBlurred ? 'filter blur-sm' : ''}`}>
              <Card className="overflow-x-auto max-w-full">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl text-gray-800">Payment Schedule Details</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="w-full overflow-x-auto max-w-full">
                    <div className="min-w-[600px]">
                      <Table>
                        <TableHeader className="bg-red-50">
                          <TableRow>
                            <TableHead className="text-gray-700 font-semibold">Item</TableHead>
                            <TableHead className="text-right text-gray-700 font-semibold">Count/Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-200">
                          <TableRow>
                            <TableCell colSpan={2} className="bg-gray-100 font-medium">Item Counts by Service</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-gray-700">AMS Items</TableCell>
                            <TableCell className="text-right text-gray-700">
                              <div className="flex items-center justify-end">
                                <span>{formatNumber(itemCounts.ams)}</span>
                                {renderChangeIndicator(changes.amsItems)}
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-gray-700">M:CR (CMS) Items</TableCell>
                            <TableCell className="text-right text-gray-700">
                              <div className="flex items-center justify-end">
                                <span>{formatNumber(itemCounts.mcr)}</span>
                                {renderChangeIndicator(changes.mcrItems)}
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-gray-700">NHS PFS Items</TableCell>
                            <TableCell className="text-right text-gray-700">
                              <div className="flex items-center justify-end">
                                <span>{formatNumber(itemCounts.nhs)}</span>
                                {renderChangeIndicator(changes.nhsItems)}
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-gray-700">CPUS Items (inc UCF)</TableCell>
                            <TableCell className="text-right text-gray-700">{formatNumber(itemCounts.cpus)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-gray-700">Other Items</TableCell>
                            <TableCell className="text-right text-gray-700">{formatNumber(itemCounts.other)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-gray-700 font-medium">Total Items (excl stock orders)</TableCell>
                            <TableCell className="text-right text-gray-700 font-medium">
                              <div className="flex items-center justify-end">
                                <span>{formatNumber(itemCounts.total)}</span>
                                {renderChangeIndicator(changes.itemCounts)}
                              </div>
                            </TableCell>
                          </TableRow>
                          
                          <TableRow>
                            <TableCell colSpan={2} className="bg-gray-100 font-medium">Gross Ingredient Cost by Service</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-gray-700">AMS Items</TableCell>
                            <TableCell className="text-right text-gray-700">{formatCurrency(costs.amsGross, 2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-gray-700">M:CR (CMS) Items</TableCell>
                            <TableCell className="text-right text-gray-700">{formatCurrency(costs.mcrGross, 2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-gray-700">NHS PFS Items</TableCell>
                            <TableCell className="text-right text-gray-700">{formatCurrency(costs.nhsGross, 2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-gray-700">CPUS Items (inc UCF)</TableCell>
                            <TableCell className="text-right text-gray-700">{formatCurrency(costs.cpusGross, 2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-gray-700">Other Items</TableCell>
                            <TableCell className="text-right text-gray-700">{formatCurrency(costs.otherGross, 2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-gray-700 font-medium">Total Gross Ingredient Cost</TableCell>
                            <TableCell className="text-right text-gray-700 font-medium">
                              <div className="flex items-center justify-end">
                                <span>{formatCurrency(costs.totalGross, 2)}</span>
                                {renderChangeIndicator(changes.totalGross)}
                              </div>
                            </TableCell>
                          </TableRow>
                          
                          <TableRow>
                            <TableCell colSpan={2} className="bg-gray-100 font-medium">Payment Breakdown</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-gray-700">Net Ingredient Cost</TableCell>
                            <TableCell className="text-right text-gray-700">
                              <div className="flex items-center justify-end">
                                <span>{formatCurrency(payments.netIngredientCost, 2)}</span>
                                {renderChangeIndicator(changes.netIngredientCost)}
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-gray-700">Out Of Pocket Expenses</TableCell>
                            <TableCell className="text-right text-gray-700">{formatCurrency(payments.outOfPocket, 2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-gray-700">Supplementary & Service Payments</TableCell>
                            <TableCell className="text-right text-gray-700">
                              <div className="flex items-center justify-end">
                                <span>{formatCurrency(payments.supplementaryPayments, 2)}</span>
                                {renderChangeIndicator(changes.supplementaryPayments)}
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-gray-700">Stock Order Subtotal</TableCell>
                            <TableCell className="text-right text-gray-700">{formatCurrency(payments.stockOrderSubtotal, 2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-gray-700">Advance Payment Already Paid</TableCell>
                            <TableCell className="text-right text-gray-700">{formatCurrency(payments.advancePayment, 2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-gray-700">Advance Payment Next Month</TableCell>
                            <TableCell className="text-right text-gray-700">{formatCurrency(payments.nextMonthAdvance, 2)}</TableCell>
                          </TableRow>
                          <TableRow className="bg-red-50">
                            <TableCell className="font-semibold text-red-900">Net Payment to Bank</TableCell>
                            <TableCell className="text-right font-semibold text-red-900">
                              <div className="flex items-center justify-end">
                                <span>{formatCurrency(payments.netPayment, 2)}</span>
                                {renderChangeIndicator(changes.netPayment)}
                              </div>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="max-w-full overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl text-gray-800">Cost Distribution by Service</CardTitle>
                </CardHeader>
                <CardContent className="overflow-hidden">
                  <div className="h-[300px] sm:h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={costBreakdownData}
                        layout="vertical"
                        margin={{ top: 20, right: 20, left: isMobile ? 60 : 100, bottom: 20 }}
                      >
                        <XAxis 
                          type="number" 
                          tickFormatter={(value) => `£${formatNumber(value)}`}
                        />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          width={isMobile ? 50 : 80} 
                        />
                        <Tooltip 
                          formatter={(value: any) => [formatCurrency(value, 2), 'Amount']}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {costBreakdownData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {view === "financial" && (
            <div className="space-y-6 sm:space-y-8 max-w-full overflow-hidden">
              <Card className="max-w-full">
                <CardHeader className="border-b">
                  <CardTitle className="text-lg sm:text-xl text-gray-800">Financial Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="p-3 sm:p-4 bg-red-50 rounded-lg border border-red-100">
                        <p className="text-xs sm:text-sm text-gray-600">Net Ingredient Cost</p>
                        <div className="flex items-center">
                          <p className="text-lg sm:text-2xl font-semibold text-red-900">
                            {formatCurrency(payments.netIngredientCost, 2)}
                          </p>
                          {renderChangeIndicator(changes.netIngredientCost)}
                        </div>
                      </div>
                      <div className="p-3 sm:p-4 bg-red-50 rounded-lg border border-red-100">
                        <p className="text-xs sm:text-sm text-gray-600">Total Supplementary & Service</p>
                        <div className="flex items-center">
                          <p className="text-lg sm:text-2xl font-semibold text-red-900">
                            {formatCurrency(payments.supplementaryPayments, 2)}
                          </p>
                          {renderChangeIndicator(changes.supplementaryPayments)}
                        </div>
                      </div>
                      <div className="p-3 sm:p-4 bg-red-50 rounded-lg border border-red-100">
                        <p className="text-xs sm:text-sm text-gray-600">Net Payment to Bank</p>
                        <div className="flex items-center">
                          <p className="text-lg sm:text-2xl font-semibold text-red-900">
                            {formatCurrency(payments.netPayment, 2)}
                          </p>
                          {renderChangeIndicator(changes.netPayment)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto max-w-full">
                      <div className="min-w-[600px]">
                        <Table>
                          <TableHeader className="bg-red-50">
                            <TableRow>
                              <TableHead className="text-gray-700 font-semibold">Payment Item</TableHead>
                              <TableHead className="text-right text-gray-700 font-semibold">Amount</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody className="divide-y divide-gray-200">
                            <TableRow>
                              <TableCell className="text-gray-700">Net Ingredient Cost</TableCell>
                              <TableCell className="text-right text-gray-700">
                                {formatCurrency(payments.netIngredientCost, 2)}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="text-gray-700">Out Of Pocket Expenses</TableCell>
                              <TableCell className="text-right text-gray-700">
                                {formatCurrency(payments.outOfPocket, 2)}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="text-gray-700">Dispensing Pool Payment</TableCell>
                              <TableCell className="text-right text-gray-700">
                                {formatCurrency(payments.dispensingPoolPayment, 2)}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="text-gray-700">Establishment Payment</TableCell>
                              <TableCell className="text-right text-gray-700">
                                {formatCurrency(payments.establishmentPayment, 2)}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="text-gray-700">Pharmacy First Base Payment</TableCell>
                              <TableCell className="text-right text-gray-700">
                                {formatCurrency(payments.pharmacyFirstBase, 2)}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="text-gray-700">Pharmacy First Activity Payment</TableCell>
                              <TableCell className="text-right text-gray-700">
                                {formatCurrency(payments.pharmacyFirstActivity, 2)}
                              </TableCell>
                            </TableRow>
                            <TableRow className="bg-red-50">
                              <TableCell className="font-semibold text-red-900">Net Payment to Bank</TableCell>
                              <TableCell className="text-right font-semibold text-red-900">
                                {formatCurrency(payments.netPayment, 2)}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                    
                    <div className="mt-6 bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Analysis & Insights</h3>
                      <InsightsPanel insights={financialInsights} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {isBlurred && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="p-4 sm:p-6 bg-white rounded-lg shadow-xl text-center z-10 mx-4">
                <h3 className="text-lg sm:text-xl font-bold text-red-800 mb-3 sm:mb-4">Preview Limited</h3>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Sign up to access the full dashboard with all your pharmacy data</p>
                <button 
                  onClick={handleSignUpPrompt}
                  className="px-3 sm:px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded shadow text-sm sm:text-base"
                >
                  Sign Up for Full Access
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PharmacyDashboard;
