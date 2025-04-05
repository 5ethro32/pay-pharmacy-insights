
import { CardHeader, CardTitle } from "@/components/ui/card";

interface PharmacyHeaderProps {
  pharmacyInfo: {
    contractorCode: string;
    dispensingMonth: string;
    inTransition: string;
  };
}

const PharmacyHeader = ({ pharmacyInfo }: PharmacyHeaderProps) => {
  return (
    <CardHeader className="bg-gradient-to-r from-red-900/90 to-red-700 text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <CardTitle className="text-xl md:text-2xl font-display">
            COMMUNITY PHARMACY PAYMENT SUMMARY
          </CardTitle>
          <p className="text-white/80 mt-1">Pharmacy eSchedule Dashboard</p>
        </div>
        <div className="flex flex-col items-start md:items-end text-sm">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span className="text-white/80">Contractor Code:</span>
            <span className="font-medium">{pharmacyInfo.contractorCode}</span>
            <span className="text-white/80">Dispensing Month:</span>
            <span className="font-medium">{pharmacyInfo.dispensingMonth}</span>
            <span className="text-white/80">In Transition:</span>
            <span className="font-medium">{pharmacyInfo.inTransition}</span>
          </div>
        </div>
      </div>
    </CardHeader>
  );
};

export default PharmacyHeader;
