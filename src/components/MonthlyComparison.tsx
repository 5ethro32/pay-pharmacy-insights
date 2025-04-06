
import React, { useState, useEffect } from "react";
import { PaymentData } from "@/types/paymentTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Grid, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import TrendIndicator from "@/components/charts/TrendIndicator";
import { formatCurrency } from "@/utils/documentUtils";
import MonthSelector from "./MonthSelector"; // Import the month selector component

interface MonthlyComparisonProps {
  userId: string;
  documentList: PaymentData[];
  loading: boolean;
  currentDocument: PaymentData | null;
  comparisonDocument: PaymentData | null;
  selectedMonth: string;
  comparisonMonth: string;
  onSelectMonth: (monthKey: string) => void;
  onSelectComparison: (monthKey: string) => void;
}

const MonthlyComparison: React.FC<MonthlyComparisonProps> = ({
  userId,
  documentList,
  loading,
  currentDocument,
  comparisonDocument,
  selectedMonth,
  comparisonMonth,
  onSelectMonth,
  onSelectComparison
}) => {
  // Format month for display (e.g., "January 2023")
  const formatMonth = (month: string): string => {
    if (!month) return '';
    return month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
  };
  
  // Convert documentList to options for selectors
  const monthOptions = documentList.map(doc => ({
    label: `${formatMonth(doc.month)} ${doc.year}`,
    value: `${doc.month} ${doc.year}`
  }));
  
  // Calculate percentage difference between two values
  const calculatePercentDiff = (current: number, comparison: number): number => {
    if (comparison === 0) return current > 0 ? 100 : 0;
    return ((current - comparison) / comparison) * 100;
  };
  
  // Function to swap the selected months
  const handleSwapMonths = () => {
    const temp = selectedMonth;
    onSelectMonth(comparisonMonth);
    onSelectComparison(temp);
  };
  
  if (loading) {
    return (
      <div className="h-60 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
      </div>
    );
  }
  
  if (!documentList || documentList.length < 2 || !currentDocument || !comparisonDocument) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Please upload at least two payment documents to use comparison features.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <MonthSelector
            value={selectedMonth}
            onChange={onSelectMonth}
            options={monthOptions}
            placeholder="Select month"
            className="w-full sm:w-[180px]"
          />
          
          <div className="hidden sm:flex items-center">
            <ArrowRightLeft className="mx-1 text-gray-400" size={20} />
          </div>
          
          <MonthSelector
            value={comparisonMonth}
            onChange={onSelectComparison}
            options={monthOptions.filter(option => option.value !== selectedMonth)}
            placeholder="Select comparison"
            className="w-full sm:w-[180px]"
          />
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSwapMonths}
          className="w-full sm:w-auto"
        >
          <ArrowRightLeft className="mr-2 h-4 w-4" /> Swap Months
        </Button>
      </div>
      
      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metrics Column */}
        <Card className="bg-gray-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Metrics</CardTitle>
          </CardHeader>
          <CardContent className="px-3 py-0">
            <div className="space-y-4 py-3">
              <div className="p-2 bg-white rounded border border-gray-100">
                <span className="text-sm font-medium">Net Payment</span>
              </div>
              <div className="p-2 bg-white rounded border border-gray-100">
                <span className="text-sm font-medium">Gross Ingredient Cost</span>
              </div>
              <div className="p-2 bg-white rounded border border-gray-100">
                <span className="text-sm font-medium">Total Items</span>
              </div>
              <div className="p-2 bg-white rounded border border-gray-100">
                <span className="text-sm font-medium">Average Item Value</span>
              </div>
              <div className="p-2 bg-white rounded border border-gray-100">
                <span className="text-sm font-medium">Supplementary Payments</span>
              </div>
            </div>
          </CardContent>
        </Card>
      
        {/* Selected Month Column */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{selectedMonth}</CardTitle>
          </CardHeader>
          <CardContent className="px-3 py-0">
            <div className="space-y-4 py-3">
              <div className="p-2 bg-white rounded border border-gray-100">
                <span className="font-semibold block">{formatCurrency(currentDocument.netPayment || 0)}</span>
              </div>
              <div className="p-2 bg-white rounded border border-gray-100">
                <span className="font-semibold block">{formatCurrency(currentDocument.financials?.grossIngredientCost || 0)}</span>
              </div>
              <div className="p-2 bg-white rounded border border-gray-100">
                <span className="font-semibold block">{currentDocument.totalItems.toLocaleString()}</span>
              </div>
              <div className="p-2 bg-white rounded border border-gray-100">
                <span className="font-semibold block">
                  {formatCurrency((currentDocument.financials?.grossIngredientCost || 0) / (currentDocument.totalItems || 1))}
                </span>
              </div>
              <div className="p-2 bg-white rounded border border-gray-100">
                <span className="font-semibold block">{formatCurrency(currentDocument.financials?.supplementaryPayments || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      
        {/* Comparison Month Column */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{comparisonMonth}</CardTitle>
          </CardHeader>
          <CardContent className="px-3 py-0">
            <div className="space-y-4 py-3">
              {/* Net Payment */}
              <div className="p-2 bg-white rounded border border-gray-100">
                <div className="flex flex-col">
                  <span className="font-semibold">{formatCurrency(comparisonDocument.netPayment || 0)}</span>
                  {currentDocument && comparisonDocument && (
                    <div className="mt-1">
                      <TrendIndicator 
                        firstValue={comparisonDocument.netPayment || 0} 
                        lastValue={currentDocument.netPayment || 0} 
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Gross Ingredient Cost */}
              <div className="p-2 bg-white rounded border border-gray-100">
                <div className="flex flex-col">
                  <span className="font-semibold">{formatCurrency(comparisonDocument.financials?.grossIngredientCost || 0)}</span>
                  {currentDocument && comparisonDocument && (
                    <div className="mt-1">
                      <TrendIndicator 
                        firstValue={comparisonDocument.financials?.grossIngredientCost || 0} 
                        lastValue={currentDocument.financials?.grossIngredientCost || 0} 
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Total Items */}
              <div className="p-2 bg-white rounded border border-gray-100">
                <div className="flex flex-col">
                  <span className="font-semibold">{comparisonDocument.totalItems.toLocaleString()}</span>
                  {currentDocument && comparisonDocument && (
                    <div className="mt-1">
                      <TrendIndicator 
                        firstValue={comparisonDocument.totalItems} 
                        lastValue={currentDocument.totalItems} 
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Average Item Value */}
              <div className="p-2 bg-white rounded border border-gray-100">
                <div className="flex flex-col">
                  <span className="font-semibold">
                    {formatCurrency((comparisonDocument.financials?.grossIngredientCost || 0) / (comparisonDocument.totalItems || 1))}
                  </span>
                  {currentDocument && comparisonDocument && (
                    <div className="mt-1">
                      <TrendIndicator 
                        firstValue={(comparisonDocument.financials?.grossIngredientCost || 0) / (comparisonDocument.totalItems || 1)} 
                        lastValue={(currentDocument.financials?.grossIngredientCost || 0) / (currentDocument.totalItems || 1)} 
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Supplementary Payments */}
              <div className="p-2 bg-white rounded border border-gray-100">
                <div className="flex flex-col">
                  <span className="font-semibold">{formatCurrency(comparisonDocument.financials?.supplementaryPayments || 0)}</span>
                  {currentDocument && comparisonDocument && (
                    <div className="mt-1">
                      <TrendIndicator 
                        firstValue={comparisonDocument.financials?.supplementaryPayments || 0} 
                        lastValue={currentDocument.financials?.supplementaryPayments || 0} 
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MonthlyComparison;
