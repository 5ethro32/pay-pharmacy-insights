
import DocumentList from "./DocumentList";

interface DocumentsTabProps {
  userId: string;
  onUpdate: () => void;
}

const DocumentsTab = ({ userId, onUpdate }: DocumentsTabProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6 w-full">
      <h2 className="text-xl font-semibold mb-4">Document History</h2>
      <p className="text-gray-600 mb-4">
        View and manage your previously uploaded payment schedule documents.
      </p>
      <DocumentList userId={userId} onUpdate={onUpdate} />
    </div>
  );
};

export default DocumentsTab;

