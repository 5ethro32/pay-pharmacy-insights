
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
    details?: SupplementaryPaymentDetail[];
    total?: number;
  };
}

const SupplementaryPaymentsTable = ({ payments }: SupplementaryPaymentsTableProps) => {
  useEffect(() => {
    console.log("Supplementary payments props received (temporarily disabled):", payments);
  }, [payments]);

  return (
    <div className="text-sm text-gray-500 italic">
      Supplementary payments data is temporarily unavailable
    </div>
  );
};

export default SupplementaryPaymentsTable;
