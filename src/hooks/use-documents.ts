
import { useState, useEffect } from 'react';
import { PaymentData } from '@/types/paymentTypes';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export function useDocuments() {
  const [documents, setDocuments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    const fetchDocuments = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('Fetching documents for user:', user.id);
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          throw new Error(error.message);
        }

        if (data && data.length > 0) {
          console.log(`Found ${data.length} documents:`, data);
          
          // Transform raw documents into PaymentData format
          const paymentData = data.map(doc => {
            // Extract data from extracted_data field if available
            const extractedData = doc.extracted_data ? 
              (typeof doc.extracted_data === 'object' ? doc.extracted_data : {}) : {};
            
            // Type safety checks for extracted_data properties
            const month = typeof extractedData === 'object' && extractedData !== null && 'month' in extractedData && typeof extractedData.month === 'string' 
              ? extractedData.month 
              : 'Unknown';
              
            const year = typeof extractedData === 'object' && extractedData !== null && 'year' in extractedData && typeof extractedData.year === 'number' 
              ? extractedData.year 
              : new Date().getFullYear();
              
            const itemCounts = typeof extractedData === 'object' && extractedData !== null && 'itemCounts' in extractedData && typeof extractedData.itemCounts === 'object' 
              ? extractedData.itemCounts 
              : { total: 0 };
              
            const netPayment = typeof extractedData === 'object' && extractedData !== null && 'netPayment' in extractedData && typeof extractedData.netPayment === 'number' 
              ? extractedData.netPayment 
              : 0;
              
            const contractorCode = typeof extractedData === 'object' && extractedData !== null && 'contractorCode' in extractedData && typeof extractedData.contractorCode === 'string' 
              ? extractedData.contractorCode 
              : '';
              
            // Safely extract nested objects
            const financials = typeof extractedData === 'object' && extractedData !== null && 'financials' in extractedData && typeof extractedData.financials === 'object' 
              ? extractedData.financials 
              : undefined;
              
            const pfsDetails = typeof extractedData === 'object' && extractedData !== null && 'pfsDetails' in extractedData && typeof extractedData.pfsDetails === 'object' 
              ? extractedData.pfsDetails 
              : undefined;
              
            const regionalPayments = typeof extractedData === 'object' && extractedData !== null && 'regionalPayments' in extractedData && typeof extractedData.regionalPayments === 'object' 
              ? extractedData.regionalPayments 
              : undefined;
              
            const highValueItems = typeof extractedData === 'object' && extractedData !== null && 'highValueItems' in extractedData && Array.isArray(extractedData.highValueItems) 
              ? extractedData.highValueItems 
              : [];
            
            return {
              id: doc.id,
              month: doc.month || month,
              year: doc.year || year,
              totalItems: itemCounts?.total || 0,
              netPayment: netPayment || 0,
              contractorCode: contractorCode || '',
              pharmacyName: doc.pharmacy_name || '',
              healthBoard: doc.health_board || '',
              extracted_data: extractedData, // Keep the full extracted_data for additional context
              // Map other fields from extractedData with proper typing
              financials,
              itemCounts,
              pfsDetails,
              regionalPayments,
              highValueItems,
            };
          });
          
          console.log('Transformed payment data:', paymentData);
          
          // Sort data by year and month for consistency
          const sortedPaymentData = paymentData.sort((a, b) => {
            if (a.year !== b.year) {
              return b.year - a.year; // Latest year first
            }
            
            // Compare months (assuming month names)
            const months = [
              "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", 
              "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
            ];
            
            const aMonthIndex = months.indexOf(a.month.toUpperCase());
            const bMonthIndex = months.indexOf(b.month.toUpperCase());
            
            return bMonthIndex - aMonthIndex; // Latest month first
          });
          
          setDocuments(sortedPaymentData);
        } else {
          console.log('No documents found for user');
          setDocuments([]);
        }
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch documents'));
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [user?.id]);

  return { documents, loading, error };
}
