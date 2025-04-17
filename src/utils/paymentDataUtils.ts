
import { PaymentData, PFSDetails } from "@/types/paymentTypes";
import * as XLSX from 'xlsx';

// Transform document data from Supabase to PaymentData format
export const transformDocumentToPaymentData = (document: any): PaymentData => {
  const data = document.extracted_data || {};
  
  // Debug log to check what's coming from the document
  console.log(`Transforming document ${document.id} - month: ${document.month}, year: ${document.year}`);
  console.log("Document PFS data:", data.pfsDetails ? "present" : "missing", data.pfsDetails);
  
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
  
  // Check if PFS data exists and log it
  if (data.pfsDetails) {
    console.log(`Document ${document.id} has PFS data with ${Object.keys(data.pfsDetails).length} fields`);
    // Log a sample of available keys
    const pfsKeys = Object.keys(data.pfsDetails);
    if (pfsKeys.length > 0) {
      console.log("Sample PFS keys:", pfsKeys.slice(0, 5));
    }
  } else {
    console.log(`Document ${document.id} has no PFS data`);
  }
  
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
    "NHS PHARMACY FIRST SCOTLAND PAYMENT CALCULATIONS",
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
      const sheetNameStr = String(sheetName);
      if (sheetNameStr.includes("PFS") || 
          sheetNameStr.includes("Pharmacy First") || 
          sheetNameStr.includes("PHARMACY FIRST") ||
          sheetNameStr.includes("Payment Calculation")) {
        pfsSheetName = sheetNameStr;
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
  
  console.log("PFS sheet data sample:", data.slice(0, 20));
  
  // FIXED POSITION: We know exactly where the headers and data are based on the provided information
  // Header is on row 8 (index 8, Excel row 9)
  // Description is in column B (index 1)
  // Values are in column D (index 3)
  let headerRowIndex = 8; // Excel row 9
  let descriptionColumnIndex = 1; // Column B
  let valueColumnIndex = 3; // Column D
  
  // Extract values from the rows following the header row
  const pfsDetails: PFSDetails = {};
  
  // Log the header row to verify our fixed position assumption
  console.log(`Using fixed position - Header row (${headerRowIndex}):`, data[headerRowIndex]);
  
  // Start parsing from the row after the header row (row 9 / index 9)
  for (let i = headerRowIndex + 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length <= descriptionColumnIndex) continue;
    
    const description = row[descriptionColumnIndex];
    const value = row[valueColumnIndex];
    
    // If either description or value is missing, skip this row
    if (!description) continue;
    
    // Convert description to string and remove extra spaces
    const descStr = String(description).trim();
    
    // Skip rows that don't have proper descriptions
    if (!descStr || descStr.length < 3) continue;
    
    console.log(`Row ${i}: Description: ${descStr}, Value: ${value}`);
    
    // Map specific descriptions to keys in our object
    // Standard PFS fields
    if (descStr === "PFS TREATMENT ITEMS" || descStr === "TREATMENT ITEMS") {
      pfsDetails.treatmentItems = processValue(value);
    }
    else if (descStr === "PFS TREATMENT WEIGHTING" || descStr === "TREATMENT WEIGHTING") {
      pfsDetails.treatmentWeighting = processValue(value);
    }
    else if (descStr === "PFS TREATMENT WEIGHTED SUB-TOTAL" || descStr === "TREATMENT WEIGHTED SUB-TOTAL") {
      pfsDetails.treatmentWeightedSubtotal = processValue(value);
    }
    else if (descStr === "PFS CONSULTATIONS" || descStr === "CONSULTATIONS") {
      pfsDetails.consultations = processValue(value);
    }
    else if (descStr === "PFS CONSULTATION WEIGHTING" || descStr === "CONSULTATION WEIGHTING") {
      pfsDetails.consultationWeighting = processValue(value);
    }
    else if (descStr === "PFS CONSULTATIONS WEIGHTED SUB-TOTAL" || descStr === "CONSULTATIONS WEIGHTED SUB-TOTAL") {
      pfsDetails.consultationsWeightedSubtotal = processValue(value);
    }
    else if (descStr === "PFS REFERRALS" || descStr === "REFERRALS") {
      pfsDetails.referrals = processValue(value);
    }
    else if (descStr === "PFS REFERRAL WEIGHTING" || descStr === "REFERRAL WEIGHTING") {
      pfsDetails.referralWeighting = processValue(value);
    }
    else if (descStr === "PFS REFERRALS WEIGHTED SUB-TOTAL" || descStr === "REFERRALS WEIGHTED SUB-TOTAL") {
      pfsDetails.referralsWeightedSubtotal = processValue(value);
    }
    
    // UTI fields
    else if (descStr === "UTI TREATMENT ITEMS") {
      pfsDetails.utiTreatmentItems = processValue(value);
    }
    else if (descStr === "UTI TREATMENT WEIGHTING") {
      pfsDetails.utiTreatmentWeighting = processValue(value);
    }
    else if (descStr === "UTI TREATMENT WEIGHTED SUB-TOTAL") {
      pfsDetails.utiTreatmentWeightedSubtotal = processValue(value);
    }
    else if (descStr === "UTI CONSULTATIONS") {
      pfsDetails.utiConsultations = processValue(value);
    }
    else if (descStr === "UTI CONSULTATION WEIGHTING") {
      pfsDetails.utiConsultationWeighting = processValue(value);
    }
    else if (descStr === "UTI CONSULTATIONS WEIGHTED SUB-TOTAL" || descStr === "UTI CONSULTATION WEIGHTED SUB-TOTAL") {
      pfsDetails.utiConsultationsWeightedSubtotal = processValue(value);
    }
    else if (descStr === "UTI REFERRALS") {
      pfsDetails.utiReferrals = processValue(value);
    }
    else if (descStr === "UTI REFERRAL WEIGHTING") {
      pfsDetails.utiReferralWeighting = processValue(value);
    }
    else if (descStr === "UTI REFERRALS WEIGHTED SUB-TOTAL" || descStr === "UTI REFERRAL WEIGHTED SUB-TOTAL") {
      pfsDetails.utiReferralsWeightedSubtotal = processValue(value);
    }
    
    // Impetigo fields
    else if (descStr === "IMPETIGO TREATMENT ITEMS") {
      pfsDetails.impetigoTreatmentItems = processValue(value);
    }
    else if (descStr === "IMPETIGO TREATMENT WEIGHTING") {
      pfsDetails.impetigoTreatmentWeighting = processValue(value);
    }
    else if (descStr === "IMPETIGO TREATMENT WEIGHTED SUB-TOTAL") {
      pfsDetails.impetigoTreatmentWeightedSubtotal = processValue(value);
    }
    else if (descStr === "IMPETIGO CONSULTATIONS") {
      pfsDetails.impetigoConsultations = processValue(value);
    }
    else if (descStr === "IMPETIGO CONSULTATION WEIGHTING") {
      pfsDetails.impetigoConsultationWeighting = processValue(value);
    }
    else if (descStr === "IMPETIGO CONSULTATION WEIGHTED SUB-TOTAL" || descStr === "IMPETIGO CONSULTATIONS WEIGHTED SUB-TOTAL") {
      pfsDetails.impetigoConsultationsWeightedSubtotal = processValue(value);
    }
    else if (descStr === "IMPETIGO REFERRALS") {
      pfsDetails.impetigoReferrals = processValue(value);
    }
    else if (descStr === "IMPETIGO REFERRAL WEIGHTING") {
      pfsDetails.impetigoReferralWeighting = processValue(value);
    }
    else if (descStr === "IMPETIGO REFERRALS WEIGHTED SUB-TOTAL" || descStr === "IMPETIGO REFERRAL WEIGHTED SUB-TOTAL") {
      pfsDetails.impetigoReferralsWeightedSubtotal = processValue(value);
    }
    
    // Shingles fields - handle different variants of labels
    else if (descStr === "SHINGLES TREATMENT ITEMS") {
      pfsDetails.shinglesTreatmentItems = processValue(value);
    }
    else if (descStr === "SHINGLES TREATMENT WEIGHTING") {
      pfsDetails.shinglesTreatmentWeighting = processValue(value);
    }
    else if (descStr === "SHINGLES TREATMENT WEIGHTED SUB-TOTAL") {
      pfsDetails.shinglesTreatmentWeightedSubtotal = processValue(value);
    }
    else if (descStr === "SHINGLES TREATMENT CONSULTATIONS" || descStr === "SHINGLES CONSULTATIONS") {
      pfsDetails.shinglesConsultations = processValue(value);
    }
    else if (descStr === "SHINGLES TREATMENT CONSULTATION WEIGHTING" || descStr === "SHINGLES CONSULTATION WEIGHTING") {
      pfsDetails.shinglesConsultationWeighting = processValue(value);
    }
    else if (descStr === "SHINGLES TREATMENT CONSULTATION WEIGHTED SUB-TOTAL" || descStr === "SHINGLES CONSULTATIONS WEIGHTED SUB-TOTAL") {
      pfsDetails.shinglesConsultationsWeightedSubtotal = processValue(value);
    }
    else if (descStr === "SHINGLES TREATMENT REFERRAL" || descStr === "SHINGLES REFERRALS") {
      pfsDetails.shinglesReferrals = processValue(value);
    }
    else if (descStr === "SHINGLES TREATMENT REFERRAL WEIGHTING" || descStr === "SHINGLES REFERRAL WEIGHTING") {
      pfsDetails.shinglesReferralWeighting = processValue(value);
    }
    else if (descStr === "SHINGLES TREATMENT REFERRAL WEIGHTED SUB-TOTAL" || descStr === "SHINGLES REFERRALS WEIGHTED SUB-TOTAL") {
      pfsDetails.shinglesReferralsWeightedSubtotal = processValue(value);
    }
    
    // Skin Infection fields
    else if (descStr === "SKIN INFECTION ITEMS") {
      pfsDetails.skinInfectionItems = processValue(value);
    }
    else if (descStr === "SKIN INFECTION WEIGHTING") {
      pfsDetails.skinInfectionWeighting = processValue(value);
    }
    else if (descStr === "SKIN INFECTION WEIGHTED SUB-TOTAL") {
      pfsDetails.skinInfectionWeightedSubtotal = processValue(value);
    }
    else if (descStr === "SKIN INFECTION CONSULTATIONS") {
      pfsDetails.skinInfectionConsultations = processValue(value);
    }
    else if (descStr === "SKIN INFECTION CONSULTATION WEIGHTING") {
      pfsDetails.skinInfectionConsultationWeighting = processValue(value);
    }
    else if (descStr === "SKIN INFECTION CONSULTATION WEIGHTED SUB-TOTAL" || descStr === "SKIN INFECTION CONSULTATIONS WEIGHTED SUB-TOTAL") {
      pfsDetails.skinInfectionConsultationsWeightedSubtotal = processValue(value);
    }
    else if (descStr === "SKIN INFECTION REFERRAL") {
      pfsDetails.skinInfectionReferrals = processValue(value);
    }
    else if (descStr === "SKIN INFECTION REFERRAL WEIGHTING") {
      pfsDetails.skinInfectionReferralWeighting = processValue(value);
    }
    else if (descStr === "SKIN INFECTION REFERRAL WEIGHTED SUB-TOTAL") {
      pfsDetails.skinInfectionReferralsWeightedSubtotal = processValue(value);
    }
    
    // Hayfever fields - also handle typos like "HATFEVER"
    else if (descStr === "HAYFEVER ITEMS") {
      pfsDetails.hayfeverItems = processValue(value);
    }
    else if (descStr === "HAYFEVER WEIGHTING") {
      pfsDetails.hayfeverWeighting = processValue(value);
    }
    else if (descStr === "HAYFEVER WEIGHTED SUB-TOTAL") {
      pfsDetails.hayfeverWeightedSubtotal = processValue(value);
    }
    else if (descStr === "HAYFEVER CONSULTATIONS") {
      pfsDetails.hayfeverConsultations = processValue(value);
    }
    else if (descStr === "HAYFEVER CONSULTATION WEIGHTING") {
      pfsDetails.hayfeverConsultationWeighting = processValue(value);
    }
    else if (descStr === "HAYFEVER CONSULTATION WEIGHTED SUB-TOTAL" || descStr === "HATFEVER CONSULTATION WEIGHTED SUB-TOTAL") {
      // Handle typo in the Excel file (HATFEVER)
      pfsDetails.hayfeverConsultationsWeightedSubtotal = processValue(value);
    }
    else if (descStr === "HAYFEVER REFERRAL") {
      pfsDetails.hayfeverReferrals = processValue(value);
    }
    else if (descStr === "HAYFEVER REFERRAL WEIGHTING") {
      pfsDetails.hayfeverReferralWeighting = processValue(value);
    }
    else if (descStr === "HAYFEVER REFERRAL WEIGHTED SUB-TOTAL") {
      pfsDetails.hayfeverReferralsWeightedSubtotal = processValue(value);
    }
    
    // Payment related fields
    else if (descStr === "WEIGHTED ACTIVITY TOTAL") {
      pfsDetails.weightedActivityTotal = processValue(value);
    }
    else if (descStr === "ACTIVITY SPECIFIED MINIMUM") {
      pfsDetails.activitySpecifiedMinimum = processValue(value);
    }
    else if (descStr === "WEIGHTED ACTIVITY ABOVE MINIMUM") {
      pfsDetails.weightedActivityAboveMinimum = processValue(value);
    }
    else if (descStr === "NATIONAL TOTAL WEIGHTED ACTIVITY ABOVE MINIMUM") {
      pfsDetails.nationalActivityAboveMinimum = processValue(value);
    }
    else if (descStr.includes("MONTHLY") && descStr.includes("POOL")) {
      pfsDetails.monthlyPool = processValue(value);
    }
    else if (descStr === "APPLIED ACTIVITY FEE" || descStr === "ACTIVITY FEE APPLIED") {
      pfsDetails.appliedActivityFee = processValue(value);
    }
    else if (descStr === "MAXIMUM ACTIVITY FEE") {
      pfsDetails.maximumActivityFee = processValue(value);
    }
    else if (descStr === "BASE PAYMENT") {
      pfsDetails.basePayment = processValue(value);
    }
    else if (descStr === "BASE PAYMENT ADJUSTMENT CODE") {
      pfsDetails.basePaymentAdjustmentCode = String(value);
    }
    else if (descStr === "ACTIVITY PAYMENT") {
      pfsDetails.activityPayment = processValue(value);
    }
    else if (descStr === "ACTIVITY PAYMENT ADJUSTMENT CODE") {
      pfsDetails.activityPaymentAdjustmentCode = String(value);
    }
    else if (descStr === "TOTAL PAYMENT") {
      pfsDetails.totalPayment = processValue(value);
    }
    
    // Log any unmatched descriptions for debugging
    else if (descStr.includes("PAYMENT") || descStr.includes("ACTIVITY") || 
            descStr.includes("PFS") || descStr.includes("UTI") ||
            descStr.includes("TREATMENT") || descStr.includes("CONSULTATION") ||
            descStr.includes("IMPETIGO") || descStr.includes("SHINGLES") ||
            descStr.includes("INFECTION") || descStr.includes("HAYFEVER")) {
      console.log(`Unmatched PFS description: "${descStr}" with value: ${value}`);
    }
  }
  
  // Helper function to process values to appropriate types
  function processValue(value: any): number {
    // If value is undefined or null
    if (value === undefined || value === null) return 0;
    
    // If value is already a number, return it
    if (typeof value === 'number') return value;
    
    // If value is a string, handle currency symbols, commas, etc.
    if (typeof value === 'string') {
      const cleanValue = value.replace(/[£$€,\s]/g, '').trim();
      if (cleanValue === '') return 0;
      
      const parsed = parseFloat(cleanValue);
      return isNaN(parsed) ? 0 : parsed;
    }
    
    // Default fallback
    return 0;
  }
  
  // Ensure important summary fields are calculated if missing
  if (!pfsDetails.totalPayment && pfsDetails.basePayment && pfsDetails.activityPayment) {
    pfsDetails.totalPayment = pfsDetails.basePayment + pfsDetails.activityPayment;
  }
  
  // Calculate weighted activity total if missing
  if (!pfsDetails.weightedActivityTotal) {
    let total = 0;
    
    // Add standard PFS weighted subtotals
    if (pfsDetails.treatmentWeightedSubtotal) total += pfsDetails.treatmentWeightedSubtotal;
    if (pfsDetails.consultationsWeightedSubtotal) total += pfsDetails.consultationsWeightedSubtotal;
    if (pfsDetails.referralsWeightedSubtotal) total += pfsDetails.referralsWeightedSubtotal;
    
    // Add UTI weighted subtotals
    if (pfsDetails.utiTreatmentWeightedSubtotal) total += pfsDetails.utiTreatmentWeightedSubtotal;
    if (pfsDetails.utiConsultationsWeightedSubtotal) total += pfsDetails.utiConsultationsWeightedSubtotal;
    if (pfsDetails.utiReferralsWeightedSubtotal) total += pfsDetails.utiReferralsWeightedSubtotal;
    
    // Add Impetigo weighted subtotals
    if (pfsDetails.impetigoTreatmentWeightedSubtotal) total += pfsDetails.impetigoTreatmentWeightedSubtotal;
    if (pfsDetails.impetigoConsultationsWeightedSubtotal) total += pfsDetails.impetigoConsultationsWeightedSubtotal;
    if (pfsDetails.impetigoReferralsWeightedSubtotal) total += pfsDetails.impetigoReferralsWeightedSubtotal;
    
    // Add Shingles weighted subtotals
    if (pfsDetails.shinglesTreatmentWeightedSubtotal) total += pfsDetails.shinglesTreatmentWeightedSubtotal;
    if (pfsDetails.shinglesConsultationsWeightedSubtotal) total += pfsDetails.shinglesConsultationsWeightedSubtotal;
    if (pfsDetails.shinglesReferralsWeightedSubtotal) total += pfsDetails.shinglesReferralsWeightedSubtotal;
    
    // Add Skin Infection weighted subtotals
    if (pfsDetails.skinInfectionWeightedSubtotal) total += pfsDetails.skinInfectionWeightedSubtotal;
    if (pfsDetails.skinInfectionConsultationsWeightedSubtotal) total += pfsDetails.skinInfectionConsultationsWeightedSubtotal;
    if (pfsDetails.skinInfectionReferralsWeightedSubtotal) total += pfsDetails.skinInfectionReferralsWeightedSubtotal;
    
    // Add Hayfever weighted subtotals
    if (pfsDetails.hayfeverWeightedSubtotal) total += pfsDetails.hayfeverWeightedSubtotal;
    if (pfsDetails.hayfeverConsultationsWeightedSubtotal) total += pfsDetails.hayfeverConsultationsWeightedSubtotal;
    if (pfsDetails.hayfeverReferralsWeightedSubtotal) total += pfsDetails.hayfeverReferralsWeightedSubtotal;
    
    if (total > 0) {
      pfsDetails.weightedActivityTotal = total;
    }
  }
  
  console.log("Extracted PFS details:", pfsDetails);
  
  // Return the extracted data
  return Object.keys(pfsDetails).length > 0 ? pfsDetails : null;
}
