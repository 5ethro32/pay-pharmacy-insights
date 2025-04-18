
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-red-800 to-red-600 text-white">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Ready to Streamline Your Payment Management?</h2>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
          Join thousands of pharmacies using eSchedule to gain clarity on their financial performance and simplify payment management.
        </p>
        <div className="flex flex-col sm:flex-row justify-centre gap-4">
          <Button size="lg" className="bg-white text-red-800 hover:bg-gray-100 font-medium">
            Get Started
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
