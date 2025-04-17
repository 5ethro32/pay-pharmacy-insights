
import { PaymentData, PFSDetails, SupplementaryPaymentDetail } from "@/types/paymentTypes";
import * as XLSX from 'xlsx';

// Helper function to find value by row label (needed for parsePaymentSchedule)
function findValueByLabel(data: any[][], label: string) {
  for (let i = 0; i < data.length; i++) {
    // Check in column B (index 1) - we know data starts in column B
    if (data[i][1] && String(data[i][1]).includes(label)) {
      return data[i][2];
    }
    
    // Also check in column A (index 0) for PFS sheet
    if (data[i][0] && String(data[i][0]).includes(label)) {
      // Return value from column C (index 2) if found in column A
      const value = data[i][2] || data[i][3]; // Check both column C and D
      return value;
    }
  }
  return null;
}

// Helper function to find value in specific column of a labeled row (needed for parsePaymentSchedule)
function findValueInRow(data: any[][], rowLabel: string, colIndex: number) {
  for (let i = 0; i < data.length; i++) {
    if (data[i][1] && String(data[i][1]).includes(rowLabel)) {
      return data[i][colIndex];
    }
  }
  return null;
}

// Helper function to handle currency values (needed for parsePaymentSchedule)
function parseCurrencyValue(value: any) {
  if (value === undefined || value === null) return null;
  
  // If already a number, return it
  if (typeof value === 'number') return value;
  
  // Handle string format with currency symbols (£1,234.56)
  if (typeof value === 'string') {
    const cleanValue = value.replace(/[£$€,\s]/g, '').trim();
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? null : parsed;
  }
  
  return null;
}

// Helper function to find a specific sheet in workbook (needed for parsePaymentSchedule)
function getSheetData(workbook: XLSX.WorkBook, sheetName: string): any[][] | null {
  // Try to find a sheet that includes the specified name (exact match or partial match)
  const exactSheet = workbook.SheetNames.find(sheet => sheet === sheetName);
  if (exactSheet) {
    const sheet = workbook.Sheets[exactSheet];
    return XLSX.utils.sheet_to_json(sheet, {header: 1}) as any[][];
  }
  
  // Try partial match if exact match isn't found
  const partialMatchSheet = workbook.SheetNames.find(sheet => 
    sheet.includes(sheetName) || sheetName.includes(sheet)
  );
  
  if (partialMatchSheet) {
    const sheet = workbook.Sheets[partialMatchSheet];
    return XLSX.utils.sheet_to_json(sheet, {header: 1}) as any[][];
  }
  
  return null;
}

// Transform document data from Supabase to PaymentData format
export const transformDocumentToPaymentData = (document: any): PaymentData => {
  const data = document.extracted_data || {};
  
  // Debug log to check what's coming from the document
  console.log(`Transforming document ${document.id} - month: ${document.month}, year: ${document.year}`);
  console.log("Document PFS data:", data.pfsDetails ? "present" : "missing", data.pfsDetails);
  
  // Make sure month is properly formatted
  const month = data.month ? data.month.charAt(0).toUpperCase() + data.month.slice(1).toLowerCase() : "";
  
  // Process supplementary payments if they exist to ensure correct format
  let supplementaryPayments = data.supplementaryPayments;
  if (supplementaryPayments && 
      (typeof supplementaryPayments === 'object' && '_type' in supplementaryPayments)) {
    // The data is in incorrect format, set to undefined
    supplementaryPayments = undefined;
  }
  
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
    regionalPayments: data.regionalPayments || null,

    // Supplementary payments - set to fixed object structure or undefined
    supplementaryPayments: supplementaryPayments
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

function extractSupplementaryPayments(workbook: XLSX.WorkBook) {
  // Find the Supplementary & Service Payment sheet
  const sheetName = workbook.SheetNames.find(name => 
    name.includes("Supplementary & Service Payment")
  );
  
  if (!sheetName) {
    console.log("No Supplementary & Service Payments sheet found");
    return null;
  }
  
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
  console.log("Processing Supplementary & Service Payments sheet...");
  
  const details: SupplementaryPaymentDetail[] = [];
  let total = 0;
  
  // Start from row 11 (index 10) as per the Excel structure
  for (let i = 10; i < data.length; i++) {
    const row = data[i];
    if (!row) continue;
    
    // Column B (index 1) for code, Column C (index 2) for amount
    const code = row[1];
    const amountRaw = row[2];
    
    // Skip empty rows or header row
    if (!code || code === "Supplementary & Service Payments Code") continue;
    
    // Handle the Sum row
    if (code === "Sum:") {
      if (amountRaw) {
        const totalStr = typeof amountRaw === 'string' ? amountRaw.replace(/[£,]/g, '') : amountRaw;
        total = parseFloat(totalStr.replace(/^-/, '')) || 0;
      }
      continue;
    }
    
    // Parse the amount, handling negative values and removing currency symbols and commas
    const amountStr = typeof amountRaw === 'string' 
      ? amountRaw.replace(/[£,]/g, '')
      : String(amountRaw);
    
    // Handle negative values (both with minus sign and parentheses)
    let amount = 0;
    if (amountStr.startsWith('(') && amountStr.endsWith(')')) {
      // Handle negative values in parentheses
      amount = -parseFloat(amountStr.slice(1, -1)) || 0;
    } else {
      amount = parseFloat(amountStr) || 0;
    }
    
    if (code && !isNaN(amount)) {
      details.push({
        code: String(code),
        amount
      });
    }
  }
  
  console.log(`Processed ${details.length} supplementary payment entries`);
  console.log("Total amount:", total);
  
  if (details.length === 0) {
    return null;
  }
  
  return {
    details,
    total
  };
}

// Extract PFS details from workbook 
export const extractPfsDetails = (workbook: XLSX.WorkBook) => {
  console.log("Starting PFS field detection...");
  
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
  let detectedFields: string[] = [];
  
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
    console.log("Available sheets:", workbook.SheetNames);
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
  
  // Scan all rows for PFS-related field names
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row) continue;
    
    // Look in all columns for PFS-related text
    for (let j = 0; j < row.length; j++) {
      const cellValue = row[j];
      if (typeof cellValue === 'string') {
        const cleanValue = cellValue.trim().toUpperCase();
        if (cleanValue.includes('PFS') || 
            (cleanValue.includes('PHARMACY') && cleanValue.includes('FIRST'))) {
          detectedFields.push(cleanValue);
          console.log(`Found PFS field at row ${i + 1}, column ${j + 1}: ${cleanValue}`);
        }
      }
    }
  }
  
  console.log("All detected PFS fields:", detectedFields);
  
  // Continue with existing extraction logic
  console.log("Extracting PFS details from workbook");
  
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
};

// Fixed: Added async keyword to function declaration
export async function parsePaymentSchedule(file: File, debug: boolean = false) {
  if (debug) {
    console.log("Starting to parse payment schedule with debug mode enabled");
  }
  
  // Read the Excel file
  const fileData = await file.arrayBuffer();
  const workbook = XLSX.read(fileData, {
    cellStyles: true, cellDates: true, cellNF: true
  });
  
  if (debug) {
    console.log("Available sheets:", workbook.SheetNames);
  }
  
  // Check if required sheets exist
  const sheets = workbook.SheetNames;
  const hasDetailsSheet = sheets.some(sheet => 
    sheet.includes("Pharmacy Details") || sheet.includes("Details"));
  const hasSummarySheet = sheets.some(sheet => 
    sheet.includes("Payment Summ") || sheet.includes("Summary"));
  
  if (!hasDetailsSheet || !hasSummarySheet) {
    console.warn("Could not find required sheets in Excel file");
  }
  
  // Extract from Pharmacy Details sheet
  const detailsSheet = getSheetData(workbook, "Pharmacy Details");
  if (!detailsSheet) {
    console.warn("Could not parse Pharmacy Details sheet");
  }
  
  // Initialize data object
  const data: any = {
    contractorCode: "",
    dispensingMonth: "",
    netPayment: 0
  };
  
  // Get basic information if details sheet exists
  if (detailsSheet) {
    const dispensingMonthRaw = findValueByLabel(detailsSheet, "DISPENSING MONTH");
    data.contractorCode = findValueByLabel(detailsSheet, "CONTRACTOR CODE") || "";
    data.dispensingMonth = dispensingMonthRaw || "";
    data.netPayment = findValueByLabel(detailsSheet, "NET PAYMENT TO BANK") || 0;
    
    // Extract year from dispensing month (now properly checking for year in the format)
    if (dispensingMonthRaw && typeof dispensingMonthRaw === 'string') {
      // Parse the dispensing month string to extract month and year
      const parts = dispensingMonthRaw.trim().split(' ');
      if (parts.length >= 2) {
        const month = parts[0];
        // The year should be the last part (in case there are other words in between)
        const yearMatch = dispensingMonthRaw.match(/\b(19|20)\d{2}\b/);
        const year = yearMatch ? parseInt(yearMatch[0], 10) : null;
        
        // Store month and year separately for easier database querying
        data.month = month.toUpperCase();
        
        // If year is explicitly stated in the string, use it, otherwise infer it
        if (year) {
          data.year = year;
        } else {
          // Infer year based on current date and month name
          const currentDate = new Date();
          const currentMonth = currentDate.getMonth(); // 0-11
          const currentYear = currentDate.getFullYear();
          
          // Get month index (0-11) from month name
          const monthNames = ["january", "february", "march", "april", "may", "june",
                             "july", "august", "september", "october", "november", "december"];
          const monthIndex = monthNames.findIndex(m => 
            m.toLowerCase() === month.toLowerCase()
          );
          
          // If month index is valid
          if (monthIndex !== -1) {
            // If month is later in the year than current month, likely previous year
            if (monthIndex > currentMonth) {
              data.year = currentYear - 1;
            } else {
              data.year = currentYear;
            }
          } else {
            // Default to current year if month name can't be parsed
            data.year = currentYear;
          }
        }
      }
    }
  }
  
  // Extract from Payment Summary sheet
  const summary = getSheetData(workbook, "Community Pharmacy Payment Summ");
  if (summary) {
    // Find item counts row and extract data
    data.itemCounts = {
      total: findValueInRow(summary, "Total No Of Items", 3) || 0,
      ams: findValueInRow(summary, "Total No Of Items", 5) || 0,
      mcr: findValueInRow(summary, "Total No Of Items", 6) || 0,
      nhsPfs: findValueInRow(summary, "Total No Of Items", 7) || 0,
      cpus: findValueInRow(summary, "Total No Of Items", 9) || 0,
      other: findValueInRow(summary, "Total No Of Items", 11) || 0
    };
    
    // Get financial data
    data.financials = {
      grossIngredientCost: findValueInRow(summary, "Total Gross Ingredient Cost", 3) || 0,
      netIngredientCost: findValueInRow(summary, "Total Net Ingredient Cost", 5) || 0,
      dispensingPool: findValueInRow(summary, "Dispensing Pool Payment", 3) || 0,
      establishmentPayment: findValueInRow(summary, "Establishment Payment", 3) || 0,
      // Add new financial details
      pharmacyFirstBase: parseCurrencyValue(findValueInRow(summary, "Pharmacy First Base Payment", 3)) || 0,
      pharmacyFirstActivity: parseCurrencyValue(findValueInRow(summary, "Pharmacy First Activity Payment", 3)) || 0,
      averageGrossValue: findValueInRow(summary, "Average Gross Value", 3) || 0,
      supplementaryPayments: findValueInRow(summary, "Supplementary & Service Payments", 3) || 0
    };
    
    // Add advance payment details
    data.advancePayments = {
      previousMonth: findValueInRow(summary, "Advance Payment Already Paid", 5) || 0,
      nextMonth: findValueInRow(summary, "Advance Payment (month 2)", 7) || 0
    };
    
    // Add detailed service costs
    data.serviceCosts = {
      ams: findValueInRow(summary, "Total Gross Ingredient Cost by Service", 5) || 0,
      mcr: findValueInRow(summary, "Total Gross Ingredient Cost by Service", 6) || 0,
      nhsPfs: findValueInRow(summary, "Total Gross Ingredient Cost by Service", 7) || 0,
      cpus: findValueInRow(summary, "Total Gross Ingredient Cost by Service", 9) || 0,
      other: findValueInRow(summary, "Total Gross Ingredient Cost by Service", 11) || 0
    };
  }
  
  // Add supplementary payments extraction
  const supplementaryPayments = extractSupplementaryPayments(workbook);
  if (supplementaryPayments) {
    console.log("Successfully extracted supplementary payments:", 
                supplementaryPayments.details.length, "entries,", 
                "total:", supplementaryPayments.total);
    data.supplementaryPayments = supplementaryPayments;
  } else {
    console.log("No supplementary payments extracted or empty data");
  }

  // Use locally defined extractPfsDetails function instead of importing it
  try {
    if (debug) {
      console.log("Calling PFS details extraction function with full workbook");
    }
    // Using the function directly from this file instead of importing
    const pfsDetails = extractPfsDetails(workbook);
    if (pfsDetails) {
      if (debug) {
        console.log("PFS details extracted successfully:", pfsDetails);
      }
      data.pfsDetails = pfsDetails;
    } else {
      console.warn("No PFS details extracted");
      if (debug) {
        console.log("PFS extraction returned null. Check the sheet name and structure.");
      }
    }
  } catch (error) {
    console.error("Error extracting PFS details:", error);
  }
  
  return data;
}
