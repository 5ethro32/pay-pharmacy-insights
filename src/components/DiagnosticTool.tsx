
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, LoaderCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const DiagnosticTool = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<{
    status: 'success' | 'error' | 'warning';
    message: string;
    details?: string;
  }[]>([]);

  const runDiagnostics = () => {
    setIsRunning(true);
    setResults([]);
    
    // Simulate diagnostic checks
    setTimeout(() => {
      const diagnosticResults = [
        {
          status: 'success' as const,
          message: 'Application configuration loaded',
          details: 'Config validated successfully'
        },
        {
          status: 'success' as const,
          message: 'Database connection established',
          details: 'Connected to pharmacy-data instance'
        },
        {
          status: 'warning' as const,
          message: 'Some pharmacy data may be outdated',
          details: 'Last sync: 3 days ago'
        },
        {
          status: 'error' as const,
          message: 'API rate limit approaching threshold',
          details: '85% of daily limit used'
        }
      ];
      
      setResults(diagnosticResults);
      setIsRunning(false);
      
      toast({
        title: "Diagnostics Complete",
        description: "System check completed with some warnings",
      });
    }, 2000);
  };

  const getStatusIcon = (status: 'success' | 'error' | 'warning') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="text-green-500 h-5 w-5" />;
      case 'error':
        return <XCircle className="text-red-500 h-5 w-5" />;
      case 'warning':
        return <AlertCircle className="text-amber-500 h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <span>System Diagnostics</span>
          {isRunning && (
            <LoaderCircle className="ml-2 h-5 w-5 animate-spin text-gray-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Run a system diagnostic to check for issues with data connections and configurations
            </p>
            <Button 
              onClick={runDiagnostics} 
              disabled={isRunning}
              variant="outline"
              size="sm"
            >
              {isRunning ? 'Running...' : 'Run Diagnostics'}
            </Button>
          </div>
          
          {results.length > 0 && (
            <>
              <Separator className="my-4" />
              
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div key={index} className="flex items-start">
                    <div className="mr-2 mt-0.5">
                      {getStatusIcon(result.status)}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <p className="font-medium text-gray-900">
                          {result.message}
                        </p>
                        <Badge 
                          variant={result.status === 'success' ? 'outline' : 
                                  result.status === 'warning' ? 'secondary' : 'destructive'}
                          className="ml-2"
                        >
                          {result.status}
                        </Badge>
                      </div>
                      {result.details && (
                        <p className="text-xs text-gray-500 mt-0.5">{result.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DiagnosticTool;
