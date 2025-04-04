
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-white py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 mb-8 lg:mb-0 lg:pr-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 leading-tight mb-4">
              Simplify Your <span className="text-pharmacy-primary">Pharmacy Payments</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
              The complete solution for tracking, visualizing, and managing your monthly payment schedules for prescriptions and services with ease and precision.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-pharmacy-primary hover:bg-pharmacy-dark text-white font-medium px-6">
                Get Started
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-pharmacy-primary text-pharmacy-primary hover:text-pharmacy-dark hover:border-pharmacy-dark">
                Watch Demo
              </Button>
            </div>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="bg-white shadow-lg rounded-lg p-4 border border-gray-100 transform rotate-1 animate-fade-in opacity-0" style={{ animationDelay: '0.3s' }}>
              <div className="bg-pharmacy-light p-4 rounded-md mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium text-pharmacy-dark">Pharmacy #1737</div>
                  <div className="text-sm text-gray-500">JANUARY 2025</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">Total Items:</div>
                  <div className="font-bold text-pharmacy-primary">9,868</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-500">Total GIC:</div>
                  <div className="font-bold text-gray-900">£101,708.89</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-500">Avg. per Item:</div>
                  <div className="font-bold text-gray-900">£10.19</div>
                </div>
              </div>
              <div className="h-24 bg-gradient-to-r from-pharmacy-primary to-pharmacy-secondary rounded-md flex items-center justify-center">
                <div className="text-white font-bold">Payment Visualization</div>
              </div>
            </div>
            <div className="bg-white shadow-lg rounded-lg p-4 border border-gray-100 transform -rotate-2 absolute top-10 right-0 -mr-4 animate-fade-in opacity-0" style={{ animationDelay: '0.6s' }}>
              <div className="h-16 bg-pharmacy-secondary/20 rounded-md flex items-center justify-center">
                <div className="text-pharmacy-secondary font-bold">Net Payment: £126,774.45</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
