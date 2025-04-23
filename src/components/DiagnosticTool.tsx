
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { PaymentData } from '@/types/paymentTypes';

interface DiagnosticToolProps {
  selectedDocument: PaymentData | null;
  allDocuments: PaymentData[];
}

const DiagnosticTool: React.FC<DiagnosticToolProps> = ({ selectedDocument, allDocuments }) => {
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  
  return (
    <Card className="p-4 mb-4 bg-blue-50 border-l-4 border-blue-500">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Data Diagnostic Tool</h2>
        <Button 
          variant="default" 
          onClick={() => setShowDiagnostics(!showDiagnostics)}
        >
          {showDiagnostics ? 'Hide Data' : 'Show Data'}
        </Button>
      </div>
      
      <Collapsible open={showDiagnostics}>
        <CollapsibleContent>
          <Separator className="my-4" />
          
          <h3 className="font-semibold mt-4 mb-2">
            Selected Document Data:
          </h3>
          
          {selectedDocument ? (
            <div className="max-h-96 overflow-auto my-2 p-4 bg-white rounded border border-gray-300">
              <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(selectedDocument, null, 2)}</pre>
            </div>
          ) : (
            <p className="text-red-500">No document selected</p>
          )}
          
          <h3 className="font-semibold mt-4 mb-2">
            Available Documents ({allDocuments.length}):
          </h3>
          
          <div className="max-h-96 overflow-auto my-2 p-4 bg-white rounded border border-gray-300">
            <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(allDocuments, null, 2)}</pre>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default DiagnosticTool;
