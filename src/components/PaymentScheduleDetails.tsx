
import React, { useState } from "react";
import { PaymentData } from "@/types/paymentTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface PaymentScheduleDetailsProps {
  currentData: PaymentData;
}

const PaymentScheduleDetails: React.FC<PaymentScheduleDetailsProps> = ({ currentData }) => {
  const [openSections, setOpenSections] = useState({
    itemCounts: true,
    grossIngredient: false,
    paymentBreakdown: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return '-';
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatNumber = (value: number | undefined) => {
    if (value === undefined) return '-';
    return value.toLocaleString();
  };

  const renderSectionHeader = (title: string, isOpen: boolean, onClick: () => void) => (
    <div 
      className="flex justify-between items-center bg-gray-100 p-4 cursor-pointer hover:bg-gray-200 transition-colors"
      onClick={onClick}
    >
      <h3 className="font-medium">{title}</h3>
      {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Schedule Details</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Collapsible open={openSections.itemCounts} onOpenChange={() => toggleSection('itemCounts')}>
            <CollapsibleTrigger className="w-full">
              {renderSectionHeader("Item Counts by Service", openSections.itemCounts, () => toggleSection('itemCounts'))}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.itemCounts?.ams !== undefined && (
                    <TableRow>
                      <TableCell>AMS Items</TableCell>
                      <TableCell className="text-right">{formatNumber(currentData.itemCounts.ams)}</TableCell>
                    </TableRow>
                  )}
                  {currentData.itemCounts?.mcr !== undefined && (
                    <TableRow>
                      <TableCell>M:CR (CMS) Items</TableCell>
                      <TableCell className="text-right">{formatNumber(currentData.itemCounts.mcr)}</TableCell>
                    </TableRow>
                  )}
                  {currentData.itemCounts?.nhsPfs !== undefined && (
                    <TableRow>
                      <TableCell>NHS PFS Items</TableCell>
                      <TableCell className="text-right">{formatNumber(currentData.itemCounts.nhsPfs)}</TableCell>
                    </TableRow>
                  )}
                  {currentData.itemCounts?.cpus !== undefined && (
                    <TableRow>
                      <TableCell>CPUS Items (inc UCF)</TableCell>
                      <TableCell className="text-right">{formatNumber(currentData.itemCounts.cpus)}</TableCell>
                    </TableRow>
                  )}
                  {/* If there's another type not covered above */}
                  {currentData.itemCounts?.other !== undefined && (
                    <TableRow>
                      <TableCell>Other Items</TableCell>
                      <TableCell className="text-right">{formatNumber(currentData.itemCounts.other)}</TableCell>
                    </TableRow>
                  )}
                  <TableRow className="font-medium">
                    <TableCell>Total Items (excl stock orders)</TableCell>
                    <TableCell className="text-right">{formatNumber(currentData.totalItems)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={openSections.grossIngredient} onOpenChange={() => toggleSection('grossIngredient')}>
            <CollapsibleTrigger className="w-full">
              {renderSectionHeader("Gross Ingredient Cost by Service", openSections.grossIngredient, () => toggleSection('grossIngredient'))}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.financials?.serviceCosts?.ams !== undefined && (
                    <TableRow>
                      <TableCell>AMS Items</TableCell>
                      <TableCell className="text-right">{formatCurrency(currentData.financials.serviceCosts.ams)}</TableCell>
                    </TableRow>
                  )}
                  {currentData.financials?.serviceCosts?.mcr !== undefined && (
                    <TableRow>
                      <TableCell>M:CR (CMS) Items</TableCell>
                      <TableCell className="text-right">{formatCurrency(currentData.financials.serviceCosts.mcr)}</TableCell>
                    </TableRow>
                  )}
                  {currentData.financials?.serviceCosts?.nhsPfs !== undefined && (
                    <TableRow>
                      <TableCell>NHS PFS Items</TableCell>
                      <TableCell className="text-right">{formatCurrency(currentData.financials.serviceCosts.nhsPfs)}</TableCell>
                    </TableRow>
                  )}
                  {currentData.financials?.serviceCosts?.cpus !== undefined && (
                    <TableRow>
                      <TableCell>CPUS Items (inc UCF)</TableCell>
                      <TableCell className="text-right">{formatCurrency(currentData.financials.serviceCosts.cpus)}</TableCell>
                    </TableRow>
                  )}
                  {currentData.financials?.serviceCosts?.other !== undefined && (
                    <TableRow>
                      <TableCell>Other Items</TableCell>
                      <TableCell className="text-right">{formatCurrency(currentData.financials.serviceCosts.other)}</TableCell>
                    </TableRow>
                  )}
                  {!currentData.financials?.serviceCosts && currentData.financials?.grossIngredientCost !== undefined && (
                    <TableRow>
                      <TableCell>Total Items</TableCell>
                      <TableCell className="text-right">{formatCurrency(currentData.financials.grossIngredientCost)}</TableCell>
                    </TableRow>
                  )}
                  <TableRow className="font-medium">
                    <TableCell>Total Gross Ingredient Cost</TableCell>
                    <TableCell className="text-right">{formatCurrency(currentData.financials?.grossIngredientCost)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={openSections.paymentBreakdown} onOpenChange={() => toggleSection('paymentBreakdown')}>
            <CollapsibleTrigger className="w-full">
              {renderSectionHeader("Payment Breakdown", openSections.paymentBreakdown, () => toggleSection('paymentBreakdown'))}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.financials?.netIngredientCost !== undefined && (
                    <TableRow>
                      <TableCell>Net Ingredient Cost</TableCell>
                      <TableCell className="text-right">{formatCurrency(currentData.financials.netIngredientCost)}</TableCell>
                    </TableRow>
                  )}
                  {currentData.financials?.outOfPocket !== undefined && (
                    <TableRow>
                      <TableCell>Out Of Pocket Expenses</TableCell>
                      <TableCell className="text-right">{formatCurrency(currentData.financials.outOfPocket)}</TableCell>
                    </TableRow>
                  )}
                  {currentData.financials?.dispensingPool !== undefined && (
                    <TableRow>
                      <TableCell>Dispensing Pool Payment</TableCell>
                      <TableCell className="text-right">{formatCurrency(currentData.financials.dispensingPool)}</TableCell>
                    </TableRow>
                  )}
                  {currentData.financials?.establishmentPayment !== undefined && (
                    <TableRow>
                      <TableCell>Establishment Payment</TableCell>
                      <TableCell className="text-right">{formatCurrency(currentData.financials.establishmentPayment)}</TableCell>
                    </TableRow>
                  )}
                  {currentData.financials?.pharmacyFirstBase !== undefined && (
                    <TableRow>
                      <TableCell>Pharmacy First Base</TableCell>
                      <TableCell className="text-right">{formatCurrency(currentData.financials.pharmacyFirstBase)}</TableCell>
                    </TableRow>
                  )}
                  {currentData.financials?.pharmacyFirstActivity !== undefined && (
                    <TableRow>
                      <TableCell>Pharmacy First Activity</TableCell>
                      <TableCell className="text-right">{formatCurrency(currentData.financials.pharmacyFirstActivity)}</TableCell>
                    </TableRow>
                  )}
                  {currentData.financials?.advancePaymentMade !== undefined && (
                    <TableRow>
                      <TableCell>Advance Payment Already Paid</TableCell>
                      <TableCell className="text-right">{formatCurrency(currentData.financials.advancePaymentMade)}</TableCell>
                    </TableRow>
                  )}
                  {currentData.financials?.advancePaymentNext !== undefined && (
                    <TableRow>
                      <TableCell>Advance Payment Next Month</TableCell>
                      <TableCell className="text-right">{formatCurrency(currentData.financials.advancePaymentNext)}</TableCell>
                    </TableRow>
                  )}
                  <TableRow className="bg-red-50">
                    <TableCell className="font-semibold text-red-900">Net Payment to Bank</TableCell>
                    <TableCell className="text-right font-semibold text-red-900">{formatCurrency(currentData.netPayment)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentScheduleDetails;
