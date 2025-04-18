
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { FileSpreadsheet, File, Trash2, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { downloadFile, formatFileSize } from "@/utils/documentUtils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DocumentListProps {
  userId: string | undefined;
  onUpdate?: () => void;
}

interface Document {
  id: string;
  name: string;
  description: string | null;
  file_path: string;
  file_type: string;
  file_size: number;
  month: string | null;
  year: number | null;
  uploaded_at: string;
}

const DocumentList = ({ userId, onUpdate }: DocumentListProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    fetchDocuments();
  }, [userId]);
  
  const fetchDocuments = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false });
      
      if (error) throw error;
      
      setDocuments(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching documents",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewDocument = async (document: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.file_path, 60);
      
      if (error) throw error;
      
      if (isMobile) {
        // On mobile, download the file directly instead of opening in new tab
        const response = await fetch(data.signedUrl);
        const blob = await response.blob();
        downloadFile(blob, document.name);
        
        toast({
          title: "Document download started",
          description: "The file will be available in your downloads shortly.",
        });
      } else {
        // On desktop, open in a new tab as before
        window.open(data.signedUrl, '_blank');
      }
    } catch (error: any) {
      toast({
        title: "Error opening document",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const openDeleteDialog = (document: Document) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;
    
    try {
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([documentToDelete.file_path]);
      
      if (storageError) throw storageError;
      
      // Delete document record from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentToDelete.id);
      
      if (dbError) throw dbError;
      
      // Update documents list
      setDocuments(documents.filter(doc => doc.id !== documentToDelete.id));
      
      toast({
        title: "Document deleted",
        description: "The document has been successfully deleted.",
      });
      
      // Call onUpdate callback if provided
      if (onUpdate) {
        onUpdate();
      }
    } catch (error: any) {
      toast({
        title: "Error deleting document",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };
  
  const getDocumentIcon = (fileType: string) => {
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
      return <FileSpreadsheet className="h-8 w-8 text-green-600" />;
    }
    return <File className="h-8 w-8 text-blue-600" />;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (loading) {
    return (
      <div className="h-40 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-800"></div>
      </div>
    );
  }
  
  if (documents.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No documents uploaded yet.</p>
      </div>
    );
  }
  
  return (
    <>
      <div className="space-y-4">
        {documents.map(document => (
          <Card key={document.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {getDocumentIcon(document.file_type)}
              </div>
              
              <div className="flex-grow min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                  <h3 className="text-base font-medium text-gray-800 truncate" title={document.name}>
                    {document.name}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {formatDate(document.uploaded_at)}
                  </span>
                </div>
                
                {document.description && (
                  <p className="text-sm text-gray-600 mt-1 break-words line-clamp-2">{document.description}</p>
                )}
                
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                  <span className="text-xs text-gray-500">{formatFileSize(document.file_size)}</span>
                  
                  {document.month && document.year && (
                    <span className="text-xs text-gray-500">
                      {document.month} {document.year}
                    </span>
                  )}
                </div>
                
                <div className="flex gap-2 mt-3">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleViewDocument(document)}
                    className="text-xs"
                  >
                    {isMobile ? "Download" : "View"}
                    {isMobile ? 
                      <ExternalLink className="h-3.5 w-3.5 ml-1" /> : 
                      null}
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => openDeleteDialog(document)}
                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the document.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDocument} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DocumentList;
