import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, InfoIcon } from "lucide-react";
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
}

const MonthlyComparison = ({ 
  userId, 
  currentDocument,
  comparisonDocument,
  documentList,
  selectedMonth,
  comparisonMonth,
  onSelectMonth,
  onSelectComparison
}: MonthlyComparisonProps) => {
  const [loading, setLoading] = useState(false);

  if (loading) {
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
    label: `${doc.month} ${doc.year}`
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
            <select 
              value={selectedMonth || ''} 
              onChange={(e) => onSelectMonth(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select a month</option>
              {documentOptions.map(option => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Comparison Month</CardTitle>
          </CardHeader>
          <CardContent>
            <select 
              value={comparisonMonth || ''} 
              onChange={(e) => onSelectComparison(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select a month</option>
              {documentOptions.map(option => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3">
                {currentDocument?.month} {currentDocument?.year}
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
                <h3 className="text-lg font-medium mb-3">
                  {comparisonDocument.month} {comparisonDocument.year}
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
      
      <PaymentVarianceAnalysis 
        currentData={currentDocument} 
        previousData={comparisonDocument} 
      />
      
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
                  {comparisonDocument && <TableHead className="text-right">{comparisonDocument.month}</TableHead>}
                  <TableHead className="text-right">{currentDocument.month}</TableHead>
                  {comparisonDocument && <TableHead className="text-right">Change</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Total Items</TableCell>
                  {comparisonDocument && (
                    <TableCell className="text-right">{comparisonDocument.totalItems.toLocaleString()}</TableCell>
                  )}
                  <TableCell className="text-right">{currentDocument.totalItems.toLocaleString()}</TableCell>
                  {comparisonDocument && (
                    <TableCell className="text-right">
                      {getPercentChange(currentDocument.totalItems, comparisonDocument.totalItems)?.toFixed(1)}%
                    </TableCell>
                  )}
                </TableRow>
                
                {currentDocument.itemCounts?.ams !== undefined && (
                  <TableRow>
                    <TableCell className="font-medium">AMS Items</TableCell>
                    {comparisonDocument && (
                      <TableCell className="text-right">
                        {comparisonDocument.itemCounts?.ams?.toLocaleString() || '-'}
                      </TableCell>
                    )}
                    <TableCell className="text-right">{currentDocument.itemCounts.ams.toLocaleString()}</TableCell>
                    {comparisonDocument && comparisonDocument.itemCounts?.ams !== undefined && (
                      <TableCell className="text-right">
                        {getPercentChange(currentDocument.itemCounts.ams, comparisonDocument.itemCounts.ams)?.toFixed(1)}%
                      </TableCell>
                    )}
                  </TableRow>
                )}
                
                {currentDocument.itemCounts?.mcr !== undefined && (
                  <TableRow>
                    <TableCell className="font-medium">MCR Items</TableCell>
                    {comparisonDocument && (
                      <TableCell className="text-right">
                        {comparisonDocument.itemCounts?.mcr?.toLocaleString() || '-'}
                      </TableCell>
                    )}
                    <TableCell className="text-right">{currentDocument.itemCounts.mcr.toLocaleString()}</TableCell>
                    {comparisonDocument && comparisonDocument.itemCounts?.mcr !== undefined && (
                      <TableCell className="text-right">
                        {getPercentChange(currentDocument.itemCounts.mcr, comparisonDocument.itemCounts.mcr)?.toFixed(1)}%
                      </TableCell>
                    )}
                  </TableRow>
                )}
                
                {currentDocument.itemCounts?.nhsPfs !== undefined && (
                  <TableRow>
                    <TableCell className="font-medium">NHS PFS Items</TableCell>
                    {comparisonDocument && (
                      <TableCell className="text-right">
                        {comparisonDocument.itemCounts?.nhsPfs?.toLocaleString() || '-'}
                      </TableCell>
                    )}
                    <TableCell className="text-right">{currentDocument.itemCounts.nhsPfs.toLocaleString()}</TableCell>
                    {comparisonDocument && comparisonDocument.itemCounts?.nhsPfs !== undefined && (
                      <TableCell className="text-right">
                        {getPercentChange(currentDocument.itemCounts.nhsPfs, comparisonDocument.itemCounts.nhsPfs)?.toFixed(1)}%
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
                  {comparisonDocument && <TableHead className="text-right">{comparisonDocument.month}</TableHead>}
                  <TableHead className="text-right">{currentDocument.month}</TableHead>
                  {comparisonDocument && <TableHead className="text-right">Change</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentDocument.financials?.grossIngredientCost !== undefined && (
                  <TableRow>
                    <TableCell className="font-medium">Gross Ingredient Cost</TableCell>
                    {comparisonDocument && (
                      <TableCell className="text-right">
                        {formatCurrency(comparisonDocument.financials?.grossIngredientCost)}
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      {formatCurrency(currentDocument.financials.grossIngredientCost)}
                    </TableCell>
                    {comparisonDocument && comparisonDocument.financials?.grossIngredientCost !== undefined && (
                      <TableCell className="text-right">
                        {getPercentChange(
                          currentDocument.financials.grossIngredientCost, 
                          comparisonDocument.financials.grossIngredientCost
                        )?.toFixed(1)}%
                      </TableCell>
                    )}
                  </TableRow>
                )}
                
                {currentDocument.financials?.netIngredientCost !== undefined && (
                  <TableRow>
                    <TableCell className="font-medium">Net Ingredient Cost</TableCell>
                    {comparisonDocument && (
                      <TableCell className="text-right">
                        {formatCurrency(comparisonDocument.financials?.netIngredientCost)}
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      {formatCurrency(currentDocument.financials.netIngredientCost)}
                    </TableCell>
                    {comparisonDocument && comparisonDocument.financials?.netIngredientCost !== undefined && (
                      <TableCell className="text-right">
                        {getPercentChange(
                          currentDocument.financials.netIngredientCost, 
                          comparisonDocument.financials.netIngredientCost
                        )?.toFixed(1)}%
                      </TableCell>
                    )}
                  </TableRow>
                )}
                
                {currentDocument.financials?.dispensingPool !== undefined && (
                  <TableRow>
                    <TableCell className="font-medium">Dispensing Pool</TableCell>
                    {comparisonDocument && (
                      <TableCell className="text-right">
                        {formatCurrency(comparisonDocument.financials?.dispensingPool)}
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      {formatCurrency(currentDocument.financials.dispensingPool)}
                    </TableCell>
                    {comparisonDocument && comparisonDocument.financials?.dispensingPool !== undefined && (
                      <TableCell className="text-right">
                        {getPercentChange(
                          currentDocument.financials.dispensingPool, 
                          comparisonDocument.financials.dispensingPool
                        )?.toFixed(1)}%
                      </TableCell>
                    )}
                  </TableRow>
                )}
                
                {currentDocument.financials?.pharmacyFirstBase !== undefined && (
                  <TableRow>
                    <TableCell className="font-medium">Pharmacy First Base</TableCell>
                    {comparisonDocument && (
                      <TableCell className="text-right">
                        {formatCurrency(comparisonDocument.financials?.pharmacyFirstBase)}
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      {formatCurrency(currentDocument.financials.pharmacyFirstBase)}
                    </TableCell>
                    {comparisonDocument && comparisonDocument.financials?.pharmacyFirstBase !== undefined && (
                      <TableCell className="text-right">
                        {getPercentChange(
                          currentDocument.financials.pharmacyFirstBase, 
                          comparisonDocument.financials.pharmacyFirstBase
                        )?.toFixed(1)}%
                      </TableCell>
                    )}
                  </TableRow>
                )}
                
                {currentDocument.financials?.pharmacyFirstActivity !== undefined && (
                  <TableRow>
                    <TableCell className="font-medium">Pharmacy First Activity</TableCell>
                    {comparisonDocument && (
                      <TableCell className="text-right">
                        {formatCurrency(comparisonDocument.financials?.pharmacyFirstActivity)}
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      {formatCurrency(currentDocument.financials.pharmacyFirstActivity)}
                    </TableCell>
                    {comparisonDocument && comparisonDocument.financials?.pharmacyFirstActivity !== undefined && (
                      <TableCell className="text-right">
                        {getPercentChange(
                          currentDocument.financials.pharmacyFirstActivity, 
                          comparisonDocument.financials.pharmacyFirstActivity
                        )?.toFixed(1)}%
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
                    {comparisonDocument && <TableHead className="text-right">{comparisonDocument.month}</TableHead>}
                    <TableHead className="text-right">{currentDocument.month}</TableHead>
                    {comparisonDocument && <TableHead className="text-right">Change</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentDocument.pfsDetails?.treatmentItems !== undefined && (
                    <TableRow>
                      <TableCell className="font-medium">Treatment Items</TableCell>
                      {comparisonDocument && (
                        <TableCell className="text-right">
                          {comparisonDocument.pfsDetails?.treatmentItems?.toLocaleString() || '-'}
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        {currentDocument.pfsDetails.treatmentItems.toLocaleString()}
                      </TableCell>
                      {comparisonDocument && comparisonDocument.pfsDetails?.treatmentItems !== undefined && (
                        <TableCell className="text-right">
                          {getPercentChange(
                            currentDocument.pfsDetails.treatmentItems, 
                            comparisonDocument.pfsDetails.treatmentItems
                          )?.toFixed(1)}%
                        </TableCell>
                      )}
                    </TableRow>
                  )}
                  
                  {currentDocument.pfsDetails?.consultations !== undefined && (
                    <TableRow>
                      <TableCell className="font-medium">Consultations</TableCell>
                      {comparisonDocument && (
                        <TableCell className="text-right">
                          {comparisonDocument.pfsDetails?.consultations?.toLocaleString() || '-'}
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        {currentDocument.pfsDetails.consultations.toLocaleString()}
                      </TableCell>
                      {comparisonDocument && comparisonDocument.pfsDetails?.consultations !== undefined && (
                        <TableCell className="text-right">
                          {getPercentChange(
                            currentDocument.pfsDetails.consultations, 
                            comparisonDocument.pfsDetails.consultations
                          )?.toFixed(1)}%
                        </TableCell>
                      )}
                    </TableRow>
                  )}
                  
                  {currentDocument.pfsDetails?.totalPayment !== undefined && (
                    <TableRow>
                      <TableCell className="font-medium">Total PFS Payment</TableCell>
                      {comparisonDocument && (
                        <TableCell className="text-right">
                          {formatCurrency(comparisonDocument.pfsDetails?.totalPayment)}
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        {formatCurrency(currentDocument.pfsDetails.totalPayment)}
                      </TableCell>
                      {comparisonDocument && comparisonDocument.pfsDetails?.totalPayment !== undefined && (
                        <TableCell className="text-right">
                          {getPercentChange(
                            currentDocument.pfsDetails.totalPayment, 
                            comparisonDocument.pfsDetails.totalPayment
                          )?.toFixed(1)}%
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
