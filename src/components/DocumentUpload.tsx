
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet } from "lucide-react";
import * as XLSX from 'xlsx';

interface DocumentUploadProps {
  userId: string | undefined;
  debug?: boolean;
}

// Helper function to find value by row label
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

// Helper function to find a specific sheet in workbook
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

// Function to extract regional payment data
function extractRegionalPayments(workbook: XLSX.WorkBook) {
  // Get the Regional Payments sheet
  if (!workbook.SheetNames.includes("Regional Payments")) {
    return null;
  }
  
  const regionalSheet = workbook.Sheets["Regional Payments"];
  const data = XLSX.utils.sheet_to_json(regionalSheet);
  
  // Initialize results object
  const result = {
    totalAmount: 0,
    paymentDetails: [] as any[]
  };
  
  // Parse individual payment items
  data.forEach((row: any) => {
    // Look for rows with payment descriptions and amounts
    if (row['__EMPTY_1'] && row['__EMPTY_3'] && 
        (typeof row['__EMPTY_3'] === 'number' || typeof row['__EMPTY_3'] === 'string')) {
      
      // Skip header rows and sum row
      if (!['REGIONAL PAYMENTS', 'CP Service Description', 'Sum:'].includes(row['__EMPTY_1'])) {
        const amount = typeof row['__EMPTY_3'] === 'string' 
          ? parseCurrencyValue(row['__EMPTY_3']) || 0 
          : row['__EMPTY_3'];
          
        result.paymentDetails.push({
          description: row['__EMPTY_1'],
          amount: amount
        });
      }
      
      // Capture the sum if this is the summary row
      if (row['__EMPTY_1'] === 'Sum:') {
        result.totalAmount = typeof row['__EMPTY_3'] === 'string' 
          ? parseCurrencyValue(row['__EMPTY_3']) || 0 
          : row['__EMPTY_3'];
      }
    }
  });
  
  return result;
}

// Core parsing function to extract data from Excel
async function parsePaymentSchedule(file: File, debug: boolean = false) {
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
  
  // Import and use the extractPfsDetails function from utils
  const { extractPfsDetails } = await import('../utils/paymentDataUtils');
  
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
  
  // Extract regional payments if sheet exists
  const regionalPayments = extractRegionalPayments(workbook);
  if (regionalPayments) {
    data.regionalPayments = regionalPayments;
  }
  
  if (debug) {
    console.log("Final extracted data:", data);
  }
  return data;
}

const DocumentUpload = ({ userId, debug = false }: DocumentUploadProps) => {
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
      
      // Check if it's an Excel file and try to parse it
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        try {
          setIsParsingFile(true);
          const parsedData = await parsePaymentSchedule(selectedFile, debug);
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
      
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;

      // Get file name from file
      const name = file.name.split('.')[0];
      
      // Create description from extracted data or use filename
      let description = name;
      let month = "";
      let year = "";
      
      if (extractedData) {
        if (extractedData.dispensingMonth) {
          description = `Payment schedule for contractor ${extractedData.contractorCode || ''} - ${extractedData.dispensingMonth || ''}`;
          
          // Use the extracted month and year from the parsing function
          month = extractedData.month || "";
          year = extractedData.year ? extractedData.year.toString() : "";
        }
      }
      
      // Prepare data for storage
      const documentData = {
        user_id: userId,
        name,
        description,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        month,
        year: year ? parseInt(year) : new Date().getFullYear(),
        extracted_data: extractedData // Now properly saving the extracted data to the JSONB column
      };
      
      console.log("Inserting document with data:", documentData);
      
      // Save document metadata to database
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
      
      // Reset form
      setFile(null);
      setExtractedData(null);
      setParseSuccess(false);
      
      // Reset file input
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
