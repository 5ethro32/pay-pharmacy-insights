
import { useState } from "react";
import DocumentUpload from "./DocumentUpload";

interface UploadTabProps {
  userId: string;
}

const UploadTab = ({ userId }: UploadTabProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Upload New Document</h2>
      <p className="text-gray-600 mb-4">
        Upload a new pharmacy payment schedule Excel file to analyze payment details and track changes over time.
        After uploading, you can view your analysis in the Dashboard tab.
      </p>
      <DocumentUpload userId={userId} />
    </div>
  );
};

export default UploadTab;
