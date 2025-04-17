
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
  // Add console logs to debug the payments data
  useEffect(() => {
    console.log("Supplementary payments props received:", payments);
    if (payments) {
      console.log("Details array exists:", !!payments.details);
      console.log("Details count:", payments.details ? payments.details.length : 0);
      console.log("Total amount:", payments.total);
    } else {
      console.log("No supplementary payments data provided to component");
    }
  }, [payments]);

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
          {payments.details.map((payment, index) => (
            <TableRow key={`${payment.code}-${index}`}>
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
