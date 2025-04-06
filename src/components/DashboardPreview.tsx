
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUp, ArrowDown, TrendingUp, BarChart2, PieChart, Activity } from "lucide-react";

const trendData = [
  { month: 'Aug', items: 8123, gic: 85000, payment: 115000 },
  { month: 'Sep', items: 8765, gic: 89500, payment: 118500 },
  { month: 'Oct', items: 9234, gic: 94200, payment: 122700 },
  { month: 'Nov', items: 9456, gic: 98500, payment: 124300 },
  { month: 'Dec', items: 9120, gic: 96800, payment: 123900 },
  { month: 'Jan', items: 9868, gic: 101708, payment: 126774 },
];

const keyMetricsData = [
  { name: 'Total Items', value: 9868, change: -1.2, trend: 'down' },
  { name: 'Gross Ingredient Cost', value: '£101,708', change: 3.5, trend: 'up' },
  { name: 'Net Payment', value: '£126,774', change: 4.1, trend: 'up' },
  { name: 'Value per Item', value: '£10.19', change: 1.8, trend: 'up' },
];

const insightData = [
  { 
    title: 'Payment Growth Outpacing Volume', 
    description: 'Your net payments increased by 4.1% while volume decreased by 1.2%.',
    trend: 'up',
    impact: 'positive'
  },
  { 
    title: 'Service Payment Optimization', 
    description: 'Pharmacy First service payments up 28% vs last quarter.',
    trend: 'up',
    impact: 'positive'
  },
  { 
    title: 'Dispensing Efficiency', 
    description: 'Higher value items contributing to improved profitability.',
    trend: 'up',
    impact: 'positive'
  },
  { 
    title: 'Potential Category M Adjustment', 
    description: 'Analysis shows likely Category M payment increase next quarter.',
    trend: 'up',
    impact: 'positive'
  }
];

const serviceData = [
  { name: 'Essential', value: 65750 },
  { name: 'Advanced', value: 24680 },
  { name: 'Community', value: 18940 },
  { name: 'Pharmacy First', value: 17404 }
];

const DashboardPreview = () => {
  return (
    <section id="dashboard" className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">Interactive Dashboard Preview</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Discover how our powerful analytics transform complex payment data into clear, actionable insights that help you make informed decisions.
          </p>
        </div>
        
        <Tabs defaultValue="insights" className="space-y-8">
          <TabsList className="mx-auto flex justify-center">
            <TabsTrigger value="insights">Key Insights</TabsTrigger>
            <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
            <TabsTrigger value="breakdown">Payment Breakdown</TabsTrigger>
          </TabsList>
          
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-gray-200">
                <CardHeader className="bg-gradient-to-r from-red-900/90 to-red-700 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    AI-Powered Insights
                  </CardTitle>
                  <CardDescription className="text-gray-100">
                    Our AI analyzes your payment data to identify trends and opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {insightData.map((insight, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-md border border-gray-100 shadow-sm">
                        <div className="flex items-start">
                          {insight.trend === 'up' ? (
                            <div className="bg-green-100 p-1.5 rounded-full mr-3">
                              <ArrowUp className="h-4 w-4 text-green-600" />
                            </div>
                          ) : (
                            <div className="bg-red-100 p-1.5 rounded-full mr-3">
                              <ArrowDown className="h-4 w-4 text-red-600" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-medium text-gray-900">{insight.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-gray-200">
                <CardHeader className="bg-gradient-to-r from-red-900/90 to-red-700 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="h-5 w-5" />
                    Key Performance Metrics
                  </CardTitle>
                  <CardDescription className="text-gray-100">
                    Track critical metrics with real-time trend indicators
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
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
            </div>
          </TabsContent>
          
          <TabsContent value="trends" className="space-y-6">
            <Card className="border-gray-200">
              <CardHeader className="bg-gradient-to-r from-red-900/90 to-red-700 text-white">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  6-Month Payment Trends
                </CardTitle>
                <CardDescription className="text-gray-100">
                  Track key financial metrics over time to identify patterns and optimize your pharmacy's performance
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={trendData}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" orientation="left" stroke="#9c1f28" />
                    <YAxis yAxisId="right" orientation="right" stroke="#2563eb" />
                    <Tooltip formatter={(value, name) => {
                      if (name === 'payment') return [`£${value.toLocaleString()}`, 'Net Payment'];
                      if (name === 'gic') return [`£${value.toLocaleString()}`, 'Gross Ingredient Cost'];
                      return [value, 'Total Items'];
                    }} />
                    <Area yAxisId="left" type="monotone" dataKey="items" name="Items" stroke="#9c1f28" fill="#9c1f28" fillOpacity={0.2} />
                    <Area yAxisId="right" type="monotone" dataKey="payment" name="payment" stroke="#2563eb" fill="#2563eb" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="breakdown" className="space-y-6">
            <Card className="border-gray-200">
              <CardHeader className="bg-gradient-to-r from-red-900/90 to-red-700 text-white">
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Service Payment Breakdown
                </CardTitle>
                <CardDescription className="text-gray-100">
                  Visualize your payment distribution across NHS pharmacy services
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={serviceData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`£${value.toLocaleString()}`, 'Payment']} />
                    <Bar dataKey="value" name="Payment" fill="#9c1f28" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default DashboardPreview;
