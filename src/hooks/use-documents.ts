
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
            const extractedData = doc.extracted_data || {};
            
            return {
              id: doc.id,
              month: doc.month || extractedData.month || 'Unknown',
              year: doc.year || extractedData.year || new Date().getFullYear(),
              totalItems: extractedData.itemCounts?.total || 0,
              netPayment: extractedData.netPayment || 0,
              contractorCode: extractedData.contractorCode || '',
              pharmacyName: doc.pharmacy_name || '',
              healthBoard: doc.health_board || '',
              extracted_data: extractedData, // Keep the full extracted_data for additional context
              // Map other fields from extractedData
              financials: extractedData.financials,
              itemCounts: extractedData.itemCounts,
              pfsDetails: extractedData.pfsDetails,
              regionalPayments: extractedData.regionalPayments,
              highValueItems: extractedData.highValueItems || [],
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
