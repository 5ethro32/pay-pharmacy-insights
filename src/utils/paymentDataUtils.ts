
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
export const extractPfsDetails = (workbook: XLSX.WorkBook) => {
  console.log("Extracting PFS details from workbook");
  
  // Try multiple possible sheet names for the PFS sheet
  const possibleSheetNames = [
    "NHS PFS Payment Calculation", 
    "PFS Payment Calculation",
    "NHS Pharmacy First Scotland",
    "Pharmacy First Scotland",
    "Pharmacy First",
    "PFS"
  ];
  
  // Find the PFS sheet
  let pfsSheetName: string | null = null;
  
  // First, try exact matches
  for (const name of possibleSheetNames) {
    if (workbook.SheetNames.includes(name)) {
      pfsSheetName = name;
      break;
    }
  }
  
  // If no exact match, try partial matching
  if (!pfsSheetName) {
    for (const sheetName of workbook.SheetNames) {
      if (sheetName.includes("PFS") || 
          sheetName.includes("Pharmacy First") || 
          sheetName.includes("Payment Calculation")) {
        pfsSheetName = sheetName;
        break;
      }
    }
  }
  
  if (!pfsSheetName) {
    console.warn("No PFS sheet found in workbook. Available sheets:", workbook.SheetNames);
    return null;
  }
  
  console.log(`Found PFS sheet: ${pfsSheetName}`);
  
  // Get the sheet
  const pfsSheet = workbook.Sheets[pfsSheetName];
  if (!pfsSheet) {
    console.warn(`Sheet ${pfsSheetName} exists in SheetNames but couldn't be accessed`);
    return null;
  }
  
  // Convert to JSON with headers
  const data: any[][] = XLSX.utils.sheet_to_json(pfsSheet, { header: 1 });
  
  console.log("PFS sheet data sample:", data.slice(0, 10));
  
  // More robust helper to find values with less strict matching
  function findValueByLabelFlexible(label: string) {
    // Convert label to uppercase for case-insensitive comparison
    const upperLabel = label.toUpperCase();
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row) continue;
      
      // Check first few columns for labels (adjust based on your sheet format)
      for (let j = 0; j < Math.min(5, row.length); j++) {
        const cell = row[j];
        
        // Skip empty cells
        if (!cell) continue;
        
        // For flexible matching, convert to string and uppercase
        const cellText = String(cell).toUpperCase();
        
        // Check if cell contains the label (more flexible matching)
        if (cellText.includes(upperLabel) || 
            // Common variations/typos
            upperLabel.includes(cellText) ||
            // Check for labels split with spaces vs underscores
            cellText.replace(/\s+/g, '_') === upperLabel.replace(/\s+/g, '_')) {
          
          // Found the label, get the value from nearby cells
          // First try column to the right
          if (j + 1 < row.length && row[j + 1] !== undefined && row[j + 1] !== null) {
            console.log(`Found "${label}" at [${i}][${j}], value:`, row[j + 1]);
            return row[j + 1];
          }
          // Then try two columns right (common in some formats)
          else if (j + 2 < row.length && row[j + 2] !== undefined && row[j + 2] !== null) {
            console.log(`Found "${label}" at [${i}][${j}], value:`, row[j + 2]);
            return row[j + 2];
          }
          // Then try checking the next row in the same column (used in some report formats)
          else if (i + 1 < data.length && data[i + 1] && 
                  j < data[i + 1].length && data[i + 1][j] !== undefined) {
            console.log(`Found "${label}" at [${i}][${j}], value on next row:`, data[i + 1][j]);
            return data[i + 1][j];
          }
        }
      }
    }
    
    console.log(`Could not find value for "${label}"`);
    return null;
  }
  
  // Extract PFS details with more flexible matching
  const details = {
    treatmentItems: findValueByLabelFlexible("TREATMENT ITEMS"),
    treatmentWeighting: findValueByLabelFlexible("TREATMENT WEIGHTING"),
    treatmentWeightedSubtotal: findValueByLabelFlexible("TREATMENT WEIGHTED SUB-TOTAL"),
    
    consultations: findValueByLabelFlexible("CONSULTATIONS"),
    consultationWeighting: findValueByLabelFlexible("CONSULTATION WEIGHTING"),
    consultationsWeightedSubtotal: findValueByLabelFlexible("CONSULTATIONS WEIGHTED SUB-TOTAL"),
    
    referrals: findValueByLabelFlexible("REFERRALS"),
    referralWeighting: findValueByLabelFlexible("REFERRAL WEIGHTING"),
    referralsWeightedSubtotal: findValueByLabelFlexible("REFERRALS WEIGHTED SUB-TOTAL"),
    
    // UTI specific fields
    utiTreatmentItems: findValueByLabelFlexible("UTI TREATMENT ITEMS"),
    utiTreatmentWeighting: findValueByLabelFlexible("UTI TREATMENT WEIGHTING"),
    utiTreatmentWeightedSubtotal: findValueByLabelFlexible("UTI TREATMENT WEIGHTED SUB-TOTAL"),
    
    utiConsultations: findValueByLabelFlexible("UTI CONSULTATIONS"),
    utiConsultationWeighting: findValueByLabelFlexible("UTI CONSULTATION WEIGHTING"),
    utiConsultationsWeightedSubtotal: findValueByLabelFlexible("UTI CONSULTATIONS WEIGHTED SUB-TOTAL"),
    
    utiReferrals: findValueByLabelFlexible("UTI REFERRALS"),
    utiReferralWeighting: findValueByLabelFlexible("UTI REFERRAL WEIGHTING"),
    utiReferralsWeightedSubtotal: findValueByLabelFlexible("UTI REFERRALS WEIGHTED SUB-TOTAL"),
    
    // Activity totals and payment details
    weightedActivityTotal: findValueByLabelFlexible("WEIGHTED ACTIVITY TOTAL"),
    activitySpecifiedMinimum: findValueByLabelFlexible("ACTIVITY SPECIFIED MINIMUM"),
    weightedActivityAboveMinimum: findValueByLabelFlexible("WEIGHTED ACTIVITY ABOVE MINIMUM"),
    nationalActivityAboveMinimum: findValueByLabelFlexible("NATIONAL TOTAL WEIGHTED ACTIVITY ABOVE MINIMUM"),
    monthlyPool: findValueByLabelFlexible("MONTHLY ACTIVITY PAYMENT POOL"),
    appliedActivityFee: findValueByLabelFlexible("APPLIED ACTIVITY FEE"),
    maximumActivityFee: findValueByLabelFlexible("MAXIMUM ACTIVITY FEE"),
    basePayment: findValueByLabelFlexible("BASE PAYMENT"),
    activityPayment: findValueByLabelFlexible("ACTIVITY PAYMENT"),
    totalPayment: findValueByLabelFlexible("TOTAL PAYMENT")
  };
  
  // Also try PFS specific prefixes if fields weren't found
  if (!details.treatmentItems) {
    details.treatmentItems = findValueByLabelFlexible("PFS TREATMENT ITEMS");
  }
  if (!details.consultations) {
    details.consultations = findValueByLabelFlexible("PFS CONSULTATIONS");
  }
  if (!details.referrals) {
    details.referrals = findValueByLabelFlexible("PFS REFERRALS");
  }
  
  // Convert string values to numbers and handle currency values
  Object.keys(details).forEach(key => {
    const value = (details as any)[key];
    
    if (value === undefined || value === null) {
      (details as any)[key] = 0; // Default to 0 for undefined values
      return;
    }
    
    // Handle currency strings (£12,345.67)
    if (typeof value === 'string' && value.match(/[£$€]|,/)) {
      const cleanValue = value.replace(/[£$€,\s]/g, '');
      const parsed = parseFloat(cleanValue);
      (details as any)[key] = isNaN(parsed) ? 0 : parsed;
      return;
    }
    
    // Convert other numeric strings
    if (typeof value === 'string' && !isNaN(parseFloat(value))) {
      (details as any)[key] = parseFloat(value);
    }
  });
  
  // Validate that we have at least a few key fields
  const hasImportantFields = details.basePayment || 
                            details.activityPayment || 
                            details.treatmentItems || 
                            details.consultations;
  
  if (!hasImportantFields) {
    console.warn("Extracted PFS details don't contain any important fields, might be invalid:", details);
  } else {
    console.log("Successfully extracted PFS details:", details);
  }
  
  return hasImportantFields ? details : null;
}
