
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CostDistributionChart from "./CostDistributionChart";

interface DetailsViewProps {
  itemCounts: {
    total: number;
    ams: number;
    mcr: number;
    nhs: number;
    cpus: number;
    other: number;
  };
  costs: {
    totalGross: number;
    amsGross: number;
    mcrGross: number;
    nhsGross: number;
    cpusGross: number;
    otherGross: number;
    avgGross: number;
  };
  changes: {
    totalGross: number;
    netIngredientCost: number;
    supplementaryPayments: number;
    netPayment: number;
    itemCounts: number;
    amsItems: number;
    mcrItems: number;
    nhsItems: number;
  };
  payments: {
    netIngredientCost: number;
    outOfPocket: number;
    supplementaryPayments: number;
    stockOrderSubtotal: number;
    advancePayment: number;
    nextMonthAdvance: number;
    netPayment: number;
    [key: string]: number;
  };
  formatNumber: (value: number) => string;
  formatCurrency: (value: number, decimals?: number) => string;
  renderChangeIndicator: (changeValue: number, size?: string) => React.ReactNode;
  isBlurred: boolean;
}

const DetailsView = ({
  itemCounts,
  costs,
  changes,
  payments,
  formatNumber,
  formatCurrency,
  renderChangeIndicator,
  isBlurred
}: DetailsViewProps) => {
  const costBreakdownData = [
    { name: "AMS", value: costs.amsGross, color: "#9c1f28" },
    { name: "M:CR", value: costs.mcrGross, color: "#c73845" },
    { name: "NHS PFS", value: costs.nhsGross, color: "#e85a68" },
    { name: "CPUS", value: costs.cpusGross, color: "#f27d88" },
    { name: "Other", value: costs.otherGross, color: "#f9a3aa" }
  ];

  return (
    <div className={`space-y-8 ${isBlurred ? 'filter blur-sm' : ''}`}>
      <Card className="overflow-x-auto">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">Payment Schedule Details</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader className="bg-red-50">
              <TableRow>
                <TableHead className="text-gray-700 font-semibold">Item</TableHead>
                <TableHead className="text-right text-gray-700 font-semibold">Count/Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200">
              <TableRow>
                <TableCell colSpan={2} className="bg-gray-100 font-medium">Item Counts by Service</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-gray-700">AMS Items</TableCell>
                <TableCell className="text-right text-gray-700">
                  <div className="flex items-center justify-end">
                    <span>{formatNumber(itemCounts.ams)}</span>
                    {renderChangeIndicator(changes.amsItems)}
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-gray-700">M:CR (CMS) Items</TableCell>
                <TableCell className="text-right text-gray-700">
                  <div className="flex items-center justify-end">
                    <span>{formatNumber(itemCounts.mcr)}</span>
                    {renderChangeIndicator(changes.mcrItems)}
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-gray-700">NHS PFS Items</TableCell>
                <TableCell className="text-right text-gray-700">
                  <div className="flex items-center justify-end">
                    <span>{formatNumber(itemCounts.nhs)}</span>
                    {renderChangeIndicator(changes.nhsItems)}
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-gray-700">CPUS Items (inc UCF)</TableCell>
                <TableCell className="text-right text-gray-700">{formatNumber(itemCounts.cpus)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-gray-700">Other Items</TableCell>
                <TableCell className="text-right text-gray-700">{formatNumber(itemCounts.other)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-gray-700 font-medium">Total Items (excl stock orders)</TableCell>
                <TableCell className="text-right text-gray-700 font-medium">
                  <div className="flex items-center justify-end">
                    <span>{formatNumber(itemCounts.total)}</span>
                    {renderChangeIndicator(changes.itemCounts)}
                  </div>
                </TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell colSpan={2} className="bg-gray-100 font-medium">Gross Ingredient Cost by Service</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-gray-700">AMS Items</TableCell>
                <TableCell className="text-right text-gray-700">{formatCurrency(costs.amsGross, 2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-gray-700">M:CR (CMS) Items</TableCell>
                <TableCell className="text-right text-gray-700">{formatCurrency(costs.mcrGross, 2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-gray-700">NHS PFS Items</TableCell>
                <TableCell className="text-right text-gray-700">{formatCurrency(costs.nhsGross, 2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-gray-700">CPUS Items (inc UCF)</TableCell>
                <TableCell className="text-right text-gray-700">{formatCurrency(costs.cpusGross, 2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-gray-700">Other Items</TableCell>
                <TableCell className="text-right text-gray-700">{formatCurrency(costs.otherGross, 2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-gray-700 font-medium">Total Gross Ingredient Cost</TableCell>
                <TableCell className="text-right text-gray-700 font-medium">
                  <div className="flex items-center justify-end">
                    <span>{formatCurrency(costs.totalGross, 2)}</span>
                    {renderChangeIndicator(changes.totalGross)}
                  </div>
                </TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell colSpan={2} className="bg-gray-100 font-medium">Payment Breakdown</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-gray-700">Net Ingredient Cost</TableCell>
                <TableCell className="text-right text-gray-700">
                  <div className="flex items-center justify-end">
                    <span>{formatCurrency(payments.netIngredientCost, 2)}</span>
                    {renderChangeIndicator(changes.netIngredientCost)}
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-gray-700">Out Of Pocket Expenses</TableCell>
                <TableCell className="text-right text-gray-700">{formatCurrency(payments.outOfPocket, 2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-gray-700">Supplementary & Service Payments</TableCell>
                <TableCell className="text-right text-gray-700">
                  <div className="flex items-center justify-end">
                    <span>{formatCurrency(payments.supplementaryPayments, 2)}</span>
                    {renderChangeIndicator(changes.supplementaryPayments)}
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-gray-700">Stock Order Subtotal</TableCell>
                <TableCell className="text-right text-gray-700">{formatCurrency(payments.stockOrderSubtotal, 2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-gray-700">Advance Payment Already Paid</TableCell>
                <TableCell className="text-right text-gray-700">{formatCurrency(payments.advancePayment, 2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-gray-700">Advance Payment Next Month</TableCell>
                <TableCell className="text-right text-gray-700">{formatCurrency(payments.nextMonthAdvance, 2)}</TableCell>
              </TableRow>
              <TableRow className="bg-red-50">
                <TableCell className="font-semibold text-red-900">Net Payment to Bank</TableCell>
                <TableCell className="text-right font-semibold text-red-900">
                  <div className="flex items-center justify-end">
                    <span>{formatCurrency(payments.netPayment, 2)}</span>
                    {renderChangeIndicator(changes.netPayment)}
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">Cost Distribution by Service</CardTitle>
        </CardHeader>
        <CardContent>
          <CostDistributionChart 
            costBreakdownData={costBreakdownData}
            formatNumber={formatNumber}
            formatCurrency={formatCurrency}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default DetailsView;
