
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import InsightsPanel from "../InsightsPanel";

interface FinancialViewProps {
  changes: {
    netIngredientCost: number;
    supplementaryPayments: number;
    netPayment: number;
    [key: string]: number;
  };
  payments: {
    netIngredientCost: number;
    outOfPocket: number;
    dispensingPoolPayment: number;
    establishmentPayment: number;
    pharmacyFirstBase: number;
    pharmacyFirstActivity: number;
    phsSmoking: number;
    phsContraceptive: number;
    supplementaryPayments: number;
    netPayment: number;
    [key: string]: number;
  };
  financialInsights: {
    title: string;
    description: string;
    type: "info" | "positive" | "negative" | "warning";
  }[];
  formatNumber: (value: number) => string;
  formatCurrency: (value: number, decimals?: number) => string;
  renderChangeIndicator: (changeValue: number, size?: string) => React.ReactNode;
}

const FinancialView = ({
  changes,
  payments,
  financialInsights,
  formatNumber,
  formatCurrency,
  renderChangeIndicator
}: FinancialViewProps) => {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-xl text-gray-800">Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                <p className="text-sm text-gray-600">Net Ingredient Cost</p>
                <div className="flex items-center">
                  <p className="text-2xl font-semibold text-red-900">
                    {formatCurrency(payments.netIngredientCost, 2)}
                  </p>
                  {renderChangeIndicator(changes.netIngredientCost)}
                </div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                <p className="text-sm text-gray-600">Total Supplementary & Service</p>
                <div className="flex items-center">
                  <p className="text-2xl font-semibold text-red-900">
                    {formatCurrency(payments.supplementaryPayments, 2)}
                  </p>
                  {renderChangeIndicator(changes.supplementaryPayments)}
                </div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                <p className="text-sm text-gray-600">Net Payment to Bank</p>
                <div className="flex items-center">
                  <p className="text-2xl font-semibold text-red-900">
                    {formatCurrency(payments.netPayment, 2)}
                  </p>
                  {renderChangeIndicator(changes.netPayment)}
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-red-50">
                  <TableRow>
                    <TableHead className="text-gray-700 font-semibold">Payment Item</TableHead>
                    <TableHead className="text-right text-gray-700 font-semibold">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-200">
                  <TableRow>
                    <TableCell className="text-gray-700">Net Ingredient Cost</TableCell>
                    <TableCell className="text-right text-gray-700">
                      {formatCurrency(payments.netIngredientCost, 2)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-gray-700">Out Of Pocket Expenses</TableCell>
                    <TableCell className="text-right text-gray-700">
                      {formatCurrency(payments.outOfPocket, 2)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-gray-700">Dispensing Pool Payment</TableCell>
                    <TableCell className="text-right text-gray-700">
                      {formatCurrency(payments.dispensingPoolPayment, 2)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-gray-700">Establishment Payment</TableCell>
                    <TableCell className="text-right text-gray-700">
                      {formatCurrency(payments.establishmentPayment, 2)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-gray-700">Pharmacy First Base Payment</TableCell>
                    <TableCell className="text-right text-gray-700">
                      {formatCurrency(payments.pharmacyFirstBase, 2)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-gray-700">Pharmacy First Activity Payment</TableCell>
                    <TableCell className="text-right text-gray-700">
                      {formatCurrency(payments.pharmacyFirstActivity, 2)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-red-50">
                    <TableCell className="font-semibold text-red-900">Net Payment to Bank</TableCell>
                    <TableCell className="text-right font-semibold text-red-900">
                      {formatCurrency(payments.netPayment, 2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            
            <div className="mt-6 bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Analysis & Insights</h3>
              <InsightsPanel insights={financialInsights} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialView;
