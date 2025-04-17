
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
import { useEffect } from "react";

interface SupplementaryPaymentsTableProps {
  payments?: {
    details: SupplementaryPaymentDetail[];
    total: number;
  };
}

const SupplementaryPaymentsTable = ({ payments }: SupplementaryPaymentsTableProps) => {
  useEffect(() => {
    // Debug logging to help identify issues
    if (payments) {
      console.log("SupplementaryPaymentsTable - Received payments data:", payments);
      if (payments.details) {
        console.log(`SupplementaryPaymentsTable - Details count: ${payments.details.length}`);
      } else {
        console.log("SupplementaryPaymentsTable - No details array found in payments");
      }
    } else {
      console.log("SupplementaryPaymentsTable - No payments data provided");
    }
  }, [payments]);

  if (!payments || !payments.details || !payments.details.length) {
    return (
      <div className="text-sm text-gray-500 italic">
        No supplementary payment details available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Supplementary & Service Payments Code</TableHead>
            <TableHead className="text-right">Adjustment Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.details.map((payment) => (
            <TableRow key={payment.code}>
              <TableCell>{payment.code}</TableCell>
              <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
            </TableRow>
          ))}
          <TableRow className="font-medium">
            <TableCell>Sum:</TableCell>
            <TableCell className="text-right">{formatCurrency(payments.total)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default SupplementaryPaymentsTable;
