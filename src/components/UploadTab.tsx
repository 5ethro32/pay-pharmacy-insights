
import { useState, useEffect } from "react";
import DocumentUpload from "./DocumentUpload";

interface UploadTabProps {
  userId: string;
}

const UploadTab = ({ userId }: UploadTabProps) => {
  const [debugMode, setDebugMode] = useState(false);
  
  // Allow enabling debug mode with Shift+D key combination
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'D') {
        setDebugMode(prev => {
          const newValue = !prev;
          console.log(`Debug mode ${newValue ? 'enabled' : 'disabled'}`);
          return newValue;
        });
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Upload New Document</h2>
      <p className="text-gray-600 mb-4">
        Upload a new pharmacy payment schedule Excel file to analyze payment details and track changes over time.
        After uploading, you can view your analysis in the Dashboard tab.
      </p>
      <DocumentUpload userId={userId} debug={debugMode} />
      
      {debugMode && (
        <div className="mt-8 p-4 border border-amber-300 bg-amber-50 rounded-md">
          <h3 className="text-lg font-medium text-amber-800 mb-2">Debug Mode</h3>
          <p className="text-amber-700 text-sm mb-2">Press Shift+D to toggle debug mode.</p>
          <p className="text-sm text-amber-700 mb-2">
            The system will now log extra information about Pharmacy First data extraction to help troubleshoot issues.
            Check the browser console (F12) for detailed logs.
          </p>
          <div className="text-xs text-amber-600">
            <p>Looking for PFS data in the following sheet names:</p>
            <ul className="list-disc ml-4 mt-1">
              <li>NHS PFS Payment Calculation</li>
              <li>PFS Payment Calculation</li>
              <li>NHS Pharmacy First Scotland</li>
              <li>Pharmacy First Scotland</li>
              <li>or any sheet containing "PFS", "Pharmacy First", or "Payment Calculation"</li>
            </ul>
            <p className="mt-2">Expected data structure:</p>
            <ul className="list-disc ml-4 mt-1">
              <li>Looking for a header row with "PFS Information Description" and "Value" columns</li>
              <li>Reading data from rows below the headers</li>
              <li>Expecting descriptions in column B and values in column D</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadTab;
