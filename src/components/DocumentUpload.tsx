
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";

interface DocumentUploadProps {
  userId: string | undefined;
}

const DocumentUpload = ({ userId }: DocumentUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [uploading, setUploading] = useState(false);
  
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Auto-fill the name if not provided
      if (!name) {
        setName(selectedFile.name.split('.')[0]);
      }
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !userId || !name || !month || !year) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and select a file.",
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
      
      // Save document metadata to database
      const { error: insertError } = await supabase
        .from('documents')
        .insert({
          user_id: userId,
          name,
          description,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          month,
          year: parseInt(year),
        });
      
      if (insertError) throw insertError;
      
      toast({
        title: "Document uploaded",
        description: "Your document has been successfully uploaded.",
      });
      
      // Reset form
      setFile(null);
      setName("");
      setDescription("");
      setMonth("");
      setYear("");
      
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
        <label className="text-sm font-medium">Document File</label>
        <Input
          id="file-upload"
          type="file"
          onChange={handleFileChange}
          disabled={uploading}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
        />
        {file && (
          <p className="text-xs text-gray-500">
            {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Document Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Payment Schedule"
          disabled={uploading}
          required
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Monthly payment schedule for..."
          disabled={uploading}
          rows={2}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Month</label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={uploading}
            required
          >
            <option value="">Select Month</option>
            {months.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Year</label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={uploading}
            required
          >
            <option value="">Select Year</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>
      
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
