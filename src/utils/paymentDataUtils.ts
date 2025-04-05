import { PaymentData } from "@/types/paymentTypes";

// Type guards for more precise type checking
export const isObject = (value: any): value is Record<string, any> => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

// Transform raw document data to PaymentData format
export const transformDocumentToPaymentData = (doc: any): PaymentData => {
  // Check if extracted_data exists and is an object
  const extractedData = doc.extracted_data && isObject(doc.extracted_data) 
    ? doc.extracted_data as Record<string, any>
    : {};
    
  // Safely check and access properties
  const hasItemCounts = 'itemCounts' in extractedData && isObject(extractedData.itemCounts);
  const hasFinancials = 'financials' in extractedData && isObject(extractedData.financials);
  const hasAdvancePayments = 'advancePayments' in extractedData && isObject(extractedData.advancePayments);
  const hasServiceCosts = 'serviceCosts' in extractedData && isObject(extractedData.serviceCosts);
  const hasPfsDetails = 'pfsDetails' in extractedData && isObject(extractedData.pfsDetails);
  const hasRegionalPayments = 'regionalPayments' in extractedData && isObject(extractedData.regionalPayments);
  
  // Access with type safety
  const itemCountsData = hasItemCounts ? extractedData.itemCounts as Record<string, any> : {};
  const financialsData = hasFinancials ? extractedData.financials as Record<string, any> : {};
  const advancePaymentsData = hasAdvancePayments ? extractedData.advancePayments as Record<string, any> : {};
  const serviceCostsData = hasServiceCosts ? extractedData.serviceCosts as Record<string, any> : {};
  const pfsDetailsData = hasPfsDetails ? extractedData.pfsDetails as Record<string, any> : {};
  const regionalPaymentsData = hasRegionalPayments ? extractedData.regionalPayments as Record<string, any> : {};
  
  return {
    id: doc.id,
    month: doc.month || '',
    year: doc.year || new Date().getFullYear(),
    totalItems: hasItemCounts && 'total' in itemCountsData 
      ? Number(itemCountsData.total) 
      : 0,
    netPayment: 'netPayment' in extractedData 
      ? Number(extractedData.netPayment) 
      : 0,
    contractorCode: 'contractorCode' in extractedData 
      ? String(extractedData.contractorCode) 
      : undefined,
    dispensingMonth: 'dispensingMonth' in extractedData 
      ? String(extractedData.dispensingMonth) 
      : undefined,
    itemCounts: hasItemCounts 
      ? {
          total: Number(itemCountsData.total || 0),
          ams: 'ams' in itemCountsData ? Number(itemCountsData.ams) : undefined,
          mcr: 'mcr' in itemCountsData ? Number(itemCountsData.mcr) : undefined,
          nhsPfs: 'nhsPfs' in itemCountsData ? Number(itemCountsData.nhsPfs) : undefined,
          cpus: 'cpus' in itemCountsData ? Number(itemCountsData.cpus) : undefined
        }
      : undefined,
    financials: hasFinancials
      ? {
          grossIngredientCost: 'grossIngredientCost' in financialsData 
            ? Number(financialsData.grossIngredientCost) 
            : undefined,
          netIngredientCost: 'netIngredientCost' in financialsData
            ? Number(financialsData.netIngredientCost) 
            : undefined,
          dispensingPool: 'dispensingPool' in financialsData
            ? Number(financialsData.dispensingPool) 
            : undefined,
          establishmentPayment: 'establishmentPayment' in financialsData
            ? Number(financialsData.establishmentPayment) 
            : undefined,
          pharmacyFirstBase: 'pharmacyFirstBase' in financialsData
            ? Number(financialsData.pharmacyFirstBase)
            : undefined,
          pharmacyFirstActivity: 'pharmacyFirstActivity' in financialsData
            ? Number(financialsData.pharmacyFirstActivity)
            : undefined,
          averageGrossValue: 'averageGrossValue' in financialsData
            ? Number(financialsData.averageGrossValue)
            : undefined,
          supplementaryPayments: 'supplementaryPayments' in financialsData
            ? Number(financialsData.supplementaryPayments)
            : undefined
        }
      : undefined,
    advancePayments: hasAdvancePayments
      ? {
          previousMonth: 'previousMonth' in advancePaymentsData
            ? Number(advancePaymentsData.previousMonth)
            : undefined,
          nextMonth: 'nextMonth' in advancePaymentsData
            ? Number(advancePaymentsData.nextMonth)
            : undefined
        }
      : undefined,
    serviceCosts: hasServiceCosts
      ? {
          ams: 'ams' in serviceCostsData
            ? Number(serviceCostsData.ams)
            : undefined,
          mcr: 'mcr' in serviceCostsData
            ? Number(serviceCostsData.mcr)
            : undefined,
          nhsPfs: 'nhsPfs' in serviceCostsData
            ? Number(serviceCostsData.nhsPfs)
            : undefined,
          cpus: 'cpus' in serviceCostsData
            ? Number(serviceCostsData.cpus)
            : undefined,
          other: 'other' in serviceCostsData
            ? Number(serviceCostsData.other)
            : undefined
        }
      : undefined,
    pfsDetails: hasPfsDetails
      ? {
          treatmentItems: 'treatmentItems' in pfsDetailsData
            ? Number(pfsDetailsData.treatmentItems)
            : undefined,
          consultations: 'consultations' in pfsDetailsData
            ? Number(pfsDetailsData.consultations)
            : undefined,
          referrals: 'referrals' in pfsDetailsData
            ? Number(pfsDetailsData.referrals)
            : undefined,
          weightedActivityTotal: 'weightedActivityTotal' in pfsDetailsData
            ? Number(pfsDetailsData.weightedActivityTotal)
            : undefined,
          basePayment: 'basePayment' in pfsDetailsData
            ? Number(pfsDetailsData.basePayment)
            : undefined,
          activityPayment: 'activityPayment' in pfsDetailsData
            ? Number(pfsDetailsData.activityPayment)
            : undefined,
          totalPayment: 'totalPayment' in pfsDetailsData
            ? Number(pfsDetailsData.totalPayment)
            : undefined
        }
      : undefined,
    regionalPayments: hasRegionalPayments && 'paymentDetails' in regionalPaymentsData && Array.isArray(regionalPaymentsData.paymentDetails)
      ? {
          paymentDetails: regionalPaymentsData.paymentDetails.map((detail: any) => ({
            description: String(detail.description || ''),
            amount: Number(detail.amount || 0)
          })),
          totalAmount: 'totalAmount' in regionalPaymentsData ? Number(regionalPaymentsData.totalAmount) : 0
        }
      : undefined
  };
};
