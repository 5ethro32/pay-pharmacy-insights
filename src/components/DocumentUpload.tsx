
import { useState } from "react";
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

// Core parsing function to extract data from Excel
async function parsePaymentSchedule(file: File) {
  // Read the Excel file
  const fileData = await file.arrayBuffer();
  const workbook = XLSX.read(fileData, {
    cellStyles: true, cellDates: true, cellNF: true
  });
  
  // Check if required sheets exist
  const sheets = workbook.SheetNames;
  if (!sheets.includes("Pharmacy Details") || !sheets.includes("Community Pharmacy Payment Summ")) {
    throw new Error("Required sheets not found in the Excel file");
  }
  
  // Extract from Pharmacy Details sheet
  const detailsSheet = workbook.Sheets["Pharmacy Details"];
  const details = XLSX.utils.sheet_to_json(detailsSheet, {header: 1}) as any[][];
  
  // Get basic information
  const data: any = {
    contractorCode: findValueByLabel(details, "CONTRACTOR CODE"),
    dispensingMonth: findValueByLabel(details, "DISPENSING MONTH"),
    netPayment: findValueByLabel(details, "NET PAYMENT TO BANK")
  };
  
  // Extract from Payment Summary sheet
  const summarySheet = workbook.Sheets["Community Pharmacy Payment Summ"];
  const summary = XLSX.utils.sheet_to_json(summarySheet, {header: 1}) as any[][];
  
  // Find item counts row and extract data
  data.itemCounts = {
    total: findValueInRow(summary, "Total No Of Items", 3),
    ams: findValueInRow(summary, "Total No Of Items", 5),
    mcr: findValueInRow(summary, "Total No Of Items", 6),
    nhsPfs: findValueInRow(summary, "Total No Of Items", 7),
    cpus: findValueInRow(summary, "Total No Of Items", 9)
  };
  
  // Get financial data
  data.financials = {
    grossIngredientCost: findValueInRow(summary, "Total Gross Ingredient Cost", 3),
    netIngredientCost: findValueInRow(summary, "Total Net Ingredient Cost", 5),
    dispensingPool: findValueInRow(summary, "Dispensing Pool Payment", 3),
    establishmentPayment: findValueInRow(summary, "Establishment Payment", 3)
  };
  
  return data;
}

const DocumentUpload = ({ userId }: DocumentUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [parseSuccess, setParseSuccess] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Check if it's an Excel file and try to parse it
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
          
          // Extract month and year from dispensing month
          const parts = extractedData.dispensingMonth.toString().split(' ');
          if (parts.length >= 2) {
            month = parts[0];
            year = parts[1];
          }
        }
      }
      
      // Prepare data for storage
      const documentData: any = {
        user_id: userId,
        name,
        description,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        month,
        year: year ? parseInt(year) : new Date().getFullYear(),
      };
      
      // If we have extracted data, include it
      if (extractedData) {
        documentData.extracted_data = extractedData;
      }
      
      // Save document metadata to database
      const { error: insertError } = await supabase
        .from('documents' as any)
        .insert(documentData);
      
      if (insertError) throw insertError;
      
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
      <div className="space-y-2">
        <label className="text-sm font-medium">Upload Payment Schedule</label>
        <Input
          id="file-upload"
          type="file"
          onChange={handleFileChange}
          disabled={uploading || isParsingFile}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
        />
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
      </div>
      
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
              <span className="font-medium">Month:</span> {extractedData.dispensingMonth}
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
