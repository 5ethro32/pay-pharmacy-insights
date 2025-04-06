import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet } from "lucide-react";
import * as XLSX from 'xlsx';

interface DocumentUploadProps {
  userId: string | undefined;
}

// Helper function to find value by row label
function findValueByLabel(data: any[][], label: string) {
  for (let i = 0; i < data.length; i++) {
    if (data[i][1] && String(data[i][1]).includes(label)) {
      return data[i][2];
    }
  }
  return null;
}

// Helper function to find value in specific column of a labeled row
function findValueInRow(data: any[][], rowLabel: string, colIndex: number) {
  for (let i = 0; i < data.length; i++) {
    if (data[i][1] && String(data[i][1]).includes(rowLabel)) {
      return data[i][colIndex];
    }
  }
  return null;
}

// Helper function to handle currency values
function parseCurrencyValue(value: any) {
  if (value === null || value === undefined) return null;
  
  if (typeof value === 'number') return value;
  
  if (typeof value === 'string') {
    const cleanValue = value.replace(/[£$€,\s]/g, '').trim();
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? null : parsed;
  }
  
  return null;
}

// Helper function to find a specific sheet in workbook
function getSheetData(workbook: XLSX.WorkBook, sheetName: string): any[][] | null {
  if (!workbook.SheetNames.includes(sheetName)) {
    return null;
  }
  
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet, {header: 1}) as any[][];
}

// Function to extract regional payments
function extractRegionalPayments(workbook: XLSX.WorkBook) {
  if (!workbook.SheetNames.includes("Regional Payments")) {
    return null;
  }
  
  const regionalSheet = workbook.Sheets["Regional Payments"];
  const data = XLSX.utils.sheet_to_json(regionalSheet);
  
  const result = {
    totalAmount: 0,
    paymentDetails: [] as any[]
  };
  
  data.forEach((row: any) => {
    if (row['__EMPTY_1'] && row['__EMPTY_3'] && 
        (typeof row['__EMPTY_3'] === 'number' || typeof row['__EMPTY_3'] === 'string')) {
      
      if (!['REGIONAL PAYMENTS', 'CP Service Description', 'Sum:'].includes(row['__EMPTY_1'])) {
        const amount = typeof row['__EMPTY_3'] === 'string' 
          ? parseCurrencyValue(row['__EMPTY_3']) || 0 
          : row['__EMPTY_3'];
          
        result.paymentDetails.push({
          description: row['__EMPTY_1'],
          amount: amount
        });
      }
      
      if (row['__EMPTY_1'] === 'Sum:') {
        result.totalAmount = typeof row['__EMPTY_3'] === 'string' 
          ? parseCurrencyValue(row['__EMPTY_3']) || 0 
          : row['__EMPTY_3'];
      }
    }
  });
  
  return result;
}

// Function to extract high value items
function extractHighValueItems(workbook: XLSX.WorkBook) {
  const sheet = workbook.Sheets["High Value"];
  if (!sheet) return { items: [], totalValue: 0, itemCount: 0 };
  
  const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
  
  let dataStartRow = 0;
  for (let i = 0; i < rawData.length; i++) {
    if (rawData[i] && Array.isArray(rawData[i]) && rawData[i].some((cell: any) => 
      typeof cell === 'string' && 
      (cell.includes("Item") || cell.includes("Description") || cell.includes("Value"))
    )) {
      dataStartRow = i + 1;
      break;
    }
  }
  
  const highValueItems: any[] = [];
  let totalValue = 0;
  
  for (let i = dataStartRow; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row || !Array.isArray(row) || row.length < 3) continue;
    if (!row[1] || !row[2]) continue;
    
    let priceCol = -1;
    for (let j = 3; j < 6; j++) {
      if (typeof row[j] === 'number' && row[j] > 200) {
        priceCol = j;
        break;
      }
    }
    
    if (priceCol === -1) continue;
    
    const item = {
      description: row[1],
      formStrength: row[2] || "",
      quantity: row[priceCol-1] || 0,
      price: row[priceCol],
      date: row[row.length-1] ? String(row[row.length-1]) : null
    };
    
    highValueItems.push(item);
    totalValue += item.price;
  }
  
  return {
    items: highValueItems,
    totalValue: totalValue,
    itemCount: highValueItems.length
  };
}

// Function to extract processing errors
function extractProcessingErrors(workbook: XLSX.WorkBook) {
  const sheet = workbook.Sheets["Processing Error Breakdown"];
  if (!sheet) return { errors: [], netAdjustment: 0, errorCount: 0 };
  
  const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
  
  let dataStartRow = 0;
  for (let i = 0; i < rawData.length; i++) {
    if (rawData[i] && Array.isArray(rawData[i]) && rawData[i].some((cell: any) => 
      typeof cell === 'string' && 
      (cell.includes("Original") || cell.includes("Paid") || cell.includes("Adjustment"))
    )) {
      dataStartRow = i + 1;
      break;
    }
  }
  
  const processingErrors: any[] = [];
  let netAdjustment = 0;
  
  for (let i = dataStartRow; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row || !Array.isArray(row) || row.length < 5) continue;
    if (!row[1]) continue;
    
    let originalPaidCol = -1;
    let shouldHavePaidCol = -1;
    let adjustmentCol = -1;
    
    for (let j = 2; j < row.length; j++) {
      if (typeof row[j] === 'number') {
        if (originalPaidCol === -1) {
          originalPaidCol = j;
        } else if (shouldHavePaidCol === -1) {
          shouldHavePaidCol = j;
        } else if (adjustmentCol === -1) {
          adjustmentCol = j;
          break;
        }
      }
    }
    
    if (originalPaidCol === -1 || shouldHavePaidCol === -1 || adjustmentCol === -1) {
      continue;
    }
    
    const error = {
      description: row[1],
      originalPaid: row[originalPaidCol],
      shouldHavePaid: row[shouldHavePaidCol],
      adjustment: row[adjustmentCol]
    };
    
    processingErrors.push(error);
    netAdjustment += error.adjustment;
  }
  
  return {
    errors: processingErrors,
    netAdjustment: netAdjustment,
    errorCount: processingErrors.length
  };
}

// Core parsing function to extract data from Excel
async function parsePaymentSchedule(file: File) {
  const fileData = await file.arrayBuffer();
  const workbook = XLSX.read(fileData, {
    cellStyles: true, cellDates: true, cellNF: true
  });
  
  const sheets = workbook.SheetNames;
  if (!sheets.includes("Pharmacy Details") || !sheets.includes("Community Pharmacy Payment Summ")) {
    throw new Error("Required sheets not found in the Excel file");
  }
  
  const detailsSheet = getSheetData(workbook, "Pharmacy Details");
  if (!detailsSheet) {
    throw new Error("Could not parse Pharmacy Details sheet");
  }
  
  const dispensingMonthRaw = findValueByLabel(detailsSheet, "DISPENSING MONTH");
  const data: any = {
    contractorCode: findValueByLabel(detailsSheet, "CONTRACTOR CODE"),
    dispensingMonth: dispensingMonthRaw,
    netPayment: findValueByLabel(detailsSheet, "NET PAYMENT TO BANK")
  };
  
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
  
  const summary = getSheetData(workbook, "Community Pharmacy Payment Summ");
  if (!summary) {
    throw new Error("Could not parse Community Pharmacy Payment Summary sheet");
  }
  
  data.itemCounts = {
    total: findValueInRow(summary, "Total No Of Items", 3),
    ams: findValueInRow(summary, "Total No Of Items", 5),
    mcr: findValueInRow(summary, "Total No Of Items", 6),
    nhsPfs: findValueInRow(summary, "Total No Of Items", 7),
    cpus: findValueInRow(summary, "Total No Of Items", 9)
  };
  
  data.financials = {
    grossIngredientCost: findValueInRow(summary, "Total Gross Ingredient Cost", 3),
    netIngredientCost: findValueInRow(summary, "Total Net Ingredient Cost", 5),
    dispensingPool: findValueInRow(summary, "Dispensing Pool Payment", 3),
    establishmentPayment: findValueInRow(summary, "Establishment Payment", 3),
    pharmacyFirstBase: parseCurrencyValue(findValueInRow(summary, "Pharmacy First Base Payment", 3)),
    pharmacyFirstActivity: parseCurrencyValue(findValueInRow(summary, "Pharmacy First Activity Payment", 3)),
    averageGrossValue: findValueInRow(summary, "Average Gross Value", 3),
    supplementaryPayments: findValueInRow(summary, "Supplementary & Service Payments", 3)
  };
  
  data.advancePayments = {
    previousMonth: findValueInRow(summary, "Advance Payment Already Paid", 5),
    nextMonth: findValueInRow(summary, "Advance Payment (month 2)", 7)
  };
  
  data.serviceCosts = {
    ams: findValueInRow(summary, "Total Gross Ingredient Cost by Service", 5),
    mcr: findValueInRow(summary, "Total Gross Ingredient Cost by Service", 6),
    nhsPfs: findValueInRow(summary, "Total Gross Ingredient Cost by Service", 7),
    cpus: findValueInRow(summary, "Total Gross Ingredient Cost by Service", 9),
    other: findValueInRow(summary, "Total Gross Ingredient Cost by Service", 11)
  };
  
  const pfsSheet = getSheetData(workbook, "NHS PFS Payment Calculation");
  if (pfsSheet) {
    data.pfsDetails = {
      treatmentItems: findValueByLabel(pfsSheet, "PFS TREATMENT ITEMS"),
      consultations: findValueByLabel(pfsSheet, "PFS CONSULTATIONS"),
      referrals: findValueByLabel(pfsSheet, "PFS REFERRALS"),
      weightedActivityTotal: findValueByLabel(pfsSheet, "WEIGHTED ACTIVITY TOTAL"),
      basePayment: parseCurrencyValue(findValueByLabel(pfsSheet, "BASE PAYMENT")),
      activityPayment: parseCurrencyValue(findValueByLabel(pfsSheet, "ACTIVITY PAYMENT")),
      totalPayment: parseCurrencyValue(findValueByLabel(pfsSheet, "TOTAL PAYMENT"))
    };
  }
  
  const regionalPayments = extractRegionalPayments(workbook);
  if (regionalPayments) {
    data.regionalPayments = regionalPayments;
  }
  
  const highValueItems = extractHighValueItems(workbook);
  if (highValueItems && highValueItems.items.length > 0) {
    data.highValueItems = highValueItems;
  }
  
  const processingErrors = extractProcessingErrors(workbook);
  if (processingErrors && processingErrors.errors.length > 0) {
    data.processingErrors = processingErrors;
  }
  
  return data;
}

const DocumentUpload = ({ userId }: DocumentUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [parseSuccess, setParseSuccess] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = async (selectedFile: File | null) => {
    if (selectedFile) {
      setFile(selectedFile);
      
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        try {
          setIsParsingFile(true);
          const parsedData = await parsePaymentSchedule(selectedFile);
          setExtractedData(parsedData);
          setParseSuccess(true);
          
          toast({
            title: "File analyzed successfully",
            description: "Payment schedule data extracted",
          });
        } catch (error: any) {
          toast({
            title: "Error analyzing Excel file",
            description: error.message || "Could not parse the payment schedule",
            variant: "destructive",
          });
          setParseSuccess(false);
        } finally {
          setIsParsingFile(false);
        }
      }
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      await handleFileChange(selectedFile);
    }
  };
  
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer?.files?.[0];
    if (droppedFile) {
      await handleFileChange(droppedFile);
    }
  };
  
  const handleButtonClick = () => {
    inputRef.current?.click();
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !userId) {
      toast({
        title: "Missing information",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;

      const name = file.name.split('.')[0];
      
      let description = name;
      let month = "";
      let year = "";
      
      if (extractedData) {
        if (extractedData.dispensingMonth) {
          description = `Payment schedule for contractor ${extractedData.contractorCode || ''} - ${extractedData.dispensingMonth || ''}`;
          
          month = extractedData.month || "";
          year = extractedData.year ? extractedData.year.toString() : "";
        }
      }
      
      const documentData = {
        user_id: userId,
        name,
        description,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        month,
        year: year ? parseInt(year) : new Date().getFullYear(),
        extracted_data: extractedData
      };
      
      console.log("Inserting document with data:", documentData);
      
      const { error: insertError } = await supabase
        .from('documents')
        .insert(documentData);
      
      if (insertError) {
        console.error("Insert error:", insertError);
        throw insertError;
      }
      
      toast({
        title: "Document uploaded",
        description: "Your document has been successfully uploaded.",
      });
      
      setFile(null);
      setExtractedData(null);
      setParseSuccess(false);
      
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "An error occurred while uploading the document.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
          dragActive ? "border-red-600 bg-red-50" : "border-gray-300 hover:border-red-300"
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          ref={inputRef}
          id="file-upload"
          type="file"
          className="hidden"
          onChange={handleInputChange}
          disabled={uploading || isParsingFile}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
        />
        
        <div className="flex flex-col items-center justify-center space-y-2 cursor-pointer">
          <div className="p-3 bg-red-50 rounded-full">
            <Upload className="w-8 h-8 text-red-700" />
          </div>
          <p className="text-sm font-medium">
            {file ? file.name : "Drag & drop a file or click to browse"}
          </p>
          <p className="text-xs text-gray-500">
            Support for PDF, Word, Excel, and CSV files
          </p>
        </div>
      </div>
      
      {file && (
        <p className="text-xs text-gray-500">
          {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          {file.name.endsWith('.xlsx') && parseSuccess && (
            <span className="ml-2 text-green-600">✓ Payment schedule detected</span>
          )}
        </p>
      )}
      {isParsingFile && (
        <div className="flex items-center text-xs text-amber-600">
          <div className="w-3 h-3 mr-2 border-2 border-t-amber-600 rounded-full animate-spin"></div>
          Analyzing payment schedule...
        </div>
      )}
      
      {extractedData && (
        <div className="p-4 bg-green-50 rounded-md border border-green-100">
          <h4 className="text-sm font-medium text-green-800 flex items-center mb-2">
            <FileSpreadsheet className="h-4 w-4 mr-1" />
            Payment Schedule Data Preview
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Contractor:</span> {extractedData.contractorCode}
            </div>
            <div>
              <span className="font-medium">Month:</span> {extractedData.month} {extractedData.year}
            </div>
            <div>
              <span className="font-medium">Net Payment:</span> {extractedData.netPayment}
            </div>
            <div>
              <span className="font-medium">Total Items:</span> {extractedData.itemCounts?.total}
            </div>
          </div>
        </div>
      )}
      
      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600"
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload Document"}
        <Upload className="w-4 h-4 ml-2" />
      </Button>
    </form>
  );
};

export default DocumentUpload;
