
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Eye, Download, Trash2, FileIcon, Calendar } from "lucide-react";

interface Document {
  id: string;
  name: string;
  description: string;
  file_path: string;
  file_type: string;
  file_size: number;
  month: string;
  year: number;
  uploaded_at: string;
}

interface DocumentListProps {
  userId: string | undefined;
}

const DocumentList = ({ userId }: DocumentListProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!userId) return;
      
      try {
        // Use the any type to bypass TypeScript's type checking for Supabase tables
        const { data, error } = await supabase
          .from('documents' as any)
          .select('*')
          .order('uploaded_at', { ascending: false });
        
        if (error) throw error;
        
        // Convert to unknown first before casting to Document[] to address TypeScript error
        setDocuments((data as unknown) as Document[] || []);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to load documents",
          variant: "destructive",
        });
        console.error("Error fetching documents:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocuments();
  }, [userId]);
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  const handleDownload = async (document: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);
      
      if (error) throw error;
      
      // Create a download link
      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.name;
      window.document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
    } catch (error: any) {
      toast({
        title: "Download failed",
        description: error.message || "Failed to download document",
        variant: "destructive",
      });
    }
  };
  
  const handleDelete = async (id: string, filePath: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    
    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from('documents' as any)
        .delete()
        .eq('id', id);
      
      if (dbError) throw dbError;
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);
      
      if (storageError) throw storageError;
      
      // Update local state
      setDocuments(documents.filter(doc => doc.id !== id));
      
      toast({
        title: "Document deleted",
        description: "The document has been successfully deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete document",
        variant: "destructive",
      });
    }
  };
  
  if (loading) {
    return <div className="py-8 text-center">Loading documents...</div>;
  }
  
  if (documents.length === 0) {
    return (
      <div className="py-8 text-center">
        <FileIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">No documents</h3>
        <p className="mt-1 text-sm text-gray-500">
          Upload your first document using the form on the left.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {documents.map((document) => (
        <div
          key={document.id}
          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-lg">{document.name}</h3>
              
              {document.description && (
                <p className="text-sm text-gray-600 mt-1">{document.description}</p>
              )}
              
              <div className="flex items-center text-xs text-gray-500 mt-2 space-x-4">
                <span className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {document.month} {document.year}
                </span>
                <span>{formatFileSize(document.file_size)}</span>
                <span>
                  {new Date(document.uploaded_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(document)}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-800 hover:text-red-800"
                onClick={() => handleDelete(document.id, document.file_path)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentList;
