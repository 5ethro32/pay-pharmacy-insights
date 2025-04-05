
import DocumentList from "./DocumentList";

interface DocumentsTabProps {
  userId: string;
  onUpdate: () => void;
}

const DocumentsTab = ({ userId, onUpdate }: DocumentsTabProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Your Documents</h2>
      <DocumentList userId={userId} onUpdate={onUpdate} />
    </div>
  );
};

export default DocumentsTab;
