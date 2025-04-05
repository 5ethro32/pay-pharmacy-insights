
import DashboardContent from "./DashboardContent";
import { PaymentData } from "@/types/paymentTypes";

interface DashboardTabProps {
  userId: string;
  documents: PaymentData[];
  loading: boolean;
}

const DashboardTab = ({ userId, documents, loading }: DashboardTabProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Payment Schedule Dashboard</h2>
      <DashboardContent 
        userId={userId}
        documents={documents}
        loading={loading}
      />
    </div>
  );
};

export default DashboardTab;
