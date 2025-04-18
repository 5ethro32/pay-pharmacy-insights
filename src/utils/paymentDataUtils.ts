import * as XLSX from 'xlsx';
import { PaymentData, PFSDetails, SupplementaryPaymentDetail } from "@/types/paymentTypes";

// Helper function to find value by row label (needed for parsePaymentSchedule)
function findValueByLabel(data: any[][], label: string) {
  for (let i = 0; i < data.length; i++) {
    if (data[i][1] && String(data[i][1]).includes(label)) {
      return data[i][2];
    }
    
    if (data[i][0] && String(data[i][0]).includes(label)) {
      const value = data[i][2] || data[i][3];
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
  
  if (typeof value === 'number') return value;
  
  if (typeof value === 'string') {
    const cleanValue = value.replace(/[£$€,\s]/g, '').trim();
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? null : parsed;
  }
  
  return null;
}

// Helper function to find a specific sheet in workbook (needed for parsePaymentSchedule)
function getSheetData(workbook: XLSX.WorkBook, sheetName: string): any[][] | null {
  const exactSheet = workbook.SheetNames.find(sheet => sheet === sheetName);
  if (exactSheet) {
    const sheet = workbook.Sheets[exactSheet];
    return XLSX.utils.sheet_to_json(sheet, {header: 1}) as any[][];
  }
  
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
  
  console.log(`Transforming document ${document.id} - month: ${document.month}, year: ${document.year}`);
  console.log("Document PFS data:", data.pfsDetails ? "present" : "missing", data.pfsDetails);
  console.log("Document supplementary payments:", data.supplementaryPayments ? 
              `${data.supplementaryPayments.details?.length || 0} entries` : 
              "missing");
  
  const month = data.month ? data.month.charAt(0).toUpperCase() + data.month.slice(1).toLowerCase() : "";
  
  const paymentData: PaymentData = {
    id: document.id || "",
    month: month,
    year: data.year || new Date().getFullYear(),
    totalItems: data.itemCounts?.total || 0,
    netPayment: data.netPayment || 0,
    contractorCode: data.contractorCode || "",
    dispensingMonth: data.dispensingMonth || "",
    
    itemCounts: {
      total: data.itemCounts?.total || 0,
      ams: data.itemCounts?.ams || 0,
      mcr: data.itemCounts?.mcr || 0,
      nhsPfs: data.itemCounts?.nhsPfs || 0,
      cpus: data.itemCounts?.cpus || 0,
      other: data.itemCounts?.other || 0
    },
    
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
    
    advancePayments: {
      previousMonth: data.advancePayments?.previousMonth || 0,
      nextMonth: data.advancePayments?.nextMonth || 0
    },
    
    serviceCosts: data.serviceCosts || {},
    
    pfsDetails: data.pfsDetails || {},
    
    regionalPayments: data.regionalPayments || null,

    supplementaryPayments: undefined,
    
    prescriptionVolumeByPrice: data.prescriptionVolumeByPrice || {}
  };
  
  if (data.pfsDetails) {
    console.log(`Document ${document.id} has PFS data with ${Object.keys(data.pfsDetails).length} fields`);
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
  console.log("Starting PFS field detection...");
  
  const possibleSheetNames = [
    "NHS PFS Payment Calculation", 
    "PFS Payment Calculation",
    "NHS Pharmacy First Scotland",
    "Pharmacy First Scotland",
    "Pharmacy First",
    "NHS PHARMACY FIRST SCOTLAND PAYMENT CALCULATIONS",
    "PFS"
  ];
  
  let pfsSheetName: string | null = null;
  let detectedFields: string[] = [];
  
  for (const name of possibleSheetNames) {
    if (workbook.SheetNames.includes(name)) {
      pfsSheetName = name;
      break;
    }
  }
  
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
  
  const pfsSheet = workbook.Sheets[pfsSheetName];
  if (!pfsSheet) {
    console.warn(`Sheet ${pfsSheetName} exists in SheetNames but couldn't be accessed`);
    return null;
  }
  
  const data: any[][] = XLSX.utils.sheet_to_json(pfsSheet, { header: 1 });
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row) continue;
    
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
  
  console.log("Extracting PFS details from workbook");
  
  let headerRowIndex = 8;
  let descriptionColumnIndex = 1;
  let valueColumnIndex = 3;
  
  console.log(`Using fixed position - Header row (${headerRowIndex}):`, data[headerRowIndex]);
  
  let pfsDetails: PFSDetails = {};
  
  for (let i = headerRowIndex + 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length <= descriptionColumnIndex) continue;
    
    const description = row[descriptionColumnIndex];
    const value = row[valueColumnIndex];
    
    if (!description) continue;
    
    const descStr = String(description).trim();
    
    if (!descStr || descStr.length < 3) continue;
    
    console.log(`Row ${i}: Description: ${descStr}, Value: ${value}`);
    
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
    
    else if (descStr.includes("PAYMENT") || descStr.includes("ACTIVITY") || 
            descStr.includes("PFS") || descStr.includes("UTI") ||
            descStr.includes("TREATMENT") || descStr.includes("CONSULTATION") ||
            descStr.includes("IMPETIGO") || descStr.includes("SHINGLES") ||
            descStr.includes("INFECTION") || descStr.includes("HAYFEVER")) {
      console.log(`Unmatched PFS description: "${descStr}" with value: ${value}`);
    }
  }
  
  function processValue(value: any): number {
    if (value === undefined || value === null) return 0;
    
    if (typeof value === 'number') return value;
    
    if (typeof value === 'string') {
      const cleanValue = value.replace(/[£$€,\s]/g, '').trim();
      if (cleanValue === '') return 0;
      
      const parsed = parseFloat(cleanValue);
      return isNaN(parsed) ? 0 : parsed;
    }
    
    return 0;
  }
  
  if (!pfsDetails.totalPayment && pfsDetails.basePayment && pfsDetails.activityPayment) {
    pfsDetails.totalPayment = pfsDetails.basePayment + pfsDetails.activityPayment;
  }
  
  if (!pfsDetails.weightedActivityTotal) {
    let total = 0;
    
    if (pfsDetails.treatmentWeightedSubtotal) total += pfsDetails.treatmentWeightedSubtotal;
    if (pfsDetails.consultationsWeightedSubtotal) total += pfsDetails.consultationsWeightedSubtotal;
    if (pfsDetails.referralsWeightedSubtotal) total += pfsDetails.referralsWeightedSubtotal;
    
    if (pfsDetails.utiTreatmentWeightedSubtotal) total += pfsDetails.utiTreatmentWeightedSubtotal;
    if (pfsDetails.utiConsultationsWeightedSubtotal) total += pfsDetails.utiConsultationsWeightedSubtotal;
    if (pfsDetails.utiReferralsWeightedSubtotal) total += pfsDetails.utiReferralsWeightedSubtotal;
    
    if (pfsDetails.impetigoTreatmentWeightedSubtotal) total += pfsDetails.impetigoTreatmentWeightedSubtotal;
    if (pfsDetails.impetigoConsultationsWeightedSubtotal) total += pfsDetails.impetigoConsultationsWeightedSubtotal;
    if (pfsDetails.impetigoReferralsWeightedSubtotal) total += pfsDetails.impetigoReferralsWeightedSubtotal;
    
    if (pfsDetails.shinglesTreatmentWeightedSubtotal) total += pfsDetails.shinglesTreatmentWeightedSubtotal;
    if (pfsDetails.shinglesConsultationsWeightedSubtotal) total += pfsDetails.shinglesConsultationsWeightedSubtotal;
    if (pfsDetails.shinglesReferralsWeightedSubtotal) total += pfsDetails.shinglesReferralsWeightedSubtotal;
    
    if (pfsDetails.skinInfectionWeightedSubtotal) total += pfsDetails.skinInfectionWeightedSubtotal;
    if (pfsDetails.skinInfectionConsultationsWeightedSubtotal) total += pfsDetails.skinInfectionConsultationsWeightedSubtotal;
    if (pfsDetails.skinInfectionReferralsWeightedSubtotal) total += pfsDetails.skinInfectionReferralsWeightedSubtotal;
    
    if (pfsDetails.hayfeverWeightedSubtotal) total += pfsDetails.hayfeverWeightedSubtotal;
    if (pfsDetails.hayfeverConsultationsWeightedSubtotal) total += pfsDetails.hayfeverConsultationsWeightedSubtotal;
    if (pfsDetails.hayfeverReferralsWeightedSubtotal) total += pfsDetails.hayfeverReferralsWeightedSubtotal;
    
    if (total > 0) {
      pfsDetails.weightedActivityTotal = total;
    }
  }
  
  return pfsDetails;
};

// Add this new function to extract supplementary payments
function extractSupplementaryPayments(workbook: XLSX.WorkBook): { details: SupplementaryPaymentDetail[], total: number } | null {
  console.log("Starting supplementary payments extraction...");
  
  const possibleSheetNames = [
    "Supplementary & Service Payments",
    "Supplementary and Service Payments",
    "Supplementary Payments",
    "Service Payments"
  ];
  
  let supplementarySheet: string | null = null;
  
  // Find the correct sheet
  for (const name of possibleSheetNames) {
    if (workbook.SheetNames.includes(name)) {
      supplementarySheet = name;
      break;
    }
  }
  
  // Try partial match if no exact match found
  if (!supplementarySheet) {
    supplementarySheet = workbook.SheetNames.find(sheet => 
      sheet.toLowerCase().includes('supplementary') || 
      sheet.toLowerCase().includes('service payment')
    ) || null;
  }
  
  if (!supplementarySheet) {
    console.log("No supplementary payments sheet found");
    return null;
  }
  
  console.log(`Found supplementary payments sheet: ${supplementarySheet}`);
  
  const sheet = workbook.Sheets[supplementarySheet];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
  
  const details: SupplementaryPaymentDetail[] = [];
  let total = 0;
  
  // Start from row 1 (skipping header)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length < 2) continue;
    
    const code = row[0];
    const amount = parseCurrencyValue(row[1]) || 0;
    
    if (code && typeof code === 'string' && code.trim() !== '') {
      details.push({
        code: code.trim(),
        amount
      });
      total += amount;
    }
  }
  
  if (details.length === 0) {
    console.log("No supplementary payment details found in sheet");
    return null;
  }
  
  console.log(`Extracted ${details.length} supplementary payment details`);
  return { details, total };
}

// NEW FUNCTION: Extract prescription volumes by price bracket
function extractPrescriptionVolumeByPrice(data: any[][]): { [key: string]: number } | null {
  const result: { [key: string]: number } = {};
  let startRow = -1;
  
  // Find the section header row
  for (let i = 0; i < data.length; i++) {
    if (data[i] && data[i][1] && 
        String(data[i][1]).includes("DISTRIBUTION OF PRESCRIPTION ITEMS BY PRICE")) {
      startRow = i + 2; // Skip header row
      break;
    }
  }
  
  if (startRow === -1) return null;
  
  // Extract data from the section
  for (let i = startRow; i < data.length; i++) {
    const row = data[i];
    
    // Stop when we reach an empty row or a new section
    if (!row || !row[1] || row[1] === "") break;
    
    const priceRange = String(row[1]).trim();
    const volume = parseInt(row[2], 10);
    
    if (!isNaN(volume) && priceRange !== "") {
      result[priceRange] = volume;
    }
  }
  
  return Object.keys(result).length > 0 ? result : null;
}

export async function parsePaymentSchedule(file: File, debug: boolean = false) {
  if (debug) {
    console.log("Starting to parse payment schedule with debug mode enabled");
  }
  
  const fileData = await file.arrayBuffer();
  const workbook = XLSX.read(fileData, {
    cellStyles: true, cellDates: true, cellNF: true
  });
  
  if (debug) {
    console.log("Available sheets:", workbook.SheetNames);
  }
  
  const sheets = workbook.SheetNames;
  const hasDetailsSheet = sheets.some(sheet => 
    sheet.includes("Pharmacy Details") || sheet.includes("Details"));
  const hasSummarySheet = sheets.some(sheet => 
    sheet.includes("Payment Summ") || sheet.includes("Summary"));
  
  if (!hasDetailsSheet || !hasSummarySheet) {
    console.warn("Could not find required sheets in Excel file");
  }
  
  const detailsSheet = getSheetData(workbook, "Pharmacy Details");
  if (!detailsSheet) {
    console.warn("Could not parse Pharmacy Details sheet");
  }
  
  const data: any = {
    contractorCode: "",
    dispensingMonth: "",
    netPayment: 0,
    pharmacyName: "",
    healthBoard: ""
  };
  
  if (detailsSheet) {
    const dispensingMonthRaw = findValueByLabel(detailsSheet, "DISPENSING MONTH");
    data.contractorCode = findValueByLabel(detailsSheet, "CONTRACTOR CODE") || "";
    data.dispensingMonth = dispensingMonthRaw || "";
    data.netPayment = findValueByLabel(detailsSheet, "NET PAYMENT TO BANK") || 0;
    
    if (dispensingMonthRaw && typeof dispensingMonthRaw === 'string') {
      const parts = dispensingMonthRaw.trim().split(' ');
      if (parts.length >= 2) {
        const month = parts[0];
        const yearMatch = dispensingMonthRaw.match(/\b(19|20)\d{2}\b/);
        const year = yearMatch ? parseInt(yearMatch[0], 10) : null;
        
        data.month = month.toUpperCase();
        
        if (year) {
          data.year = year;
        } else {
          const currentDate = new Date();
          const currentMonth = currentDate.getMonth();
          const currentYear = currentDate.getFullYear();
          
          const monthNames = ["january", "february", "march", "april", "may", "june",
                             "july", "august", "september", "october", "november", "december"];
          const monthIndex = monthNames.findIndex(m => 
            m.toLowerCase() === month.toLowerCase()
          );
          
          if (monthIndex !== -1) {
            if (monthIndex > currentMonth) {
              data.year = currentYear - 1;
            } else {
              data.year = currentYear;
            }
          } else {
            data.year = currentYear;
          }
        }
      }
    }
    
    // Extract Pharmacy Name from C15
    const pharmacyNameRaw = detailsSheet[14] && detailsSheet[14][2];
    data.pharmacyName = pharmacyNameRaw ? String(pharmacyNameRaw).trim() : "";
    
    // Extract Health Board from C16
    const healthBoardRaw = detailsSheet[15] && detailsSheet[15][2];
    data.healthBoard = healthBoardRaw ? String(healthBoardRaw).trim() : "";

    // Extract prescription volumes by price bracket
    const prescriptionVolumeByPrice = extractPrescriptionVolumeByPrice(detailsSheet);
    if (prescriptionVolumeByPrice) {
      data.prescriptionVolumeByPrice = prescriptionVolumeByPrice;
      
      if (debug) {
        console.log("Extracted prescription volume by price:", prescriptionVolumeByPrice);
      }
    }
  }
  
  const summary = getSheetData(workbook, "Community Pharmacy Payment Summ");
  if (summary) {
    data.itemCounts = {
      total: findValueInRow(summary, "Total No Of Items", 3) || 0,
      ams: findValueInRow(summary, "Total No Of Items", 5) || 0,
      mcr: findValueInRow(summary, "Total No Of Items", 6) || 0,
      nhsPfs: findValueInRow(summary, "Total No Of Items", 7) || 0,
      cpus: findValueInRow(summary, "Total No Of Items", 9) || 0,
      other: findValueInRow(summary, "Total No Of Items", 11) || 0
    };
    
    data.financials = {
      grossIngredientCost: findValueInRow(summary, "Total Gross Ingredient Cost", 3) || 0,
      netIngredientCost: findValueInRow(summary, "Total Net Ingredient Cost", 5) || 0,
      dispensingPool: findValueInRow(summary, "Dispensing Pool Payment", 3) || 0,
      establishmentPayment: findValueInRow(summary, "Establishment Payment", 3) || 0,
      pharmacyFirstBase: parseCurrencyValue(findValueInRow(summary, "Pharmacy First Base Payment", 3)) || 0,
      pharmacyFirstActivity: parseCurrencyValue(findValueInRow(summary, "Pharmacy First Activity Payment", 3)) || 0,
      averageGrossValue: findValueInRow(summary, "Average Gross Value", 3) || 0
    };
    
    data.advancePayments = {
      previousMonth: findValueInRow(summary, "Advance Payment Already Paid", 5) || 0,
      nextMonth: findValueInRow(summary, "Advance Payment (month 2)", 7) || 0
    };
    
    data.serviceCosts = {
      ams: findValueInRow(summary, "Total Gross Ingredient Cost by Service", 5) || 0,
      mcr: findValueInRow(summary, "Total Gross Ingredient Cost by Service", 6) || 0,
      nhsPfs: findValueInRow(summary, "Total Gross Ingredient Cost by Service", 7) || 0,
      cpus: findValueInRow(summary, "Total Gross Ingredient Cost by Service", 9) || 0,
      other: findValueInRow(summary, "Total Gross Ingredient Cost by Service", 11) || 0
    };
    
    try {
      if (debug) {
        console.log("Calling PFS details extraction function with full workbook");
      }
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
    
    const supplementaryPayments = extractSupplementaryPayments(workbook);
    if (supplementaryPayments) {
      data.supplementaryPayments = supplementaryPayments;
    }
  }
  
  if (debug) {
    console.log("Final extracted data:", data);
  }
  return data;
}
