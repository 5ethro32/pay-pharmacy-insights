import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HighValueItem } from '@/types/paymentTypes';

// This is a standalone component that can be added anywhere to test high value items
const HighValueDebugger = () => {
  const [items, setItems] = useState<HighValueItem[]>([]);
  const [showItems, setShowItems] = useState(false);
  
  const addTestData = () => {
    const testItems: HighValueItem[] = [
      { paidProductName: "Test Medication A", paidGicInclBb: 1250.50, paidQuantity: 30, serviceFlag: "A" },
      { paidProductName: "Test Medication B", paidGicInclBb: 850.25, paidQuantity: 15, serviceFlag: "M" },
      { paidProductName: "Test Medication C", paidGicInclBb: 500.75, paidQuantity: 60, serviceFlag: "C" },
      { paidProductName: "Test Medication D", paidGicInclBb: 350.00, paidQuantity: 45, serviceFlag: "A" },
      { paidProductName: "Test Medication E", paidGicInclBb: 275.80, paidQuantity: 90, serviceFlag: "N" },
    ];
    
    setItems(testItems);
    setShowItems(true);
    console.log("Test data added:", testItems);
  };
  
  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', { 
      style: 'currency', 
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  // Helper function to get row class based on GIC value
  const getRowClass = (gicValue: number): string => {
    if (gicValue > 1000) {
      return "bg-red-50";
    } else if (gicValue > 500) {
      return "bg-amber-50";
    } else {
      return "bg-green-50";
    }
  };
  
  return (
    <div className="p-4 border border-blue-300 rounded-lg bg-blue-50 mb-6">
      <h2 className="text-lg font-bold text-blue-800 mb-4">High Value Items Debug Component</h2>
      
      <div className="mb-4">
        <Button 
          onClick={addTestData} 
          className="bg-blue-600 hover:bg-blue-700"
        >
          Load Test High Value Items
        </Button>
      </div>
      
      {showItems && items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>High Cost Prescription Items (Test Data)</CardTitle>
            <CardDescription>
              {items.length} items with a total value of {
                formatCurrency(items.reduce((sum, item) => sum + (item.paidGicInclBb || 0), 0))
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Service Flag</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">GIC (£)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index} className={getRowClass(item.paidGicInclBb || 0)}>
                      <TableCell className="font-medium">{item.paidProductName}</TableCell>
                      <TableCell>{item.serviceFlag}</TableCell>
                      <TableCell className="text-right">{item.paidQuantity}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(item.paidGicInclBb || 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HighValueDebugger; 