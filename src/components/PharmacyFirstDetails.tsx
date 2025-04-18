
import React from "react";
import { PaymentData } from "@/types/paymentTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TrendIndicator from "@/components/charts/TrendIndicator";
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

  const getCategoryData = (data: PaymentData | null, categoryKey: string): ServiceMetrics => {
    if (!data?.pfsDetails) return {};
    
    const pfs = data.pfsDetails;
    switch(categoryKey) {
      case "uti":
        return {
          treatmentItems: pfs.utiTreatmentItems,
          consultations: pfs.utiConsultations,
          referrals: pfs.utiReferrals,
          treatmentWeighted: pfs.utiTreatmentWeightedSubtotal,
        };
      case "impetigo":
        return {
          treatmentItems: pfs.impetigoTreatmentItems,
          treatmentWeighted: pfs.impetigoTreatmentWeightedSubtotal,
        };
      case "shingles":
        return {
          treatmentItems: pfs.shinglesTreatmentItems,
          treatmentWeighted: pfs.shinglesTreatmentWeightedSubtotal,
        };
      case "skinInfection":
        return {
          treatmentItems: pfs.skinInfectionItems,
          consultations: pfs.skinInfectionConsultations,
          treatmentWeighted: pfs.skinInfectionWeightedSubtotal,
        };
      case "hayfever":
        return {
          treatmentItems: pfs.hayfeverItems,
          treatmentWeighted: pfs.hayfeverWeightedSubtotal,
        };
      default:
        return {
          treatmentItems: pfs.treatmentItems,
          consultations: pfs.consultations,
          referrals: pfs.referrals,
        };
    }
  };

  const categories: CategoryData[] = [
    {
      title: "Treatment Items & Activity",
      ...getCategoryData(currentData, "total"),
    },
    {
      title: "UTI",
      ...getCategoryData(currentData, "uti"),
    },
    {
      title: "Impetigo",
      ...getCategoryData(currentData, "impetigo"),
    },
    {
      title: "Shingles",
      ...getCategoryData(currentData, "shingles"),
    },
    {
      title: "Skin Infection",
      ...getCategoryData(currentData, "skinInfection"),
    },
    {
      title: "Hayfever",
      ...getCategoryData(currentData, "hayfever"),
    }
  ];

  const totalWeightedActivity = categories.reduce((total, category) => {
    return total + (category.treatmentWeighted || 0);
  }, 0);

  const previousTotalWeightedActivity = previousData ? categories.reduce((total, category) => {
    const prevCategory = getCategoryData(previousData, category.title.toLowerCase().replace(/ & activity/g, ''));
    return total + (prevCategory.treatmentWeighted || 0);
  }, 0) : 0;

  const renderMetricRow = (label: string, currentValue: number | undefined, previousValue: number | undefined) => {
    if (currentValue === undefined) return null;
    
    return (
      <div className="flex justify-between items-center py-2 text-gray-700">
        <span className="text-sm">{label}</span>
        <div className="flex items-center gap-4">
          <span className="font-medium">{currentValue.toLocaleString()}</span>
          {previousValue !== undefined && (
            <div className="w-24">
              <TrendIndicator firstValue={previousValue} lastValue={currentValue} />
            </div>
          )}
        </div>
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
          {categories.map((category, index) => {
            const prevCategory = previousData ? 
              getCategoryData(previousData, category.title.toLowerCase().replace(/ & activity/g, '')) : 
              undefined;

            return (
              <AccordionItem value={`item-${index}`} key={index} className="border-b">
                <AccordionTrigger className="hover:no-underline py-4">
                  <span className="font-medium text-base">{category.title}</span>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  {renderMetricRow("Treatment Items", category.treatmentItems, prevCategory?.treatmentItems)}
                  {renderMetricRow("Consultations", category.consultations, prevCategory?.consultations)}
                  {renderMetricRow("Referrals", category.referrals, prevCategory?.referrals)}
                  {renderMetricRow("Treatment Weighted", category.treatmentWeighted, prevCategory?.treatmentWeighted)}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Weighted Activity Total</span>
            <div className="flex items-center gap-4">
              <span className="font-bold text-lg">{totalWeightedActivity.toLocaleString()}</span>
              {previousData && (
                <div className="w-24">
                  <TrendIndicator firstValue={previousTotalWeightedActivity} lastValue={totalWeightedActivity} />
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PharmacyFirstDetails;
