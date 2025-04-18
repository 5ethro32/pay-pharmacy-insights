
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, Check, AlertCircle, FileUp } from "lucide-react";

interface DemoUploaderProps {
  onFileUploaded: () => void;
}

const DemoUploader = ({ onFileUploaded }: DemoUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    // Check if the file is an Excel file
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setUploadError("Please upload an Excel file (.xlsx or .xls)");
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    // Simulate uploading process
    setTimeout(() => {
      setIsUploading(false);
      onFileUploaded();
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div
        className={`w-full border-3 border-dashed rounded-lg p-10 text-center ${
          isDragging ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-red-400 hover:bg-red-50"
        } transition-all duration-200 cursor-pointer`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-upload")?.click()}
      >
        <div className="flex flex-col items-center space-y-4">
          {isUploading ? (
            <>
              <div className="w-16 h-16 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin"></div>
              <p className="text-lg font-medium text-gray-700">Uploading your file...</p>
              <p className="text-sm text-gray-500">This will only take a moment</p>
            </>
          ) : (
            <>
              <div className="bg-red-100 p-4 rounded-full">
                <FileUp className="h-12 w-12 text-red-700" />
              </div>
              <div>
                <p className="text-xl font-medium text-gray-800">Upload your payment schedule</p>
                <p className="text-base text-gray-600 mt-1">Drag and drop or click to browse</p>
              </div>
              <Button className="bg-gradient-to-r from-red-900 to-red-700">
                <Upload className="mr-2 h-4 w-4" /> Select Excel File
              </Button>
              <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-md">
                <FileSpreadsheet className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-600">Excel files only (.xlsx, .xls)</span>
              </div>
            </>
          )}
        </div>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>

      {uploadError && (
        <div className="flex items-center space-x-2 text-rose-600 bg-rose-50 px-4 py-3 rounded-md w-full">
          <AlertCircle className="h-5 w-5" />
          <span>{uploadError}</span>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-100 p-6 rounded-md w-full">
        <h3 className="font-medium text-blue-800 mb-2 flex items-center text-lg">
          <Check className="h-5 w-5 text-blue-600 mr-2" />
          No File to Upload?
        </h3>
        <p className="text-blue-700 mb-3">
          Don't worry! You can explore our platform with pre-loaded sample data to see how it works.
        </p>
        <p className="text-sm text-blue-600">
          Simply click the "Dashboard Preview" tab to see our demo visualizations.
        </p>
      </div>
    </div>
  );
};

export default DemoUploader;
