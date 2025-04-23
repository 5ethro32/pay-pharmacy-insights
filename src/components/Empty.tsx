import { Upload, Sparkles, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function EmptyInsights() {
  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-red-900/90 to-red-700 text-white p-6">
        <h3 className="flex items-center text-xl font-semibold">
          <Sparkles className="mr-2 h-5 w-5" />
          AI Insights Coming Soon
        </h3>
      </div>
      <CardContent className="p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex items-center justify-center w-20 h-20 mb-6 bg-red-50 rounded-full">
            <BarChart3 className="h-10 w-10 text-red-700" />
          </div>
          
          <h4 className="text-xl font-medium mb-3">Unlock powerful AI insights</h4>
          
          <p className="text-muted-foreground mb-6 max-w-md">
            We're building a dynamic dashboard to showcase your AI insights, performance ratings, and peer comparisons 
            in an interactive, color-coded view.
          </p>
          
          <Button variant="outline" className="mb-8" disabled>
            <Upload className="mr-2 h-4 w-4" />
            Upload schedule data
          </Button>
          
          <div className="flex justify-center space-x-8 mt-4 animate-pulse">
            <div className="flex flex-col items-center">
              <Sparkles className="h-6 w-6 text-rose-600 mb-2" />
              <span className="text-xs text-muted-foreground">Performance</span>
            </div>
            <div className="flex flex-col items-center">
              <Sparkles className="h-6 w-6 text-amber-500 mb-2" />
              <span className="text-xs text-muted-foreground">Comparison</span>
            </div>
            <div className="flex flex-col items-center">
              <Sparkles className="h-6 w-6 text-emerald-600 mb-2" />
              <span className="text-xs text-muted-foreground">Trends</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 