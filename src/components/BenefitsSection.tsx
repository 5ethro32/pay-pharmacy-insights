import { CheckCircle2 } from "lucide-react";

const benefits = [
  {
    title: "Enhanced Financial Visibility",
    description: "Gain a clear, comprehensive view of your payment schedule, helping you better understand your pharmacy's financial health.",
  },
  {
    title: "Time-Saving Analysis",
    description: "Quickly interpret complex payment data through intuitive visualisations instead of wading through spreadsheets.",
  },
  {
    title: "Informed Business Decisions",
    description: "Use trend analysis and service-specific breakdowns to identify growth opportunities and optimise operations.",
  },
  {
    title: "Error Identification",
    description: "Easily spot discrepancies or unexpected changes in your payment schedule with our alert system.",
  },
  {
    title: "Simplified Reconciliation",
    description: "Match payments received against expected amounts effortlessly with detailed payment breakdowns.",
  },
  {
    title: "Performance Tracking",
    description: "Monitor dispensing volumes and revenue streams over time to gauge your pharmacy's performance.",
  },
];

const BenefitsSection = () => {
  return (
    <section id="benefits" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">Why Choose Scriptly RX?</h2>
          <p className="text-lg text-gray-600">
            Our platform simplifies the complex pharmacy payment landscape, giving you the insights you need to thrive.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start mb-4">
                <CheckCircle2 className="h-5 w-5 mt-1 mr-2 text-red-600 flex-shrink-0" />
                <h3 className="text-xl font-semibold text-gray-900">{benefit.title}</h3>
              </div>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
