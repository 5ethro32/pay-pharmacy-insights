import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader2, Upload, File, X, CheckCircle } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface DocumentUploadProps {
  userId: string;
  onSuccess?: () => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ userId, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  const resetUpload = () => {
    setFile(null);
    setUploadSuccess(false);
  };
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    maxSize: 10485760, // 10MB
  });
  
  // Function to extract high value items from the workbook
  const extractHighValueItems = (workbook: XLSX.WorkBook) => {
    const sheet = workbook.Sheets["High Value"];
    if (!sheet) return { items: [], totalValue: 0, itemCount: 0 };
    
    // Convert to JSON with headers
    const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    // Find the actual data rows (skip headers)
    let dataStartRow = 0;
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      // Type-guard to ensure row is an array before using array methods
      if (row && Array.isArray(row) && (row as any[]).some((cell: any) => 
        typeof cell === 'string' && 
        (cell.includes("Item") || cell.includes("Description") || cell.includes("Value"))
      )) {
        dataStartRow = i + 1;
        break;
      }
    }
    
    // Extract data rows
    const highValueItems: any[] = [];
    let totalValue = 0;
    
    for (let i = dataStartRow; i < rawData.length; i++) {
      const row = rawData[i] as any[];
      
      // Skip empty rows or rows with insufficient data
      if (!row || !Array.isArray(row) || row.length < 3) continue;
      if (!row[1] || !row[2]) continue; // Skip if missing key data
      
      // Find the price column (typically contains values over 200)
      // Usually in column index 3, 4, or 5
      let priceCol = -1;
      for (let j = 3; j < 6; j++) {
        if (typeof row[j] === 'number' && row[j] > 200) {
          priceCol = j;
          break;
        }
      }
      
      if (priceCol === -1) continue; // Skip if no high value found
      
      // Extract item data
      const item = {
        description: String(row[1]), // Item description is typically in column B
        formStrength: row[2] ? String(row[2]) : "", // Form/strength typically in column C
        quantity: typeof row[priceCol-1] === 'number' ? row[priceCol-1] : 0, // Quantity usually before price
        price: row[priceCol],
        // Date may be in the last column
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
  };
  
  // Function to extract processing errors from the workbook
  const extractProcessingErrors = (workbook: XLSX.WorkBook) => {
    const sheet = workbook.Sheets["Processing Error Breakdown"];
    if (!sheet) return { errors: [], netAdjustment: 0, errorCount: 0 };
    
    // Convert to JSON with headers
    const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    // Find the data start row (after headers)
    let dataStartRow = 0;
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      // Look for header row with type guard
      if (row && Array.isArray(row) && (row as any[]).some((cell: any) => 
        typeof cell === 'string' && 
        (cell.includes("Original") || cell.includes("Paid") || cell.includes("Adjustment"))
      )) {
        dataStartRow = i + 1;
        break;
      }
    }
    
    // Extract data rows
    const processingErrors: any[] = [];
    let netAdjustment = 0;
    
    for (let i = dataStartRow; i < rawData.length; i++) {
      const row = rawData[i] as any[];
      // Skip empty rows or rows with insufficient data
      if (!row || !Array.isArray(row) || row.length < 5) continue;
      if (!row[1]) continue; // Skip if missing description
      
      // Find the numerical columns
      let originalPaidCol = -1;
      let shouldHavePaidCol = -1;
      let adjustmentCol = -1;
      
      // Usually these are sequential columns
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
        continue; // Skip if we can't find all required columns
      }
      
      // Extract error data
      const error = {
        description: String(row[1]),
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
  };
  
  function findValueInRow(data: any[][], label: string, column: number): number {
    for (const row of data) {
      if (Array.isArray(row) && row[0] === label) {
        const value = row[column];
        if (typeof value === 'number') {
          return value;
        } else if (typeof value === 'string') {
          const parsedValue = parseFloat(value.replace(/,/g, ''));
          return isNaN(parsedValue) ? 0 : parsedValue;
        }
      }
    }
    return 0;
  }
  
  async function parsePaymentSchedule(file: File): Promise<any> {
    const data: any = {};
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Sheet names
    const summarySheet = workbook.SheetNames.find(name => 
      name.includes("Summary") || name.includes("Overview")
    );
    
    if (!summarySheet) {
      throw new Error("Could not locate a summary sheet in the document");
    }
    
    const summary = XLSX.utils.sheet_to_json(workbook.Sheets[summarySheet], {
      header: 1,
      blankrows: false
    }) as any[][];
    
    const monthYearRow = summary.find(row => 
      row && Array.isArray(row) && row[0] && 
      typeof row[0] === 'string' && 
      (row[0].includes("Schedule") || row[0].includes("Month"))
    );
    
    if (monthYearRow) {
      const monthYearText = monthYearRow[0];
      const monthMatch = monthYearText.match(/(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)/i);
      const yearMatch = monthYearText.match(/\b(20\d{2})\b/);
      
      if (monthMatch && yearMatch) {
        data.month = monthMatch[0].toUpperCase();
        data.year = parseInt(yearMatch[0]);
        data.dispensingMonth = monthYearText;
      }
    }
    
    // Extract other data points
    data.id = uuidv4();
    data.contractorCode = findValueInRow(summary, "Contractor No.", 4);
    data.totalItems = findValueInRow(summary, "Total No Of Items", 4);
    data.netPayment = findValueInRow(summary, "Net Schedule Total", 4);
    
    // Extract item counts
    data.itemCounts = {
      total: findValueInRow(summary, "Total No Of Items", 4),
      ams: findValueInRow(summary, "Total No Of Items", 5),
      mcr: findValueInRow(summary, "Total No Of Items", 6),
      nhsPfs: findValueInRow(summary, "Total No Of Items", 7),
      cpus: findValueInRow(summary, "Total No Of Items", 9),
      other: findValueInRow(summary, "Total No Of Items", 11) || 0 // Ensure other is included
    };
    
    // Extract financial data
    data.financials = {
      grossIngredientCost: findValueInRow(summary, "Gross Ingredient Cost", 4),
      netIngredientCost: findValueInRow(summary, "Net Ingredient Cost", 4),
      dispensingPool: findValueInRow(summary, "Dispensing Pool", 4),
      establishmentPayment: findValueInRow(summary, "Establishment Payment", 4),
      pharmacyFirstBase: findValueInRow(summary, "Pharmacy First Base", 4),
      pharmacyFirstActivity: findValueInRow(summary, "Pharmacy First Activity", 4),
      averageGrossValue: findValueInRow(summary, "Average Gross Value", 4),
      supplementaryPayments: findValueInRow(summary, "Supplementary Payments", 4)
    };
    
    // Extract high value items and processing errors
    data.highValueItems = extractHighValueItems(workbook);
    data.processingErrors = extractProcessingErrors(workbook);
    
    console.log("Extracted payment data:", data);
    return data;
  }
  
  const handleUpload = async () => {
    if (!file || !userId) return;
    
    try {
      setUploading(true);
      
      // Parse the Excel file
      const paymentData = await parsePaymentSchedule(file);
      
      // Upload to Supabase
      const filePath = `${userId}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('schedules')
        .upload(filePath, file);
      
      if (uploadError) {
        throw new Error(`Error uploading file: ${uploadError.message}`);
      }
      
      // Insert document record
      const { error: insertError } = await supabase
        .from('documents')
        .insert({
          user_id: userId,
          file_path: filePath,
          name: file.name,
          file_type: file.type,
          file_size: file.size,
          extracted_data: paymentData,
          month: paymentData.month,
          year: paymentData.year
        });
      
      if (insertError) {
        throw new Error(`Error saving document: ${insertError.message}`);
      }
      
      // Success
      setUploadSuccess(true);
      toast({
        title: "Upload Successful",
        description: "Your payment schedule has been processed.",
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-md">
      <div
        {...getRootProps()}
        className="flex flex-col items-center justify-center w-full h-48 cursor-pointer"
      >
        <input {...getInputProps()} />
        {uploadSuccess ? (
          <div className="flex flex-col items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-500 mb-2" />
            <p className="text-gray-500">File uploaded successfully!</p>
          </div>
        ) : file ? (
          <div className="flex items-center space-x-2">
            <File className="h-5 w-5 text-gray-500" />
            <p className="text-gray-700">{file.name}</p>
            <Button variant="ghost" size="icon" onClick={resetUpload}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <Upload className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-gray-500">
              {isDragActive
                ? "Drop the file here..."
                : "Drag 'n' drop an Excel file here, or click to select file"}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              (Only *.xls and *.xlsx files will be accepted)
            </p>
          </div>
        )}
      </div>
      {file && !uploadSuccess && (
        <Button
          onClick={handleUpload}
          disabled={uploading}
          className="mt-4"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            "Upload"
          )}
        </Button>
      )}
    </div>
  );
};

export default DocumentUpload;
