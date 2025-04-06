
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import DocumentList from "./DocumentList";

interface DocumentsTabProps {
  userId: string;
  onUpdate?: () => void;
}

const DocumentsTab = ({ userId, onUpdate }: DocumentsTabProps) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  
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
        .order('created_at', { ascending: false });
      
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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    
    try {
      setDeleting(id);
      
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Document deleted",
        description: "The document has been successfully deleted.",
      });
      
      setDocuments(documents.filter(doc => doc.id !== id));
      
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
      setDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getRelativeTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  return (
    <Card className="bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-gray-800">Document History</CardTitle>
        <p className="text-gray-600 mt-1">View and manage your previously uploaded payment schedule documents.</p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-60 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
          </div>
        ) : documents.length > 0 ? (
          <div className="space-y-6">
            {documents.map((doc) => (
              <div key={doc.id} className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:border-red-200 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <FileText className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-gray-900">{doc.title || `Payment Schedule ${doc.contractor_code} ${doc.month} ${doc.year}`}</h4>
                      <p className="text-gray-700 mt-1">{`Payment schedule for contractor ${doc.contractor_code} - ${doc.month.toUpperCase()} ${doc.year}`}</p>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-sm text-gray-500">
                        <div>{doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : ''}</div>
                        <div className="uppercase">{doc.month} {doc.year}</div>
                        <div title={formatDate(doc.created_at)}>{getRelativeTime(doc.created_at)}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center gap-2 sm:gap-3 sm:self-center mt-3 sm:mt-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-gray-200 hover:bg-gray-50 w-full"
                    >
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 w-full"
                      disabled={deleting === doc.id}
                      onClick={() => handleDelete(doc.id)}
                    >
                      {deleting === doc.id ? (
                        <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-red-800 rounded-full"></div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-60 flex flex-col items-center justify-center">
            <FileText className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No documents uploaded yet</h3>
            <p className="text-gray-500 mb-6">Upload your first payment schedule document to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentsTab;
