
import { SupplementaryPaymentDetail } from "@/types/paymentTypes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/utils/documentUtils";

interface SupplementaryPaymentsTableProps {
  payments?: {
    details: SupplementaryPaymentDetail[];
    total: number;
  };
}

const SupplementaryPaymentsTable = ({ payments }: SupplementaryPaymentsTableProps) => {
  // Sample data for testing - will be replaced by real data later
  const sampleData = {
    details: [
      { code: "DISPPOOL", amount: 12219.24 },
      { code: "ESTPAY", amount: 2500.00 },
      { code: "PFIRSTBASE", amount: 1000.00 },
      { code: "PFIRSTACT", amount: 1400.06 },
      { code: "PHSSMOK", amount: 60.00 },
      { code: "PHSCONT", amount: 60.00 }
    ],
    total: 17239.30
  };

  // Use sample data if no payments provided
  const tableData = payments || sampleData;

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/2">Supplementary & Service Payments Code</TableHead>
            <TableHead className="text-right w-1/2">Adjustment Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData.details.map((payment) => (
            <TableRow key={payment.code}>
              <TableCell>{payment.code}</TableCell>
              <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
            </TableRow>
          ))}
          <TableRow className="font-medium bg-muted/50">
            <TableCell>Total:</TableCell>
            <TableCell className="text-right">{formatCurrency(tableData.total)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default SupplementaryPaymentsTable;
