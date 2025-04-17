
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
  if (!payments || !payments.details || payments.details.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        No supplementary payments data available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/2">Payment Code</TableHead>
            <TableHead className="text-right w-1/2">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.details.map((payment) => (
            <TableRow key={payment.code}>
              <TableCell>{payment.code}</TableCell>
              <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
            </TableRow>
          ))}
          <TableRow className="font-medium bg-muted/50">
            <TableCell>Total:</TableCell>
            <TableCell className="text-right">{formatCurrency(payments.total)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default SupplementaryPaymentsTable;
