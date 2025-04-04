
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface PharmacyDashboardProps {
  view: "summary" | "details";
}

const PharmacyDashboard = ({ view }: PharmacyDashboardProps) => {
  const [isBlurred, setIsBlurred] = useState(true);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // Mock data based on the provided information
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

  // Data for charts - updated with red theme colors
  const serviceBreakdownData = [
    { name: "AMS Items", value: itemCounts.ams, color: "#9c1f28" },
    { name: "M:CR Items", value: itemCounts.mcr, color: "#c73845" },
    { name: "NHS PFS Items", value: itemCounts.nhs, color: "#e85a68" },
    { name: "CPUS Items", value: itemCounts.cpus, color: "#f27d88" },
    { name: "Other Items", value: itemCounts.other, color: "#f9a3aa" }
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

  const handleUploadDemo = () => {
    // Simulate data loading from CSV
    setTimeout(() => {
      setIsDataLoaded(true);
      setIsBlurred(false);
    }, 1000);
  };

  const handleSignUpPrompt = () => {
    // This would show a sign-up prompt in a real application
    alert("Sign up to access full dashboard features!");
  };

  return (
    <div className="space-y-8">
      {!isDataLoaded && (
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-red-900/90 to-red-700 text-white">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-display">
                Upload Demo Data
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center mb-6">
              <Upload className="mx-auto h-12 w-12 text-red-600 mb-2" />
              <h3 className="text-lg font-medium mb-2">Upload CSV File</h3>
              <p className="text-gray-500 mb-4">Or try our demo data to see the dashboard in action</p>
            </div>
            <div className="flex gap-4">
              <Button 
                onClick={handleUploadDemo} 
                className="bg-red-700 hover:bg-red-800"
              >
                Load Demo Data
              </Button>
              <Button variant="outline" className="border-red-200 text-red-700">
                Upload CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {isDataLoaded && (
        <Card className="border border-gray-200 shadow-sm relative">
          <CardHeader className="bg-gradient-to-r from-red-900/90 to-red-700 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="text-xl md:text-2xl font-display">
                  COMMUNITY PHARMACY PAYMENT SUMMARY
                </CardTitle>
                <p className="text-white/80 mt-1">Pharmacy eSchedule Dashboard</p>
              </div>
              <div className="flex flex-col items-start md:items-end text-sm">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <span className="text-white/80">Contractor Code:</span>
                  <span className="font-medium">{pharmacyInfo.contractorCode}</span>
                  <span className="text-white/80">Dispensing Month:</span>
                  <span className="font-medium">{pharmacyInfo.dispensingMonth}</span>
                  <span className="text-white/80">In Transition:</span>
                  <span className="font-medium">{pharmacyInfo.inTransition}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {view === "summary" && (
              <div className={`space-y-8 ${isBlurred ? 'filter blur-sm' : ''}`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-red-50 to-red-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium text-gray-700">Total Items Dispensed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-red-900">{itemCounts.total.toLocaleString()}</div>
                      <p className="text-sm text-gray-500 mt-1">Excluding stock orders</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-red-50 to-red-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium text-gray-700">Gross Ingredient Cost</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-red-900">£{costs.totalGross.toLocaleString('en-UK', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}</div>
                      <p className="text-sm text-gray-500 mt-1">Total cost before deductions</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-red-50 to-red-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium text-gray-700">Average Value per Item</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-red-900">£{costs.avgGross.toLocaleString('en-UK', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}</div>
                      <p className="text-sm text-gray-500 mt-1">Average cost per dispensed item</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl text-gray-800">Service Items Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={serviceBreakdownData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={90}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                            >
                              {serviceBreakdownData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                            <Tooltip 
                              formatter={(value: any) => [`${value.toLocaleString()} Items`, 'Count']}
                              labelFormatter={(name) => `${name}`}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl text-gray-800">Supplementary Payments</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={supplementaryPaymentsData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                          >
                            <XAxis 
                              dataKey="name" 
                              angle={-45}
                              textAnchor="end"
                              height={70}
                              tick={{ fontSize: 12 }}
                            />
                            <YAxis 
                              tickFormatter={(value) => `£${value.toLocaleString('en-UK', {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                              })}`}
                            />
                            <Tooltip 
                              formatter={(value: any) => [`£${value.toLocaleString('en-UK', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}`, 'Amount']}
                            />
                            <Bar dataKey="value" fill="#b91c1c" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader className="border-b">
                    <CardTitle className="text-xl text-gray-800">Financial Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                          <p className="text-sm text-gray-600">Net Ingredient Cost</p>
                          <p className="text-2xl font-semibold text-red-900">
                            £{payments.netIngredientCost.toLocaleString('en-UK', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </p>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                          <p className="text-sm text-gray-600">Total Supplementary & Service</p>
                          <p className="text-2xl font-semibold text-red-900">
                            £{payments.supplementaryPayments.toLocaleString('en-UK', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </p>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                          <p className="text-sm text-gray-600">Net Payment to Bank</p>
                          <p className="text-2xl font-semibold text-red-900">
                            £{payments.netPayment.toLocaleString('en-UK', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-red-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-gray-700 font-semibold">Payment Item</th>
                              <th className="px-4 py-3 text-right text-gray-700 font-semibold">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            <tr>
                              <td className="px-4 py-3 text-gray-700">Net Ingredient Cost</td>
                              <td className="px-4 py-3 text-right text-gray-700">
                                £{payments.netIngredientCost.toLocaleString('en-UK', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                })}
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 text-gray-700">Out Of Pocket Expenses</td>
                              <td className="px-4 py-3 text-right text-gray-700">
                                £{payments.outOfPocket.toLocaleString('en-UK', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                })}
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 text-gray-700">Dispensing Pool Payment</td>
                              <td className="px-4 py-3 text-right text-gray-700">
                                £{payments.dispensingPoolPayment.toLocaleString('en-UK', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                })}
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 text-gray-700">Establishment Payment</td>
                              <td className="px-4 py-3 text-right text-gray-700">
                                £{payments.establishmentPayment.toLocaleString('en-UK', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                })}
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 text-gray-700">Pharmacy First Base Payment</td>
                              <td className="px-4 py-3 text-right text-gray-700">
                                £{payments.pharmacyFirstBase.toLocaleString('en-UK', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                })}
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 text-gray-700">Pharmacy First Activity Payment</td>
                              <td className="px-4 py-3 text-right text-gray-700">
                                £{payments.pharmacyFirstActivity.toLocaleString('en-UK', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                })}
                              </td>
                            </tr>
                            <tr className="bg-red-50">
                              <td className="px-4 py-3 font-semibold text-red-900">Net Payment to Bank</td>
                              <td className="px-4 py-3 text-right font-semibold text-red-900">
                                £{payments.netPayment.toLocaleString('en-UK', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                })}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {view === "details" && (
              <div className={`space-y-8 ${isBlurred ? 'filter blur-sm' : ''}`}>
                <Card className="overflow-x-auto">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-800">Payment Schedule Details</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <table className="w-full text-sm">
                      <thead className="bg-red-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-gray-700 font-semibold">Item</th>
                          <th className="px-4 py-3 text-right text-gray-700 font-semibold">Count/Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td colSpan={2} className="px-4 py-2 bg-gray-100 font-medium">Item Counts by Service</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-gray-700">AMS Items</td>
                          <td className="px-4 py-2 text-right text-gray-700">{itemCounts.ams.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-gray-700">M:CR (CMS) Items</td>
                          <td className="px-4 py-2 text-right text-gray-700">{itemCounts.mcr.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-gray-700">NHS PFS Items</td>
                          <td className="px-4 py-2 text-right text-gray-700">{itemCounts.nhs.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-gray-700">CPUS Items (inc UCF)</td>
                          <td className="px-4 py-2 text-right text-gray-700">{itemCounts.cpus.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-gray-700">Other Items</td>
                          <td className="px-4 py-2 text-right text-gray-700">{itemCounts.other.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-gray-700 font-medium">Total Items (excl stock orders)</td>
                          <td className="px-4 py-2 text-right text-gray-700 font-medium">{itemCounts.total.toLocaleString()}</td>
                        </tr>
                        
                        <tr>
                          <td colSpan={2} className="px-4 py-2 bg-gray-100 font-medium">Gross Ingredient Cost by Service</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-gray-700">AMS Items</td>
                          <td className="px-4 py-2 text-right text-gray-700">
                            £{costs.amsGross.toLocaleString('en-UK', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-gray-700">M:CR (CMS) Items</td>
                          <td className="px-4 py-2 text-right text-gray-700">
                            £{costs.mcrGross.toLocaleString('en-UK', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-gray-700">NHS PFS Items</td>
                          <td className="px-4 py-2 text-right text-gray-700">
                            £{costs.nhsGross.toLocaleString('en-UK', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-gray-700">CPUS Items (inc UCF)</td>
                          <td className="px-4 py-2 text-right text-gray-700">
                            £{costs.cpusGross.toLocaleString('en-UK', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-gray-700">Other Items</td>
                          <td className="px-4 py-2 text-right text-gray-700">
                            £{costs.otherGross.toLocaleString('en-UK', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-gray-700 font-medium">Total Gross Ingredient Cost</td>
                          <td className="px-4 py-2 text-right text-gray-700 font-medium">
                            £{costs.totalGross.toLocaleString('en-UK', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </td>
                        </tr>
                        
                        <tr>
                          <td colSpan={2} className="px-4 py-2 bg-gray-100 font-medium">Payment Breakdown</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-gray-700">Net Ingredient Cost</td>
                          <td className="px-4 py-2 text-right text-gray-700">
                            £{payments.netIngredientCost.toLocaleString('en-UK', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-gray-700">Out Of Pocket Expenses</td>
                          <td className="px-4 py-2 text-right text-gray-700">
                            £{payments.outOfPocket.toLocaleString('en-UK', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-gray-700">Supplementary & Service Payments</td>
                          <td className="px-4 py-2 text-right text-gray-700">
                            £{payments.supplementaryPayments.toLocaleString('en-UK', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-gray-700">Stock Order Subtotal</td>
                          <td className="px-4 py-2 text-right text-gray-700">
                            £{payments.stockOrderSubtotal.toLocaleString('en-UK', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-gray-700">Advance Payment Already Paid</td>
                          <td className="px-4 py-2 text-right text-gray-700">
                            £{payments.advancePayment.toLocaleString('en-UK', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-gray-700">Advance Payment Next Month</td>
                          <td className="px-4 py-2 text-right text-gray-700">
                            £{payments.nextMonthAdvance.toLocaleString('en-UK', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </td>
                        </tr>
                        <tr className="bg-red-50">
                          <td className="px-4 py-3 font-semibold text-red-900">Net Payment to Bank</td>
                          <td className="px-4 py-3 text-right font-semibold text-red-900">
                            £{payments.netPayment.toLocaleString('en-UK', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-800">Cost Distribution by Service</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={costBreakdownData}
                          layout="vertical"
                          margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                        >
                          <XAxis 
                            type="number" 
                            tickFormatter={(value) => `£${value.toLocaleString('en-UK', {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0
                            })}`}
                          />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={80} 
                          />
                          <Tooltip 
                            formatter={(value: any) => [`£${value.toLocaleString('en-UK', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}`, 'Amount']}
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
            
            {isBlurred && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="p-8 bg-white rounded-lg shadow-xl text-center z-10">
                  <h3 className="text-2xl font-bold text-red-800 mb-4">Preview Limited</h3>
                  <p className="text-gray-600 mb-6">Sign up to access the full dashboard with all your pharmacy data</p>
                  <Button 
                    onClick={handleSignUpPrompt} 
                    className="bg-red-700 hover:bg-red-800"
                  >
                    Sign Up for Full Access
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PharmacyDashboard;
