
import React, { useState } from "react";
import { PaymentData } from "@/types/paymentTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PaymentScheduleDetailsProps {
  currentData: PaymentData | null;
}

const formatCurrency = (value: number | undefined) => {
  if (value === undefined) return "N/A";
  
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value);
};

const formatNumber = (value: number | undefined) => {
  if (value === undefined) return "N/A";
  
  return new Intl.NumberFormat('en-GB').format(value);
};

const PaymentScheduleDetails: React.FC<PaymentScheduleDetailsProps> = ({ currentData }) => {
  const [openSections, setOpenSections] = useState<{[key: string]: boolean}>({
    itemCounts: true,
    serviceCosts: true,
    paymentBreakdown: true,
    advancePayments: true
  });

  if (!currentData) {
    return null;
  }

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const SectionHeader = ({ title, section }: { title: string, section: string }) => (
    <div 
      className="flex items-center justify-between py-2 px-4 bg-gray-100 cursor-pointer"
      onClick={() => toggleSection(section)}
    >
      <h3 className="font-medium text-gray-800">{title}</h3>
      {openSections[section] ? 
        <ChevronUp className="h-5 w-5 text-gray-600" /> : 
        <ChevronDown className="h-5 w-5 text-gray-600" />
      }
    </div>
  );

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Payment Schedule Details</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Collapsible
          open={openSections.itemCounts}
          onOpenChange={() => toggleSection('itemCounts')}
          className="border-b"
        >
          <CollapsibleTrigger className="w-full">
            <SectionHeader title="Item Counts by Service" section="itemCounts" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-4">
              <Table>
                <TableBody className="divide-y divide-gray-200">
                  <TableRow>
                    <TableCell className="text-gray-700">AMS Items</TableCell>
                    <TableCell className="text-right text-gray-700">{formatNumber(currentData.itemCounts?.ams)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-gray-700">M:CR Items</TableCell>
                    <TableCell className="text-right text-gray-700">{formatNumber(currentData.itemCounts?.mcr)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-gray-700">NHS PFS Items</TableCell>
                    <TableCell className="text-right text-gray-700">{formatNumber(currentData.itemCounts?.nhsPfs)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-gray-700">CPUS Items</TableCell>
                    <TableCell className="text-right text-gray-700">{formatNumber(currentData.itemCounts?.cpus)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-gray-700">Other Items</TableCell>
                    <TableCell className="text-right text-gray-700">{formatNumber(currentData.itemCounts?.other)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-gray-800">Total Items</TableCell>
                    <TableCell className="text-right font-medium text-gray-800">{formatNumber(currentData.totalItems)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {currentData.financials?.serviceCosts && (
          <Collapsible
            open={openSections.serviceCosts}
            onOpenChange={() => toggleSection('serviceCosts')}
            className="border-b"
          >
            <CollapsibleTrigger className="w-full">
              <SectionHeader title="Financial Breakdown by Service" section="serviceCosts" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-4">
                <Table>
                  <TableBody className="divide-y divide-gray-200">
                    <TableRow>
                      <TableCell className="text-gray-700">AMS Service</TableCell>
                      <TableCell className="text-right text-gray-700">{formatCurrency(currentData.financials?.serviceCosts?.ams)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-gray-700">M:CR Service</TableCell>
                      <TableCell className="text-right text-gray-700">{formatCurrency(currentData.financials?.serviceCosts?.mcr)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-gray-700">NHS PFS Service</TableCell>
                      <TableCell className="text-right text-gray-700">{formatCurrency(currentData.financials?.serviceCosts?.nhsPfs)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-gray-700">CPUS Service</TableCell>
                      <TableCell className="text-right text-gray-700">{formatCurrency(currentData.financials?.serviceCosts?.cpus)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-gray-700">Other Services</TableCell>
                      <TableCell className="text-right text-gray-700">{formatCurrency(currentData.financials?.serviceCosts?.other)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-gray-800">Total Service Costs</TableCell>
                      <TableCell className="text-right font-medium text-gray-800">
                        {formatCurrency(
                          (currentData.financials?.serviceCosts?.ams || 0) +
                          (currentData.financials?.serviceCosts?.mcr || 0) +
                          (currentData.financials?.serviceCosts?.nhsPfs || 0) +
                          (currentData.financials?.serviceCosts?.cpus || 0) +
                          (currentData.financials?.serviceCosts?.other || 0)
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        <Collapsible
          open={openSections.paymentBreakdown}
          onOpenChange={() => toggleSection('paymentBreakdown')}
          className="border-b"
        >
          <CollapsibleTrigger className="w-full">
            <SectionHeader title="Payment Breakdown" section="paymentBreakdown" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-4">
              <Table>
                <TableBody className="divide-y divide-gray-200">
                  <TableRow>
                    <TableCell className="text-gray-700">Net Ingredient Cost</TableCell>
                    <TableCell className="text-right text-gray-700">{formatCurrency(currentData.financials?.netIngredientCost)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-gray-700">Out Of Pocket Expenses</TableCell>
                    <TableCell className="text-right text-gray-700">{formatCurrency(currentData.financials?.outOfPocket)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-gray-700">Dispensing Pool Payment</TableCell>
                    <TableCell className="text-right text-gray-700">{formatCurrency(currentData.financials?.dispensingPool)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-gray-700">Establishment Payment</TableCell>
                    <TableCell className="text-right text-gray-700">{formatCurrency(currentData.financials?.establishmentPayment)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-gray-700">Pharmacy First Base Payment</TableCell>
                    <TableCell className="text-right text-gray-700">{formatCurrency(currentData.financials?.pharmacyFirstBase)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-gray-700">Pharmacy First Activity Payment</TableCell>
                    <TableCell className="text-right text-gray-700">{formatCurrency(currentData.financials?.pharmacyFirstActivity)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-gray-700">Supplementary Payments</TableCell>
                    <TableCell className="text-right text-gray-700">{formatCurrency(currentData.financials?.supplementaryPayments)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible
          open={openSections.advancePayments}
          onOpenChange={() => toggleSection('advancePayments')}
        >
          <CollapsibleTrigger className="w-full">
            <SectionHeader title="Advance Payments" section="advancePayments" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-4">
              <Table>
                <TableBody className="divide-y divide-gray-200">
                  <TableRow>
                    <TableCell className="text-gray-700">Advance Payment Already Made</TableCell>
                    <TableCell className="text-right text-gray-700">{formatCurrency(currentData.financials?.advancePaymentMade)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-gray-700">Advance Payment Next Month</TableCell>
                    <TableCell className="text-right text-gray-700">{formatCurrency(currentData.financials?.advancePaymentNext)}</TableCell>
                  </TableRow>
                  <TableRow className="bg-red-50">
                    <TableCell className="font-semibold text-gray-900">Net Payment to Bank</TableCell>
                    <TableCell className="text-right font-semibold text-gray-900">{formatCurrency(currentData.netPayment)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default PaymentScheduleDetails;
