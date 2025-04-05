
import DocumentUpload from "./DocumentUpload";

interface UploadTabProps {
  userId: string;
}

const UploadTab = ({ userId }: UploadTabProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
      <DocumentUpload userId={userId} />
    </div>
  );
};

export default UploadTab;
