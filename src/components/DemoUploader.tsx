
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, Check, AlertCircle } from "lucide-react";

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
    <div className="flex flex-col items-center space-y-4">
      <div
        className={`w-full border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-red-400 hover:bg-gray-50"
        } transition-colors duration-150 cursor-pointer`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-upload")?.click()}
      >
        <div className="flex flex-col items-center space-y-3">
          {isUploading ? (
            <>
              <div className="w-16 h-16 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin"></div>
              <p className="text-gray-600 font-medium">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-700">Drag and drop your file here</p>
                <p className="text-sm text-gray-500 mt-1">or click to browse</p>
              </div>
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
        <div className="flex items-center space-x-2 text-rose-600 bg-rose-50 px-4 py-2 rounded-md w-full">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">{uploadError}</span>
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-md w-full">
        <h3 className="font-medium text-gray-800 mb-2 flex items-center">
          <Check className="h-5 w-5 text-green-600 mr-2" />
          Demo Data Ready
        </h3>
        <p className="text-sm text-gray-600">
          If you don't have your own payment schedule file to upload, you can explore the demo with our pre-loaded sample data.
        </p>
      </div>
    </div>
  );
};

export default DemoUploader;
