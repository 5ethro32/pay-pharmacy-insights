
import { PaymentData } from "@/types/paymentTypes";
import * as XLSX from 'xlsx';

// Transform document data from Supabase to PaymentData format
export const transformDocumentToPaymentData = (document: any): PaymentData => {
  const data = document.extracted_data || {};
  
  // Make sure month is properly formatted
  const month = data.month ? data.month.charAt(0).toUpperCase() + data.month.slice(1).toLowerCase() : "";
  
  // Basic payment data
  const paymentData: PaymentData = {
    id: document.id || "",
    month: month,
    year: data.year || new Date().getFullYear(),
    totalItems: data.itemCounts?.total || 0,
    netPayment: data.netPayment || 0,
    contractorCode: data.contractorCode || "",
    dispensingMonth: data.dispensingMonth || "",
    
    // Item counts
    itemCounts: {
      total: data.itemCounts?.total || 0,
      ams: data.itemCounts?.ams || 0,
      mcr: data.itemCounts?.mcr || 0,
      nhsPfs: data.itemCounts?.nhsPfs || 0,
      cpus: data.itemCounts?.cpus || 0,
      other: data.itemCounts?.other || 0
    },
    
    // Financial data
    financials: {
      grossIngredientCost: data.financials?.grossIngredientCost || 0,
      netIngredientCost: data.financials?.netIngredientCost || 0, 
      dispensingPool: data.financials?.dispensingPool || 0,
      establishmentPayment: data.financials?.establishmentPayment || 0,
      pharmacyFirstBase: data.financials?.pharmacyFirstBase || 0,
      pharmacyFirstActivity: data.financials?.pharmacyFirstActivity || 0,
      averageGrossValue: data.financials?.averageGrossValue || 0,
      supplementaryPayments: data.financials?.supplementaryPayments || 0
    },
    
    // Advance payments
    advancePayments: {
      previousMonth: data.advancePayments?.previousMonth || 0,
      nextMonth: data.advancePayments?.nextMonth || 0
    },
    
    // Service costs
    serviceCosts: data.serviceCosts || {},
    
    // PFS details - ensure we get all available fields
    pfsDetails: data.pfsDetails || {},
    
    // Include regional payments if available
    regionalPayments: data.regionalPayments || null
  };
  
  return paymentData;
};

// Extract PFS details from workbook 
export const extractPfsDetails = (workbook: any) => {
  console.log("Extracting PFS details from workbook");
  
  // Try multiple possible sheet names for the PFS sheet
  const possibleSheetNames = [
    "NHS PFS Payment Calculation", 
    "PFS Payment Calculation",
    "NHS Pharmacy First Scotland"
  ];
  
  // Find the PFS sheet
  let pfsSheetName: string | null = null;
  for (const name of possibleSheetNames) {
    if (workbook.SheetNames.includes(name)) {
      pfsSheetName = name;
      break;
    }
  }
  
  // Try partial matching if exact match isn't found
  if (!pfsSheetName) {
    pfsSheetName = workbook.SheetNames.find((sheet: string) => 
      sheet.includes("PFS") || 
      sheet.includes("Pharmacy First") || 
      sheet.includes("Payment Calculation")
    );
  }
  
  if (!pfsSheetName) {
    console.warn("No PFS sheet found in workbook");
    return null;
  }
  
  console.log(`Found PFS sheet: ${pfsSheetName}`);
  
  // Get the sheet
  const pfsSheet = workbook.Sheets[pfsSheetName];
  const data: any[][] = XLSX.utils.sheet_to_json(pfsSheet, { header: 1 });
  
  console.log("PFS sheet data sample:", data.slice(0, 5));
  
  // Helper function to search for a value in the sheet
  function findValue(label: string) {
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row) continue;
      
      // Check if any cell in the row contains the label
      const labelCell = row.find((cell: any) => 
        cell && typeof cell === 'string' && cell.toUpperCase().includes(label)
      );
      
      if (labelCell) {
        // Return value from the next column after the label
        const labelIndex = row.indexOf(labelCell);
        const value = row[i][labelIndex + 1] || row[i][labelIndex + 2];
        
        console.log(`Found label "${label}" at row ${i}, value:`, value);
        return value;
      }
    }
    
    return null;
  }
  
  // More robust helper to find values
  function findValueByLabel(label: string) {
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row) continue;
      
      // Check first three columns for the label
      for (let j = 0; j < Math.min(3, row.length); j++) {
        const cell = row[j];
        if (cell && typeof cell === 'string' && 
            cell.toUpperCase().includes(label)) {
          
          // Found the label, get the value from the next column or two after
          const value = row[j + 1] !== undefined ? row[j + 1] : 
                       (row[j + 2] !== undefined ? row[j + 2] : null);
          
          console.log(`Found "${label}" at [${i}][${j}], value:`, value);
          return value;
        }
      }
    }
    return null;
  }
  
  // Extract PFS details
  const details = {
    treatmentItems: findValueByLabel("TREATMENT ITEMS"),
    treatmentWeighting: findValueByLabel("TREATMENT WEIGHTING"),
    treatmentWeightedSubtotal: findValueByLabel("TREATMENT WEIGHTED SUB-TOTAL"),
    
    consultations: findValueByLabel("CONSULTATIONS"),
    consultationWeighting: findValueByLabel("CONSULTATION WEIGHTING"),
    consultationsWeightedSubtotal: findValueByLabel("CONSULTATIONS WEIGHTED SUB-TOTAL"),
    
    referrals: findValueByLabel("REFERRALS"),
    referralWeighting: findValueByLabel("REFERRAL WEIGHTING"),
    referralsWeightedSubtotal: findValueByLabel("REFERRALS WEIGHTED SUB-TOTAL"),
    
    // UTI specific fields
    utiTreatmentItems: findValueByLabel("UTI TREATMENT ITEMS"),
    utiTreatmentWeighting: findValueByLabel("UTI TREATMENT WEIGHTING"),
    utiTreatmentWeightedSubtotal: findValueByLabel("UTI TREATMENT WEIGHTED SUB-TOTAL"),
    
    utiConsultations: findValueByLabel("UTI CONSULTATIONS"),
    utiConsultationWeighting: findValueByLabel("UTI CONSULTATION WEIGHTING"),
    utiConsultationsWeightedSubtotal: findValueByLabel("UTI CONSULTATIONS WEIGHTED SUB-TOTAL"),
    
    utiReferrals: findValueByLabel("UTI REFERRALS"),
    utiReferralWeighting: findValueByLabel("UTI REFERRAL WEIGHTING"),
    utiReferralsWeightedSubtotal: findValueByLabel("UTI REFERRALS WEIGHTED SUB-TOTAL"),
    
    // Activity totals and payment details
    weightedActivityTotal: findValueByLabel("WEIGHTED ACTIVITY TOTAL"),
    activitySpecifiedMinimum: findValueByLabel("ACTIVITY SPECIFIED MINIMUM"),
    weightedActivityAboveMinimum: findValueByLabel("WEIGHTED ACTIVITY ABOVE MINIMUM"),
    nationalActivityAboveMinimum: findValueByLabel("NATIONAL TOTAL WEIGHTED ACTIVITY ABOVE MINIMUM"),
    monthlyPool: findValueByLabel("MONTHLY ACTIVITY PAYMENT POOL"),
    appliedActivityFee: findValueByLabel("APPLIED ACTIVITY FEE"),
    maximumActivityFee: findValueByLabel("MAXIMUM ACTIVITY FEE"),
    basePayment: findValueByLabel("BASE PAYMENT"),
    activityPayment: findValueByLabel("ACTIVITY PAYMENT"),
    totalPayment: findValueByLabel("TOTAL PAYMENT")
  };
  
  // Convert string values to numbers
  Object.keys(details).forEach(key => {
    const value = (details as any)[key];
    if (typeof value === 'string' && !isNaN(parseFloat(value))) {
      (details as any)[key] = parseFloat(value);
    }
  });
  
  console.log("Extracted PFS details:", details);
  return details;
}
