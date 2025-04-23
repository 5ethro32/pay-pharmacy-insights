import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, Check } from "lucide-react";

interface FileUploaderProps {
  onUpload: (file: File) => void;
  showButton?: boolean;
  buttonText?: string;
}

const FileUploader = ({ onUpload, showButton = true, buttonText = "Upload Document" }: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileSize, setFileSize] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    setSelectedFile(file);
    setFileSize((file.size / (1024 * 1024)).toFixed(2)); // Convert to MB
    onUpload(file);
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-red-400"
        } ${selectedFile ? "border-green-400 bg-green-50" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {!selectedFile ? (
          <div className="flex flex-col items-center space-y-4 cursor-pointer">
            <div className="p-3 bg-red-50 rounded-full">
              <Upload className="w-8 h-8 text-red-700" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-800">Drag & drop a file or click to browse</p>
              <p className="text-sm text-gray-500 mt-1">Support for PDF, Word, Excel, and CSV files</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <div className="p-2 bg-green-100 rounded-full">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-700">File selected successfully</p>
            </div>
          </div>
        )}
      </div>
      
      {selectedFile && (
        <div className="mt-3 bg-gray-50 p-3 rounded-md">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="h-5 w-5 text-red-700" />
            <div className="flex-1">
              <p className="font-medium text-gray-800 truncate">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{fileSize} MB</p>
            </div>
            {selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls') ? (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center">
                <Check className="h-3 w-3 mr-1" /> Payment schedule detected
              </span>
            ) : null}
          </div>
        </div>
      )}
      
      {selectedFile && (
        <Button 
          className="w-full mt-4 bg-green-700 hover:bg-green-600"
          onClick={() => fileInputRef.current?.click()}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Change File
        </Button>
      )}
      
      {showButton && !selectedFile && (
        <Button 
          className="w-full mt-4 bg-red-800 hover:bg-red-700"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
      />
    </div>
  );
};

export default FileUploader;
