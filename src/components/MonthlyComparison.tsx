
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Calendar, ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import RegionalPaymentsChart from "./RegionalPaymentsChart";
import PaymentVarianceAnalysis from "./PaymentVarianceAnalysis";
import { PaymentData } from "@/types/paymentTypes";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

interface MonthlyComparisonProps {
  userId: string;
  currentDocument: PaymentData | null;
  comparisonDocument: PaymentData | null;
  documentList: PaymentData[];
  selectedMonth: string | null;
  comparisonMonth: string | null;
  onSelectMonth: (monthKey: string) => void;
  onSelectComparison: (monthKey: string) => void;
  loading?: boolean;
}

const formatMonth = (month: string): string => {
  if (!month) return '';
  return month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
};

const MonthlyComparison = ({ 
  userId, 
  currentDocument,
  comparisonDocument,
  documentList,
  selectedMonth,
  comparisonMonth,
  onSelectMonth,
  onSelectComparison,
  loading: externalLoading
}: MonthlyComparisonProps) => {
  const [loading, setLoading] = useState(false);

  const isLoading = externalLoading !== undefined ? externalLoading : loading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentDocument) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
                <h3 className="mt-2 text-lg font-medium">No document found</h3>
                <p className="mt-1 text-sm text-gray-500">Please select a document for comparison.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const documentOptions = documentList.map(doc => ({
    key: `${doc.month} ${doc.year}`,
    label: `${formatMonth(doc.month)} ${doc.year}`
  }));

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return '-';
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const getPercentChange = (current: number | undefined, previous: number | undefined) => {
    if (current === undefined || previous === undefined || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Current Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-red-800">
                <Calendar size={18} />
              </div>
              <select 
                value={selectedMonth || ''} 
                onChange={(e) => onSelectMonth(e.target.value)}
                className="w-full p-2 pl-8 border rounded-md capitalize"
              >
                <option value="">Select a month</option>
                {documentOptions.map(option => (
                  <option 
                    key={option.key} 
                    value={option.key}
                    className="capitalize"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Comparison Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-red-800">
                <Calendar size={18} />
              </div>
              <select 
                value={comparisonMonth || ''} 
                onChange={(e) => onSelectComparison(e.target.value)}
                className="w-full p-2 pl-8 border rounded-md capitalize"
              >
                <option value="">Select a month</option>
                {documentOptions.map(option => (
                  <option 
                    key={option.key} 
                    value={option.key}
                    className="capitalize"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <PaymentVarianceAnalysis 
        currentData={currentDocument} 
        previousData={comparisonDocument} 
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                <Calendar size={18} className="text-red-800" />
                <span className="font-bold">
                  {formatMonth(currentDocument?.month)} {currentDocument?.year}
                </span>
                {currentDocument?.contractorCode && (
                  <span className="text-sm font-normal ml-2 text-gray-500">
                    (Code: {currentDocument.contractorCode})
                  </span>
                )}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(currentDocument?.netPayment)}
                  </div>
                  <div className="text-sm text-gray-500">Net Payment</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-lg font-semibold">
                      {currentDocument?.totalItems?.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">Total Items</div>
                  </div>
                  
                  <div>
                    <div className="text-lg font-semibold">
                      {currentDocument?.financials?.grossIngredientCost 
                        ? formatCurrency(currentDocument.financials.grossIngredientCost)
                        : '-'
                      }
                    </div>
                    <div className="text-sm text-gray-500">Gross Ingredient Cost</div>
                  </div>
                </div>
              </div>
            </div>
            
            {comparisonDocument && (
              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <Calendar size={18} className="text-red-800" />
                  <span className="font-bold">
                    {formatMonth(comparisonDocument.month)} {comparisonDocument.year}
                  </span>
                  {comparisonDocument.contractorCode && (
                    <span className="text-sm font-normal ml-2 text-gray-500">
                      (Code: {comparisonDocument.contractorCode})
                    </span>
                  )}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(comparisonDocument.netPayment)}
                    </div>
                    <div className="text-sm text-gray-500">Net Payment</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-lg font-semibold">
                        {comparisonDocument.totalItems?.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">Total Items</div>
                    </div>
                    
                    <div>
                      <div className="text-lg font-semibold">
                        {comparisonDocument.financials?.grossIngredientCost 
                          ? formatCurrency(comparisonDocument.financials.grossIngredientCost)
                          : '-'
                        }
                      </div>
                      <div className="text-sm text-gray-500">Gross Ingredient Cost</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Prescription Items Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Type</TableHead>
                  <TableHead className="text-right">{formatMonth(currentDocument.month)} {currentDocument.year}</TableHead>
                  {comparisonDocument && <TableHead className="text-right">{formatMonth(comparisonDocument.month)} {comparisonDocument.year}</TableHead>}
                  {comparisonDocument && <TableHead className="text-right">Change</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Total Items</TableCell>
                  <TableCell className="text-right">{currentDocument.totalItems.toLocaleString()}</TableCell>
                  {comparisonDocument && (
                    <TableCell className="text-right">{comparisonDocument.totalItems.toLocaleString()}</TableCell>
                  )}
                  {comparisonDocument && (
                    <TableCell className="text-right font-medium">
                      {(() => {
                        const change = getPercentChange(currentDocument.totalItems, comparisonDocument.totalItems);
                        if (change === null) return '-';
                        return (
                          <div className={`flex items-center justify-end ${change < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                            {change < 0 ? (
                              <ArrowDownIcon className="h-4 w-4 mr-1" />
                            ) : (
                              <ArrowUpIcon className="h-4 w-4 mr-1" />
                            )}
                            {Math.abs(change).toFixed(1)}%
                          </div>
                        );
                      })()}
                    </TableCell>
                  )}
                </TableRow>
                
                {currentDocument.itemCounts?.ams !== undefined && (
                  <TableRow>
                    <TableCell className="font-medium">AMS Items</TableCell>
                    <TableCell className="text-right">{currentDocument.itemCounts.ams.toLocaleString()}</TableCell>
                    {comparisonDocument && (
                      <TableCell className="text-right">
                        {comparisonDocument.itemCounts?.ams?.toLocaleString() || '-'}
                      </TableCell>
                    )}
                    {comparisonDocument && comparisonDocument.itemCounts?.ams !== undefined && (
                      <TableCell className="text-right font-medium">
                        {(() => {
                          const change = getPercentChange(currentDocument.itemCounts.ams, comparisonDocument.itemCounts.ams);
                          if (change === null) return '-';
                          return (
                            <div className={`flex items-center justify-end ${change < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                              {change < 0 ? (
                                <ArrowDownIcon className="h-4 w-4 mr-1" />
                              ) : (
                                <ArrowUpIcon className="h-4 w-4 mr-1" />
                              )}
                              {Math.abs(change).toFixed(1)}%
                            </div>
                          );
                        })()}
                      </TableCell>
                    )}
                  </TableRow>
                )}
                
                {currentDocument.itemCounts?.mcr !== undefined && (
                  <TableRow>
                    <TableCell className="font-medium">MCR Items</TableCell>
                    <TableCell className="text-right">{currentDocument.itemCounts.mcr.toLocaleString()}</TableCell>
                    {comparisonDocument && (
                      <TableCell className="text-right">
                        {comparisonDocument.itemCounts?.mcr?.toLocaleString() || '-'}
                      </TableCell>
                    )}
                    {comparisonDocument && comparisonDocument.itemCounts?.mcr !== undefined && (
                      <TableCell className="text-right font-medium">
                        {(() => {
                          const change = getPercentChange(currentDocument.itemCounts.mcr, comparisonDocument.itemCounts.mcr);
                          if (change === null) return '-';
                          return (
                            <div className={`flex items-center justify-end ${change < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                              {change < 0 ? (
                                <ArrowDownIcon className="h-4 w-4 mr-1" />
                              ) : (
                                <ArrowUpIcon className="h-4 w-4 mr-1" />
                              )}
                              {Math.abs(change).toFixed(1)}%
                            </div>
                          );
                        })()}
                      </TableCell>
                    )}
                  </TableRow>
                )}
                
                {currentDocument.itemCounts?.nhsPfs !== undefined && (
                  <TableRow>
                    <TableCell className="font-medium">NHS PFS Items</TableCell>
                    <TableCell className="text-right">{currentDocument.itemCounts.nhsPfs.toLocaleString()}</TableCell>
                    {comparisonDocument && (
                      <TableCell className="text-right">
                        {comparisonDocument.itemCounts?.nhsPfs?.toLocaleString() || '-'}
                      </TableCell>
                    )}
                    {comparisonDocument && comparisonDocument.itemCounts?.nhsPfs !== undefined && (
                      <TableCell className="text-right font-medium">
                        {(() => {
                          const change = getPercentChange(currentDocument.itemCounts.nhsPfs, comparisonDocument.itemCounts.nhsPfs);
                          if (change === null) return '-';
                          return (
                            <div className={`flex items-center justify-end ${change < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                              {change < 0 ? (
                                <ArrowDownIcon className="h-4 w-4 mr-1" />
                              ) : (
                                <ArrowUpIcon className="h-4 w-4 mr-1" />
                              )}
                              {Math.abs(change).toFixed(1)}%
                            </div>
                          );
                        })()}
                      </TableCell>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Financial Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">{formatMonth(currentDocument.month)} {currentDocument.year}</TableHead>
                  {comparisonDocument && <TableHead className="text-right">{formatMonth(comparisonDocument.month)} {comparisonDocument.year}</TableHead>}
                  {comparisonDocument && <TableHead className="text-right">Change</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentDocument.financials?.grossIngredientCost !== undefined && (
                  <TableRow>
                    <TableCell className="font-medium">Gross Ingredient Cost</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(currentDocument.financials.grossIngredientCost)}
                    </TableCell>
                    {comparisonDocument && (
                      <TableCell className="text-right">
                        {formatCurrency(comparisonDocument.financials?.grossIngredientCost)}
                      </TableCell>
                    )}
                    {comparisonDocument && comparisonDocument.financials?.grossIngredientCost !== undefined && (
                      <TableCell className="text-right font-medium">
                        {(() => {
                          const change = getPercentChange(
                            currentDocument.financials.grossIngredientCost, 
                            comparisonDocument.financials.grossIngredientCost
                          );
                          if (change === null) return '-';
                          return (
                            <div className={`flex items-center justify-end ${change < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                              {change < 0 ? (
                                <ArrowDownIcon className="h-4 w-4 mr-1" />
                              ) : (
                                <ArrowUpIcon className="h-4 w-4 mr-1" />
                              )}
                              {Math.abs(change).toFixed(1)}%
                            </div>
                          );
                        })()}
                      </TableCell>
                    )}
                  </TableRow>
                )}
                
                {currentDocument.financials?.netIngredientCost !== undefined && (
                  <TableRow>
                    <TableCell className="font-medium">Net Ingredient Cost</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(currentDocument.financials.netIngredientCost)}
                    </TableCell>
                    {comparisonDocument && (
                      <TableCell className="text-right">
                        {formatCurrency(comparisonDocument.financials?.netIngredientCost)}
                      </TableCell>
                    )}
                    {comparisonDocument && comparisonDocument.financials?.netIngredientCost !== undefined && (
                      <TableCell className="text-right font-medium">
                        {(() => {
                          const change = getPercentChange(
                            currentDocument.financials.netIngredientCost, 
                            comparisonDocument.financials.netIngredientCost
                          );
                          if (change === null) return '-';
                          return (
                            <div className={`flex items-center justify-end ${change < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                              {change < 0 ? (
                                <ArrowDownIcon className="h-4 w-4 mr-1" />
                              ) : (
                                <ArrowUpIcon className="h-4 w-4 mr-1" />
                              )}
                              {Math.abs(change).toFixed(1)}%
                            </div>
                          );
                        })()}
                      </TableCell>
                    )}
                  </TableRow>
                )}
                
                {currentDocument.financials?.dispensingPool !== undefined && (
                  <TableRow>
                    <TableCell className="font-medium">Dispensing Pool</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(currentDocument.financials.dispensingPool)}
                    </TableCell>
                    {comparisonDocument && (
                      <TableCell className="text-right">
                        {formatCurrency(comparisonDocument.financials?.dispensingPool)}
                      </TableCell>
                    )}
                    {comparisonDocument && comparisonDocument.financials?.dispensingPool !== undefined && (
                      <TableCell className="text-right font-medium">
                        {(() => {
                          const change = getPercentChange(
                            currentDocument.financials.dispensingPool, 
                            comparisonDocument.financials.dispensingPool
                          );
                          if (change === null) return '-';
                          return (
                            <div className={`flex items-center justify-end ${change < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                              {change < 0 ? (
                                <ArrowDownIcon className="h-4 w-4 mr-1" />
                              ) : (
                                <ArrowUpIcon className="h-4 w-4 mr-1" />
                              )}
                              {Math.abs(change).toFixed(1)}%
                            </div>
                          );
                        })()}
                      </TableCell>
                    )}
                  </TableRow>
                )}
                
                {currentDocument.financials?.pharmacyFirstBase !== undefined && (
                  <TableRow>
                    <TableCell className="font-medium">Pharmacy First Base</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(currentDocument.financials.pharmacyFirstBase)}
                    </TableCell>
                    {comparisonDocument && (
                      <TableCell className="text-right">
                        {formatCurrency(comparisonDocument.financials?.pharmacyFirstBase)}
                      </TableCell>
                    )}
                    {comparisonDocument && comparisonDocument.financials?.pharmacyFirstBase !== undefined && (
                      <TableCell className="text-right font-medium">
                        {(() => {
                          const change = getPercentChange(
                            currentDocument.financials.pharmacyFirstBase, 
                            comparisonDocument.financials.pharmacyFirstBase
                          );
                          if (change === null) return '-';
                          return (
                            <div className={`flex items-center justify-end ${change < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                              {change < 0 ? (
                                <ArrowDownIcon className="h-4 w-4 mr-1" />
                              ) : (
                                <ArrowUpIcon className="h-4 w-4 mr-1" />
                              )}
                              {Math.abs(change).toFixed(1)}%
                            </div>
                          );
                        })()}
                      </TableCell>
                    )}
                  </TableRow>
                )}
                
                {currentDocument.financials?.pharmacyFirstActivity !== undefined && (
                  <TableRow>
                    <TableCell className="font-medium">Pharmacy First Activity</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(currentDocument.financials.pharmacyFirstActivity)}
                    </TableCell>
                    {comparisonDocument && (
                      <TableCell className="text-right">
                        {formatCurrency(comparisonDocument.financials?.pharmacyFirstActivity)}
                      </TableCell>
                    )}
                    {comparisonDocument && comparisonDocument.financials?.pharmacyFirstActivity !== undefined && (
                      <TableCell className="text-right font-medium">
                        {(() => {
                          const change = getPercentChange(
                            currentDocument.financials.pharmacyFirstActivity, 
                            comparisonDocument.financials.pharmacyFirstActivity
                          );
                          if (change === null) return '-';
                          return (
                            <div className={`flex items-center justify-end ${change < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                              {change < 0 ? (
                                <ArrowDownIcon className="h-4 w-4 mr-1" />
                              ) : (
                                <ArrowUpIcon className="h-4 w-4 mr-1" />
                              )}
                              {Math.abs(change).toFixed(1)}%
                            </div>
                          );
                        })()}
                      </TableCell>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {currentDocument.pfsDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Pharmacy First Service Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">{formatMonth(currentDocument.month)} {currentDocument.year}</TableHead>
                    {comparisonDocument && <TableHead className="text-right">{formatMonth(comparisonDocument.month)} {comparisonDocument.year}</TableHead>}
                    {comparisonDocument && <TableHead className="text-right">Change</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentDocument.pfsDetails?.treatmentItems !== undefined && (
                    <TableRow>
                      <TableCell className="font-medium">Treatment Items</TableCell>
                      <TableCell className="text-right">
                        {currentDocument.pfsDetails.treatmentItems.toLocaleString()}
                      </TableCell>
                      {comparisonDocument && (
                        <TableCell className="text-right">
                          {comparisonDocument.pfsDetails?.treatmentItems?.toLocaleString() || '-'}
                        </TableCell>
                      )}
                      {comparisonDocument && comparisonDocument.pfsDetails?.treatmentItems !== undefined && (
                        <TableCell className="text-right font-medium">
                          {(() => {
                            const change = getPercentChange(
                              currentDocument.pfsDetails.treatmentItems, 
                              comparisonDocument.pfsDetails.treatmentItems
                            );
                            if (change === null) return '-';
                            return (
                              <div className={`flex items-center justify-end ${change < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                                {change < 0 ? (
                                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                                ) : (
                                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                                )}
                                {Math.abs(change).toFixed(1)}%
                              </div>
                            );
                          })()}
                        </TableCell>
                      )}
                    </TableRow>
                  )}
                  
                  {currentDocument.pfsDetails?.consultations !== undefined && (
                    <TableRow>
                      <TableCell className="font-medium">Consultations</TableCell>
                      <TableCell className="text-right">
                        {currentDocument.pfsDetails.consultations.toLocaleString()}
                      </TableCell>
                      {comparisonDocument && (
                        <TableCell className="text-right">
                          {comparisonDocument.pfsDetails?.consultations?.toLocaleString() || '-'}
                        </TableCell>
                      )}
                      {comparisonDocument && comparisonDocument.pfsDetails?.consultations !== undefined && (
                        <TableCell className="text-right font-medium">
                          {(() => {
                            const change = getPercentChange(
                              currentDocument.pfsDetails.consultations, 
                              comparisonDocument.pfsDetails.consultations
                            );
                            if (change === null) return '-';
                            return (
                              <div className={`flex items-center justify-end ${change < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                                {change < 0 ? (
                                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                                ) : (
                                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                                )}
                                {Math.abs(change).toFixed(1)}%
                              </div>
                            );
                          })()}
                        </TableCell>
                      )}
                    </TableRow>
                  )}
                  
                  {currentDocument.pfsDetails?.totalPayment !== undefined && (
                    <TableRow>
                      <TableCell className="font-medium">Total PFS Payment</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(currentDocument.pfsDetails.totalPayment)}
                      </TableCell>
                      {comparisonDocument && (
                        <TableCell className="text-right">
                          {formatCurrency(comparisonDocument.pfsDetails?.totalPayment)}
                        </TableCell>
                      )}
                      {comparisonDocument && comparisonDocument.pfsDetails?.totalPayment !== undefined && (
                        <TableCell className="text-right font-medium">
                          {(() => {
                            const change = getPercentChange(
                              currentDocument.pfsDetails.totalPayment, 
                              comparisonDocument.pfsDetails.totalPayment
                            );
                            if (change === null) return '-';
                            return (
                              <div className={`flex items-center justify-end ${change < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                                {change < 0 ? (
                                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                                ) : (
                                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                                )}
                                {Math.abs(change).toFixed(1)}%
                              </div>
                            );
                          })()}
                        </TableCell>
                      )}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
      
      {currentDocument.regionalPayments && (
        <Card>
          <CardHeader>
            <CardTitle>Regional Payments Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <RegionalPaymentsChart regionalPayments={currentDocument.regionalPayments} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MonthlyComparison;
