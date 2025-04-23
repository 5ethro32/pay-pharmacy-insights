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
        // Simplified query to work with existing tables - adjust table name based on your Supabase setup
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          throw new Error(error.message);
        }

        if (data) {
          // For development purposes, we'll create some sample data
          // In production, you would map from your actual database schema
          const sampleData: PaymentData[] = [
            {
              id: '1',
              month: 'JANUARY',
              year: 2023,
              totalItems: 5000,
              netPayment: 15000,
              contractorCode: '12345',
              pharmacyName: 'Pharmacy A',
              healthBoard: 'NHS GG&C'
            },
            {
              id: '2',
              month: 'FEBRUARY',
              year: 2023,
              totalItems: 4800,
              netPayment: 14500,
              contractorCode: '12345',
              pharmacyName: 'Pharmacy A',
              healthBoard: 'NHS GG&C'
            },
            {
              id: '3',
              month: 'MARCH',
              year: 2023,
              totalItems: 5200,
              netPayment: 16000,
              contractorCode: '12345',
              pharmacyName: 'Pharmacy A',
              healthBoard: 'NHS GG&C'
            },
            {
              id: '4',
              month: 'JANUARY',
              year: 2023,
              totalItems: 3000,
              netPayment: 9000,
              contractorCode: '67890',
              pharmacyName: 'Pharmacy B',
              healthBoard: 'NHS Lothian'
            },
            {
              id: '5',
              month: 'FEBRUARY',
              year: 2023,
              totalItems: 3200,
              netPayment: 9500,
              contractorCode: '67890',
              pharmacyName: 'Pharmacy B',
              healthBoard: 'NHS Lothian'
            },
            {
              id: '6',
              month: 'MARCH',
              year: 2023,
              totalItems: 3100,
              netPayment: 9200,
              contractorCode: '67890',
              pharmacyName: 'Pharmacy B',
              healthBoard: 'NHS Lothian'
            }
          ];

          setDocuments(sampleData);
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

  useEffect(() => {
    // Try to get documents from localStorage
    const savedDocuments = localStorage.getItem('scriptly_documents');
    
    if (savedDocuments) {
      try {
        const parsedDocuments = JSON.parse(savedDocuments);
        setDocuments(parsedDocuments);
        setLoading(false);
      } catch (err) {
        console.error("Error parsing saved documents:", err);
        setError(new Error("Failed to load documents"));
        setLoading(false);
      }
    } else {
      // No documents in localStorage
      setDocuments([]);
      setLoading(false);
    }
  }, []);

  return { documents, loading, error };
} 