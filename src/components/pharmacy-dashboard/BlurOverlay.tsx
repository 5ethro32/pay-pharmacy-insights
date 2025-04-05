
import { Button } from "@/components/ui/button";

interface BlurOverlayProps {
  handleSignUpPrompt: () => void;
}

const BlurOverlay = ({ handleSignUpPrompt }: BlurOverlayProps) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="p-8 bg-white rounded-lg shadow-xl text-center z-10">
        <h3 className="text-2xl font-bold text-red-800 mb-4">Preview Limited</h3>
        <p className="text-gray-600 mb-6">Sign up to access the full dashboard with all your pharmacy data</p>
        <Button 
          onClick={handleSignUpPrompt}
          className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded shadow"
        >
          Sign Up for Full Access
        </Button>
      </div>
    </div>
  );
};

export default BlurOverlay;
