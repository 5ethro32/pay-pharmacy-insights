
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PlanFeature {
  text: string;
}

interface PricingCardProps {
  title: string;
  description: string;
  price: string;
  period: string;
  features: PlanFeature[];
  buttonText: string;
  onButtonClick: () => void;
  popular?: boolean;
  current?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  description,
  price,
  period,
  features,
  buttonText,
  onButtonClick,
  popular = false,
  current = false
}) => {
  return (
    <Card className={`relative h-full flex flex-col ${popular ? 'border-2 border-red-700 shadow-lg' : 'border border-gray-200'}`}>
      {popular && (
        <div className="absolute -top-3 right-6 bg-red-700 text-white px-4 py-1 text-xs font-bold uppercase rounded-full">
          Popular
        </div>
      )}
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-bold mb-2">{title}</CardTitle>
        <p className="text-gray-500 text-sm">{description}</p>
        <div className="mt-4">
          <span className="text-4xl font-bold">£{price}</span>
          <span className="text-gray-500 ml-1">{period}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-emerald-500 mr-2 shrink-0 mt-0.5" />
              <span className="text-gray-700">{feature.text}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-4">
        <Button 
          onClick={onButtonClick}
          className={`w-full ${current 
            ? 'bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-default' 
            : 'bg-red-700 hover:bg-red-800 text-white'}`}
          variant={current ? "outline" : "default"}
          disabled={current}
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PricingCard;
