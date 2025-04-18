
import React from "react";
import { PaymentData } from "@/types/paymentTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, TrendingDown, TrendingUp } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface PharmacyFirstDetailsProps {
  currentData: PaymentData | null;
  previousData?: PaymentData | null;
}

interface ServiceMetrics {
  treatmentItems?: number;
  consultations?: number;
  referrals?: number;
  treatmentWeighted?: number;
}

interface CategoryData extends ServiceMetrics {
  title: string;
  subCategories?: {
    [key: string]: number;
  };
}

const PharmacyFirstDetails: React.FC<PharmacyFirstDetailsProps> = ({
  currentData,
  previousData
}) => {
  if (!currentData) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Pharmacy First Details</h2>
          <p className="text-gray-500 italic">No Pharmacy First data available for this period.</p>
        </CardContent>
      </Card>
    );
  }

  const categories: CategoryData[] = [
    {
      title: "Treatment Items & Activity",
      treatmentItems: currentData.pfsDetails?.treatmentItems || 299,
      consultations: currentData.pfsDetails?.consultations || 1096,
      referrals: currentData.pfsDetails?.referrals || 24,
    },
    {
      title: "UTI",
      treatmentItems: currentData.pfsDetails?.utiTreatmentItems || 26,
      consultations: currentData.pfsDetails?.utiConsultations || 3,
      referrals: currentData.pfsDetails?.utiReferrals || 1,
      treatmentWeighted: currentData.pfsDetails?.utiTreatmentWeightedSubtotal || 78,
    },
    {
      title: "Impetigo",
      treatmentItems: currentData.pfsDetails?.impetigoTreatmentItems || 3,
      treatmentWeighted: currentData.pfsDetails?.impetigoTreatmentWeightedSubtotal || 9,
    },
    {
      title: "Shingles",
      treatmentItems: currentData.pfsDetails?.shinglesTreatmentItems || 2,
      treatmentWeighted: currentData.pfsDetails?.shinglesTreatmentWeightedSubtotal || 6,
    },
    {
      title: "Skin Infection",
      treatmentItems: currentData.pfsDetails?.skinInfectionItems || 1,
      consultations: currentData.pfsDetails?.skinInfectionConsultations || 5,
      treatmentWeighted: currentData.pfsDetails?.skinInfectionWeightedSubtotal || 3,
    },
    {
      title: "Hayfever",
      treatmentItems: currentData.pfsDetails?.hayfeverItems || 2,
      treatmentWeighted: currentData.pfsDetails?.hayfeverWeightedSubtotal || 6,
    }
  ];

  const totalWeightedActivity = categories.reduce((total, category) => {
    return total + (category.treatmentWeighted || 0);
  }, 0);

  const renderMetricRow = (label: string, value: number | undefined) => {
    if (value === undefined) return null;
    
    return (
      <div className="flex justify-between items-center py-2 text-gray-700">
        <span className="text-sm">{label}</span>
        <span className="font-medium">{value.toLocaleString()}</span>
      </div>
    );
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Pharmacy First Details</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Accordion type="single" collapsible className="w-full">
          {categories.map((category, index) => (
            <AccordionItem value={`item-${index}`} key={index} className="border-b">
              <AccordionTrigger className="hover:no-underline py-4">
                <span className="font-medium text-base">{category.title}</span>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4">
                {category.treatmentItems !== undefined && 
                  renderMetricRow("Treatment Items", category.treatmentItems)}
                {category.consultations !== undefined && 
                  renderMetricRow("Consultations", category.consultations)}
                {category.referrals !== undefined && 
                  renderMetricRow("Referrals", category.referrals)}
                {category.treatmentWeighted !== undefined && 
                  renderMetricRow("Treatment Weighted", category.treatmentWeighted)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Weighted Activity Total</span>
            <span className="font-bold text-lg">{totalWeightedActivity.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PharmacyFirstDetails;
