
import React from 'react';
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import PricingCard from "@/components/PricingCard";
import { useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";

const PremiumPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleReturn = () => {
    navigate('/dashboard');
  };
  
  const handleUpgrade = (plan: string) => {
    toast({
      title: "Upgrade requested",
      description: `Your upgrade request to the ${plan} plan has been submitted. Our team will contact you shortly.`,
    });
    setTimeout(() => navigate('/dashboard'), 2000);
  };
  
  const handleContactSales = () => {
    toast({
      title: "Sales team contact",
      description: "Our sales team has been notified and will reach out to you soon.",
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleReturn}
            className="text-red-800 hover:text-red-700 hover:bg-red-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-gray-600 text-lg">
            Select the plan that best fits your needs. Upgrade anytime to access more features and 
            enhance your pharmacy analytics experience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <PricingCard
            title="Free"
            description="Basic pharmacy analytics"
            price="0"
            period="/month"
            features={[
              { text: "Basic dashboard access" },
              { text: "Monthly payment summaries" },
              { text: "Limited document storage" },
              { text: "Basic prescription analytics" },
              { text: "Email support" }
            ]}
            buttonText="Current Plan"
            onButtonClick={() => {}}
            current={true}
          />
          
          <PricingCard
            title="Premium"
            description="Enhanced analytics and features"
            price="9.99"
            period="/month"
            features={[
              { text: "Everything in Free plan" },
              { text: "Advanced payment analytics" },
              { text: "Unlimited document storage" },
              { text: "Group & peer comparisons" },
              { text: "Financial breakdown reports" },
              { text: "Priority email support" }
            ]}
            buttonText="Upgrade to Premium"
            onButtonClick={() => handleUpgrade('Premium')}
            popular={true}
          />
          
          <PricingCard
            title="Pro"
            description="Complete pharmacy management solution"
            price="49.99"
            period="/month"
            features={[
              { text: "Everything in Premium plan" },
              { text: "Advanced forecasting tools" },
              { text: "Custom reporting" },
              { text: "API access" },
              { text: "Dedicated account manager" },
              { text: "24/7 priority support" },
              { text: "Unlimited users" }
            ]}
            buttonText="Upgrade to Pro"
            onButtonClick={() => handleUpgrade('Pro')}
          />
        </div>
        
        <div className="text-center max-w-lg mx-auto">
          <p className="text-gray-600 mb-4">
            Need help choosing the right plan? Contact our sales team.
          </p>
          <Button 
            variant="outline" 
            className="border-red-700 text-red-700 hover:bg-red-50"
            onClick={handleContactSales}
          >
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PremiumPage;
