
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const monthlyData = [
  { month: 'Aug', items: 8123, gic: 85000 },
  { month: 'Sep', items: 8765, gic: 89500 },
  { month: 'Oct', items: 9234, gic: 94200 },
  { month: 'Nov', items: 9456, gic: 98500 },
  { month: 'Dec', items: 9120, gic: 96800 },
  { month: 'Jan', items: 9868, gic: 101708 },
];

const serviceData = [
  { name: 'AMS Items', value: 7751, color: '#9c1f28' },
  { name: 'MCR Items', value: 783, color: '#c73845' },
  { name: 'PFS Items', value: 342, color: '#e85a68' },
  { name: 'CPUS Items', value: 207, color: '#f27d88' },
  { name: 'Other Items', value: 785, color: '#f9a3aa' },
];

const paymentData = [
  { name: 'Dispensing Pool', value: 12219.24 },
  { name: 'Establishment', value: 2500.00 },
  { name: 'Pharmacy First Base', value: 1000.00 },
  { name: 'Pharmacy First Activity', value: 1400.06 },
  { name: 'PHS Services', value: 120.00 },
];

const DashboardPreview = () => {
  return (
    <section id="dashboard" className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">Interactive Dashboard Preview</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore how eSchedule transforms your payment data into intuitive visualizations for better financial insights.
          </p>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="mx-auto flex justify-center">
            <TabsTrigger value="overview">Payment Overview</TabsTrigger>
            <TabsTrigger value="services">Service Breakdown</TabsTrigger>
            <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-3 border-gray-200">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Monthly Payment Summary</span>
                    <span className="text-lg font-normal text-pharmacy-primary">January 2025</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <p className="text-sm text-gray-500">Total Items</p>
                      <p className="text-2xl font-bold text-gray-900">9,868</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <p className="text-sm text-gray-500">Gross Ingredient Cost</p>
                      <p className="text-2xl font-bold text-pharmacy-primary">£101,708.89</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <p className="text-sm text-gray-500">Average GIC</p>
                      <p className="text-2xl font-bold text-gray-900">£10.19</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <p className="text-sm text-gray-500">Net Payment</p>
                      <p className="text-2xl font-bold text-pharmacy-secondary">£126,774.45</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle>Payment Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={paymentData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip 
                        formatter={(value) => [`£${value.toLocaleString()}`, 'Amount']}
                        labelStyle={{ color: '#333' }}
                      />
                      <Bar dataKey="value" fill="#b91c1c" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card className="border-gray-200 md:col-span-2">
                <CardHeader>
                  <CardTitle>Financial Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-2 border-b">
                      <span className="text-gray-600">Total Net Ingredient Cost</span>
                      <span className="font-medium">£100,388.93</span>
                    </div>
                    <div className="flex justify-between items-center p-2 border-b">
                      <span className="text-gray-600">Supplementary & Service Payments</span>
                      <span className="font-medium">£25,586.52</span>
                    </div>
                    <div className="flex justify-between items-center p-2 border-b">
                      <span className="text-gray-600">Stock Order Subtotal</span>
                      <span className="font-medium">£175.89</span>
                    </div>
                    <div className="flex justify-between items-center p-2 border-b">
                      <span className="text-gray-600">Advance Payment (Previous)</span>
                      <span className="font-medium text-pharmacy-accent">-£138,302.12</span>
                    </div>
                    <div className="flex justify-between items-center p-2 border-b">
                      <span className="text-gray-600">Regionally Processed Payments</span>
                      <span className="font-medium">£445.15</span>
                    </div>
                    <div className="flex justify-between items-center p-2 border-b">
                      <span className="text-gray-600">CPS Levy</span>
                      <span className="font-medium">£126.27</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-pharmacy-light rounded-md">
                      <span className="font-semibold text-pharmacy-dark">Net Payment to Bank</span>
                      <span className="font-bold text-pharmacy-primary">£126,774.45</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="services" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle>Items by Service</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={serviceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        labelLine={false}
                      >
                        {serviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} items`, 'Count']} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle>Service Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr>
                          <th className="text-left p-2 border-b">Service</th>
                          <th className="text-right p-2 border-b">Items</th>
                          <th className="text-right p-2 border-b">Gross Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-2 border-b">AMS Items</td>
                          <td className="text-right p-2 border-b">7,751</td>
                          <td className="text-right p-2 border-b">£84,804.68</td>
                        </tr>
                        <tr>
                          <td className="p-2 border-b">MCR (CMS) Items</td>
                          <td className="text-right p-2 border-b">783</td>
                          <td className="text-right p-2 border-b">£5,447.44</td>
                        </tr>
                        <tr>
                          <td className="p-2 border-b">NHS PFS Items</td>
                          <td className="text-right p-2 border-b">342</td>
                          <td className="text-right p-2 border-b">£1,294.58</td>
                        </tr>
                        <tr>
                          <td className="p-2 border-b">CPUS Items (inc UCF)</td>
                          <td className="text-right p-2 border-b">207</td>
                          <td className="text-right p-2 border-b">£1,630.87</td>
                        </tr>
                        <tr>
                          <td className="p-2 border-b">Other Items</td>
                          <td className="text-right p-2 border-b">785</td>
                          <td className="text-right p-2 border-b">£8,531.32</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="p-2 font-medium">Total</td>
                          <td className="text-right p-2 font-medium">9,868</td>
                          <td className="text-right p-2 font-medium">£101,708.89</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="trends" className="space-y-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle>6-Month Trends</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={monthlyData}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Area yAxisId="left" type="monotone" dataKey="items" stroke="#9c1f28" fill="#9c1f28" fillOpacity={0.2} name="Items" />
                    <Area yAxisId="right" type="monotone" dataKey="gic" stroke="#c73845" fill="#c73845" fillOpacity={0.2} name="GIC (£)" />
                  </AreaChart>
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
