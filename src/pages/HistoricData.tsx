
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type PharmacySchedule = {
  id: string;
  month: string;
  year: number;
  total_items: number;
  ingredient_cost: number;
  fees_allowances: number;
  deductions: number;
  net_payment: number;
};

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function HistoricData() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [formData, setFormData] = useState({
    total_items: 0,
    ingredient_cost: 0,
    fees_allowances: 0,
    deductions: 0,
    net_payment: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate years array (last 5 years)
  const years = Array.from(
    { length: 5 }, 
    (_, i) => new Date().getFullYear() - i
  );

  // Fetch historic data
  const { data: historicData, refetch } = useQuery({
    queryKey: ['pharmacySchedules', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('pharmacy_schedules')
        .select('*')
        .eq('user_id', user.id)
        .order('year', { ascending: false })
        .order('month', { ascending: false });
      
      if (error) throw error;
      return data as PharmacySchedule[];
    },
    enabled: !!user
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMonth) {
      toast({
        title: "Error",
        description: "Please select a month",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if an entry already exists for this month and year
      const { data: existingEntries } = await supabase
        .from('pharmacy_schedules')
        .select('id')
        .eq('user_id', user?.id)
        .eq('month', selectedMonth)
        .eq('year', selectedYear);

      if (existingEntries && existingEntries.length > 0) {
        toast({
          title: "Entry already exists",
          description: `You've already added data for ${selectedMonth} ${selectedYear}`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Insert new data
      const { error } = await supabase
        .from('pharmacy_schedules')
        .insert({
          user_id: user?.id as string,
          month: selectedMonth,
          year: selectedYear,
          ...formData
        });

      if (error) throw error;

      toast({
        title: "Data saved",
        description: `Your data for ${selectedMonth} ${selectedYear} has been saved`,
      });
      
      // Reset form
      setFormData({
        total_items: 0,
        ingredient_cost: 0,
        fees_allowances: 0,
        deductions: 0,
        net_payment: 0
      });
      
      // Refresh data
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save data",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to access this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="container mx-auto max-w-6xl py-8 px-4 flex-grow">
        <h1 className="text-2xl font-bold mb-8">Your Data</h1>
        
        <div className="grid gap-8 md:grid-cols-2">
          {/* Data Entry Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Data</CardTitle>
              <CardDescription>
                Enter your monthly pharmacy schedule data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="month">Month</Label>
                    <Select 
                      value={selectedMonth} 
                      onValueChange={setSelectedMonth}
                    >
                      <SelectTrigger id="month">
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Select 
                      value={selectedYear.toString()} 
                      onValueChange={(value) => setSelectedYear(parseInt(value))}
                    >
                      <SelectTrigger id="year">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="total_items">Total Items</Label>
                  <Input
                    id="total_items"
                    type="number"
                    value={formData.total_items || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      total_items: parseInt(e.target.value) || 0
                    })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ingredient_cost">Ingredient Cost (£)</Label>
                  <Input
                    id="ingredient_cost"
                    type="number"
                    step="0.01"
                    value={formData.ingredient_cost || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      ingredient_cost: parseFloat(e.target.value) || 0
                    })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fees_allowances">Fees & Allowances (£)</Label>
                  <Input
                    id="fees_allowances"
                    type="number"
                    step="0.01"
                    value={formData.fees_allowances || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      fees_allowances: parseFloat(e.target.value) || 0
                    })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deductions">Deductions (£)</Label>
                  <Input
                    id="deductions"
                    type="number"
                    step="0.01"
                    value={formData.deductions || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      deductions: parseFloat(e.target.value) || 0
                    })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="net_payment">Net Payment (£)</Label>
                  <Input
                    id="net_payment"
                    type="number"
                    step="0.01"
                    value={formData.net_payment || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      net_payment: parseFloat(e.target.value) || 0
                    })}
                    required
                  />
                </div>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Data"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Historic Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>Your Historic Data</CardTitle>
              <CardDescription>
                Review your previously submitted data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>A list of your pharmacy schedule data</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                    <TableHead className="text-right">Net Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historicData && historicData.length > 0 ? (
                    historicData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.month} {item.year}
                        </TableCell>
                        <TableCell className="text-right">{item.total_items}</TableCell>
                        <TableCell className="text-right">£{item.net_payment.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                        No data available yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
