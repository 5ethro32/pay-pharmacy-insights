import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, BarChart2, AlertCircle, LineChart, ArrowUp, ArrowDown, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const trendData = [
  { month: 'Aug', items: 8123, payment: 115000, average: 10.2 },
  { month: 'Sep', items: 8765, payment: 118500, average: 10.1 },
  { month: 'Oct', items: 9234, payment: 122700, average: 10.4 },
  { month: 'Nov', items: 9456, payment: 124300, average: 10.3 },
  { month: 'Dec', items: 9120, payment: 123900, average: 10.1 },
  { month: 'Jan', items: 9868, payment: 126774, average: 10.9 },
];

const keyMetricsData = [
  { name: 'Total Items', value: 9868, change: -1.2, trend: 'down' },
  { name: 'Net Ingredient Cost', value: '£100,389', change: 2.8, trend: 'up' },
  { name: 'Net Payment', value: '£126,774', change: 4.1, trend: 'up' },
  { name: 'Value per Item', value: '£10.19', change: 1.8, trend: 'up' },
];

const peerComparisonData = [
  { 
    metric: 'Items Dispensed', 
    value: 9868,
    peerAverage: 8810, 
    percentDiff: 12,
    performance: 'above'
  },
  { 
    metric: 'Cost Per Item', 
    value: 10.19,
    peerAverage: 9.43, 
    percentDiff: 8,
    performance: 'below'
  },
  { 
    metric: 'Payment Growth', 
    value: 4.1,
    peerAverage: 2.3, 
    percentDiff: 78,
    performance: 'above'
  },
];

const alertsData = [
  { 
    title: 'Category M Adjustment', 
    description: 'Favorable position with recent Category M price adjustments, potential 2.7% increase in reimbursement.',
    severity: 'positive',
    date: '4 Feb 2025'
  },
  { 
    title: 'M:CR Prescription Decline',
    description: 'M:CR items decreased by 2.5% (peer average: -1.3%). Review service promotion strategies.',
    severity: 'warning',
    date: '2 Feb 2025'
  },
  { 
    title: 'Cash Flow Opportunity',
    description: 'Advanced payment schedule could be optimized based on dispensing patterns for improved cash flow.',
    severity: 'info',
    date: '29 Jan 2025'
  },
];

const AlternativeDashboardPreview = () => {
  return (
    <section id="alternative-dashboard" className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">Interactive Dashboard Preview</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Discover how our powerful analytics transform complex payment data into clear, actionable insights that help you make informed decisions.
          </p>
        </div>
        
        <Tabs defaultValue="ai-insights" className="space-y-8">
          <TabsList className="mx-auto flex justify-center">
            <TabsTrigger value="ai-insights">AI Powered Insights</TabsTrigger>
            <TabsTrigger value="key-metrics">Key Performance Metrics</TabsTrigger>
            <TabsTrigger value="peer-comparison">Peer Comparison</TabsTrigger>
            <TabsTrigger value="proactive-alerts">Proactive Alerts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ai-insights" className="space-y-6">
            <Card className="border-gray-200 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-red-900 to-red-700 text-white">
                <CardTitle className="text-xl">AI-Powered Payment Trend Analysis</CardTitle>
                <CardDescription className="text-red-100">
                  Smart analysis of your payment trends over time
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={trendData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} />
                        <XAxis dataKey="month" />
                        <YAxis 
                          tickFormatter={(value) => `£${(value/1000).toFixed(0)}k`}
                          domain={['dataMin - 5000', 'dataMax + 5000']}
                        />
                        <Tooltip 
                          formatter={(value, name) => {
                            if (name === 'payment') return [`£${value.toLocaleString()}`, 'Net Payment'];
                            return [value, name];
                          }}
                        />
                        <Area type="monotone" dataKey="payment" name="payment" stroke="#9c1f28" fill="#9c1f28" fillOpacity={0.2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-red-50 p-5 rounded-lg border border-red-100">
                      <div className="flex items-start space-x-4">
                        <div className="bg-red-100 p-2 rounded-full">
                          <TrendingUp className="h-6 w-6 text-red-900" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg mb-1">
                            Payment Growth Outpacing Peers
                          </h3>
                          <p className="text-gray-700">
                            Your net payment increased by 4.1% while the peer average is only 2.3%. This positive trend suggests excellent reimbursement optimization.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                      <div className="flex items-start space-x-4">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <LineChart className="h-6 w-6 text-blue-900" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg mb-1">
                            Service Payment Revenue
                          </h3>
                          <p className="text-gray-700">
                            Pharmacy First service payments have increased 28% vs last quarter, significantly contributing to your improved financial performance.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="key-metrics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-pharmacy-primary" />
                    Key Performance Metrics
                  </CardTitle>
                  <CardDescription>
                    Track critical financial metrics with real-time trend indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {keyMetricsData.map((metric, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-md border border-gray-100 shadow-sm">
                        <p className="text-sm text-gray-500 mb-1">{metric.name}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xl font-bold text-gray-900">{metric.value}</p>
                          <div className={`flex items-center ${metric.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                            {metric.trend === 'up' ? (
                              <ArrowUp className="h-4 w-4 mr-1" />
                            ) : (
                              <ArrowDown className="h-4 w-4 mr-1" />
                            )}
                            <span className="text-sm font-medium">{metric.change}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-pharmacy-primary" />
                    Payment Breakdown
                  </CardTitle>
                  <CardDescription>
                    Monthly payment components
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Ingredient Cost', value: 100389 },
                        { name: 'Dispensing Fee', value: 12219 },
                        { name: 'Pharmacy First', value: 2400 },
                        { name: 'Establishment', value: 2500 },
                        { name: 'Other Services', value: 120 },
                      ]}
                      margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }} 
                        angle={-45}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis 
                        tickFormatter={(value) => `£${(value/1000).toFixed(0)}k`}
                      />
                      <Tooltip 
                        formatter={(value) => [`£${value.toLocaleString()}`, 'Amount']}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="#9c1f28" 
                        radius={[4, 4, 0, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="peer-comparison" className="space-y-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UsersRound className="h-5 w-5 text-pharmacy-primary" />
                  Benchmark Against Similar Pharmacies
                </CardTitle>
                <CardDescription>
                  See how your pharmacy compares to similar businesses in your region
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {peerComparisonData.map((item, idx) => (
                      <div key={idx} className={`p-4 rounded-lg border ${
                        item.performance === 'above' ? 'bg-green-50 border-green-100' : 
                        item.performance === 'below' ? 'bg-amber-50 border-amber-100' : 
                        'bg-gray-50 border-gray-100'
                      }`}>
                        <p className="text-sm text-gray-600">{item.metric}</p>
                        <div className="flex items-end justify-between mt-1">
                          <div>
                            <p className="text-2xl font-bold text-gray-900">
                              {typeof item.value === 'number' && item.metric.includes('Per') ? 
                                `£${item.value.toFixed(2)}` : 
                                typeof item.value === 'number' && item.metric.includes('Growth') ? 
                                `${item.value}%` :
                                item.value.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Your pharmacy</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-600">
                              {typeof item.peerAverage === 'number' && item.metric.includes('Per') ? 
                                `£${item.peerAverage.toFixed(2)}` : 
                                typeof item.peerAverage === 'number' && item.metric.includes('Growth') ? 
                                `${item.peerAverage}%` :
                                item.peerAverage.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Peer average</p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center">
                          <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                            item.performance === 'above' ? 'bg-green-100 text-green-700' : 
                            item.performance === 'below' ? 'bg-amber-100 text-amber-700' : 
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {item.percentDiff}% {item.performance} average
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Card className="border-gray-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Peer Comparison Insight</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                        <div className="flex items-start">
                          <div className="bg-blue-100 p-1.5 rounded-full mr-3">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-gray-800">
                              Your pharmacy is outperforming peers in payment growth and prescription volume, but has a higher cost per item than similar pharmacies. This suggests an opportunity to review your dispensing mix for cost optimization.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="proactive-alerts" className="space-y-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-pharmacy-primary" />
                  Proactive Payment Alerts
                </CardTitle>
                <CardDescription>
                  Automated alerts to highlight issues and opportunities in your pharmacy payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alertsData.map((alert, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border ${
                      alert.severity === 'positive' ? 'border-green-200 bg-green-50' : 
                      alert.severity === 'warning' ? 'border-amber-200 bg-amber-50' : 
                      'border-blue-200 bg-blue-50'
                    }`}>
                      <div className="flex items-start">
                        <div className={`p-1.5 rounded-full mr-3 ${
                          alert.severity === 'positive' ? 'bg-green-100' : 
                          alert.severity === 'warning' ? 'bg-amber-100' : 
                          'bg-blue-100'
                        }`}>
                          {alert.severity === 'positive' ? (
                            <ArrowUp className={`h-5 w-5 ${
                              alert.severity === 'positive' ? 'text-green-600' : 
                              alert.severity === 'warning' ? 'text-amber-600' : 
                              'text-blue-600'
                            }`} />
                          ) : alert.severity === 'warning' ? (
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                          ) : (
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className={`font-medium ${
                              alert.severity === 'positive' ? 'text-green-800' : 
                              alert.severity === 'warning' ? 'text-amber-800' : 
                              'text-blue-800'
                            }`}>
                              {alert.title}
                            </h3>
                            <span className="text-xs text-gray-500">{alert.date}</span>
                          </div>
                          <p className={`text-sm mt-1 ${
                            alert.severity === 'positive' ? 'text-green-700' : 
                            alert.severity === 'warning' ? 'text-amber-700' : 
                            'text-blue-700'
                          }`}>
                            {alert.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start">
                      <div className="bg-gray-100 p-1.5 rounded-full mr-3">
                        <AlertCircle className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Proactive Alert System</h3>
                        <p className="text-sm text-gray-700 mt-1">
                          Our AI continuously monitors your pharmacy data and payment patterns to detect anomalies, identify opportunities, and alert you to potential issues before they impact your business.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default AlternativeDashboardPreview;
