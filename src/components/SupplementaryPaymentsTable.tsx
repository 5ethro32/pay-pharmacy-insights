
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
    details?: SupplementaryPaymentDetail[];
    total?: number;
  };
}

const SupplementaryPaymentsTable = ({ payments }: SupplementaryPaymentsTableProps) => {
  if (!payments?.details || payments.details.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        No supplementary payments found for this period
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Payment Type</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.details.map((payment, index) => (
            <TableRow key={`${payment.code}-${index}`}>
              <TableCell className="font-medium">{payment.code}</TableCell>
              <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
            </TableRow>
          ))}
          <TableRow className="font-semibold">
            <TableCell>Total</TableCell>
            <TableCell className="text-right">{formatCurrency(payments.total || 0)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default SupplementaryPaymentsTable;
