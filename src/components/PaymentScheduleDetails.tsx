
import React from "react";
import { PaymentData } from "@/types/paymentTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { CalendarCheck } from "lucide-react";

export interface PaymentScheduleDetailsProps {
  currentData: PaymentData;
}

const PaymentScheduleDetails: React.FC<PaymentScheduleDetailsProps> = ({ currentData }) => {
  const isMobile = useIsMobile();

  // Format currency values
  const formatCurrency = (value: number | undefined): string => {
    if (value === undefined) return "£0.00";
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <CalendarCheck className="h-5 w-5 mr-2 text-green-600" />
          Payment Schedule Details
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <p className="text-sm text-gray-500">Schedule Month</p>
            <p className="font-medium">
              {currentData.month} {currentData.year}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Contractor Code</p>
            <p className="font-medium">{currentData.contractorCode || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Gross Ingredient Cost</p>
            <p className="font-medium">
              {formatCurrency(currentData.financials?.grossIngredientCost)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Net Ingredient Cost</p>
            <p className="font-medium">
              {formatCurrency(currentData.financials?.netIngredientCost)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Dispensing Pool</p>
            <p className="font-medium">
              {formatCurrency(currentData.financials?.dispensingPool)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Establishment Payment</p>
            <p className="font-medium">
              {formatCurrency(currentData.financials?.establishmentPayment)}
            </p>
          </div>
          {currentData.financials?.pharmacyFirstBase !== undefined && (
            <>
              <div>
                <p className="text-sm text-gray-500">Pharmacy First Base</p>
                <p className="font-medium">
                  {formatCurrency(currentData.financials.pharmacyFirstBase)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pharmacy First Activity</p>
                <p className="font-medium">
                  {formatCurrency(currentData.financials.pharmacyFirstActivity)}
                </p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentScheduleDetails;
