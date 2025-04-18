
import { Button } from "@/components/ui/button";
import { ChevronRight, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-white py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 mb-8 lg:mb-0 lg:pr-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 leading-tight mb-4">
              Simplify Your <span className="text-red-700 bg-gradient-to-r from-red-800 to-red-600 bg-clip-text text-transparent">Pharmacy Payments</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
              The complete solution for tracking, visualising, and managing your monthly payment schedules for prescriptions and services with ease and precision.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 text-white font-medium px-6">
                Get Started
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="lg:w-1/2 relative">
            {/* Dashboard Mini Preview Card */}
            <div className="bg-white shadow-lg rounded-lg p-4 border border-gray-100 transform rotate-1 animate-fade-in opacity-0" style={{ animationDelay: '0.3s' }}>
              {/* Pharmacy Header */}
              <div className="bg-gradient-to-r from-red-900/90 to-red-700 text-white p-3 rounded-md mb-3">
                <div className="flex justify-between items-center">
                  <div className="font-medium">Your Schedule Dashboard</div>
                  <div className="text-sm">JANUARY 2025</div>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-white p-2 rounded-md border border-gray-100">
                  <div className="text-xs text-gray-500">Total Items</div>
                  <div className="flex items-center">
                    <div className="font-bold text-gray-900">9,868</div>
                    <div className="ml-1 text-red-500 text-xs flex items-center">
                      <ArrowDown className="h-3 w-3" />
                      1.2%
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">Excluding stock orders</div>
                </div>
                <div className="bg-white p-2 rounded-md border border-gray-100">
                  <div className="text-xs text-gray-500">Gross Ingredient Cost</div>
                  <div className="flex items-center">
                    <div className="font-bold text-gray-900">£101,708</div>
                    <div className="ml-1 text-emerald-500 text-xs flex items-center">
                      <ArrowUp className="h-3 w-3" />
                      3.5%
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">Total before deductions</div>
                </div>
                <div className="bg-white p-2 rounded-md border border-gray-100">
                  <div className="text-xs text-gray-500">Value per Item</div>
                  <div className="font-bold text-gray-900">£10.19</div>
                  <div className="text-xs text-gray-400">Average cost per item</div>
                </div>
              </div>
              
              {/* AI Insights Panel */}
              <div className="mb-3">
                <div className="bg-gradient-to-r from-red-900 to-red-700 text-white p-2 rounded-t-md flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span className="text-sm font-medium">AI Insights & Analysis</span>
                </div>
                <div className="bg-green-50 p-2 rounded-b-md border border-green-100">
                  <div className="flex items-start mb-2">
                    <ArrowUp className="h-3 w-3 text-green-500 mt-0.5 mr-1" />
                    <div className="text-xs text-gray-700">
                      <span className="font-medium">Payment Growth Outpacing Volume</span>
                      <p className="text-xs text-gray-600">
                        Your net payments increased by 4.1% while volume decreased by 1.2%.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <ArrowUp className="h-3 w-3 text-green-500 mt-0.5 mr-1" />
                    <div className="text-xs text-gray-700">
                      <span className="font-medium">Service Payment Growth</span>
                      <p className="text-xs text-gray-600">
                        Pharmacy First service payments up 28% vs last quarter.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Second Card */}
            <div className="bg-white shadow-lg rounded-lg p-3 border border-gray-100 transform -rotate-2 absolute top-10 right-0 -mr-2 animate-fade-in opacity-0" style={{ animationDelay: '0.6s' }}>
              <div className="bg-amber-50 p-3 rounded-md flex items-center gap-2 border border-amber-200">
                <Badge variant="default" className="bg-amber-600 hover:bg-amber-500">NEW</Badge>
                <div className="text-amber-800 font-medium">Payment Alert: +4.1%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
