
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, ChevronUp } from 'lucide-react';

const DiagnosticTool: React.FC = () => {
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  
  // In a real app, we would use a store or context
  // For demo purposes, we'll just show placeholder data
  const selectedDocument = null;
  const allDocuments = [];
  
  return (
    <Card className="mb-4 bg-blue-50 border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">Data Diagnostic Tool</h3>
          <Button 
            variant="outline" 
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className="flex items-center gap-1"
          >
            {showDiagnostics ? (
              <>Hide Data <ChevronUp className="h-4 w-4 ml-1" /></>
            ) : (
              <>Show Data <ChevronDown className="h-4 w-4 ml-1" /></>
            )}
          </Button>
        </div>
        
        {showDiagnostics && (
          <div className="mt-4 space-y-4">
            <Separator />
            
            <div>
              <h4 className="font-semibold mb-2">Selected Document Data:</h4>
              {selectedDocument ? (
                <div className="max-h-[400px] overflow-auto p-3 bg-white rounded-md border border-gray-300">
                  <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(selectedDocument, null, 2)}</pre>
                </div>
              ) : (
                <p className="text-red-500">No document selected</p>
              )}
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Available Documents ({allDocuments.length}):</h4>
              <div className="max-h-[400px] overflow-auto p-3 bg-white rounded-md border border-gray-300">
                <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(allDocuments, null, 2)}</pre>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiagnosticTool;
