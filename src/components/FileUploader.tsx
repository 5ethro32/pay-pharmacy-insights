
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface FileUploaderProps {
  onUpload: (file: File) => void;
  showButton?: boolean;
  buttonText?: string;
}

const FileUploader = ({ onUpload, showButton = true, buttonText = "Upload Document" }: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
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
      onUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUpload(files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-red-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center space-y-4 cursor-pointer">
          <div className="p-3 bg-red-50 rounded-full">
            <Upload className="w-8 h-8 text-red-700" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-800">Drag & drop a file or click to browse</p>
            <p className="text-sm text-gray-500 mt-1">Support for PDF, Word, Excel, and CSV files</p>
          </div>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
      />
      {showButton && (
        <Button 
          className="w-full mt-4 bg-red-800 hover:bg-red-700"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      )}
    </div>
  );
};

export default FileUploader;
