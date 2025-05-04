
import { useState, useEffect } from 'react';
import { PaymentData, ItemCounts, Financials, PFSDetails, RegionalPayments, HighValueItem } from '@/types/paymentTypes';
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
            
            // Safely handle itemCounts, ensuring it's an object with the correct shape
            let itemCountsObj: ItemCounts = { total: 0 };
            if (typeof extractedData === 'object' && extractedData !== null && 'itemCounts' in extractedData) {
              if (typeof extractedData.itemCounts === 'object' && extractedData.itemCounts !== null) {
                // Cast the itemCounts to match the expected structure
                const rawItemCounts = extractedData.itemCounts as Record<string, number | undefined>;
                itemCountsObj = {
                  total: rawItemCounts.total ?? 0,
                  otc: rawItemCounts.otc,
                  prescriptions: rawItemCounts.prescriptions,
                  appliance: rawItemCounts.appliance,
                  extemp: rawItemCounts.extemp,
                  invoiceTotal: rawItemCounts.invoiceTotal,
                  exemptTotal: rawItemCounts.exemptTotal,
                  privateTotal: rawItemCounts.privateTotal,
                  fp10Total: rawItemCounts.fp10Total,
                  pnTotal: rawItemCounts.pnTotal,
                  wpTotal: rawItemCounts.wpTotal,
                  totalValue: rawItemCounts.totalValue,
                  mcr: rawItemCounts.mcr,
                  ams: rawItemCounts.ams,
                  nhsPfs: rawItemCounts.nhsPfs,
                  cpus: rawItemCounts.cpus,
                  other: rawItemCounts.other
                };
              }
            }
              
            const netPayment = typeof extractedData === 'object' && extractedData !== null && 'netPayment' in extractedData && typeof extractedData.netPayment === 'number' 
              ? extractedData.netPayment 
              : 0;
              
            const contractorCode = typeof extractedData === 'object' && extractedData !== null && 'contractorCode' in extractedData && typeof extractedData.contractorCode === 'string' 
              ? extractedData.contractorCode 
              : '';
              
            // Safely handle financials, using a type assertion to match the expected structure
            let financialsObj: Financials | undefined = undefined;
            if (typeof extractedData === 'object' && extractedData !== null && 'financials' in extractedData && 
                typeof extractedData.financials === 'object' && extractedData.financials !== null) {
              financialsObj = extractedData.financials as Financials;
            }
            
            // Safely handle PFS details
            let pfsDetailsObj: PFSDetails | undefined = undefined;
            if (typeof extractedData === 'object' && extractedData !== null && 'pfsDetails' in extractedData && 
                typeof extractedData.pfsDetails === 'object' && extractedData.pfsDetails !== null) {
              pfsDetailsObj = extractedData.pfsDetails as PFSDetails;
            }
            
            // Safely handle regional payments
            let regionalPaymentsObj: RegionalPayments | undefined = undefined;
            if (typeof extractedData === 'object' && extractedData !== null && 'regionalPayments' in extractedData && 
                typeof extractedData.regionalPayments === 'object' && extractedData.regionalPayments !== null) {
              regionalPaymentsObj = extractedData.regionalPayments as RegionalPayments;
            }
            
            // Safely handle high value items, ensuring it's an array
            let highValueItemsArr: HighValueItem[] = [];
            if (typeof extractedData === 'object' && extractedData !== null && 'highValueItems' in extractedData && 
                Array.isArray(extractedData.highValueItems)) {
              highValueItemsArr = extractedData.highValueItems as HighValueItem[];
            }
            
            // Create the PaymentData object with correct types
            const paymentDataItem: PaymentData = {
              id: doc.id,
              month: doc.month || month,
              year: doc.year || year,
              totalItems: itemCountsObj.total || 0,
              netPayment: netPayment || 0,
              contractorCode: contractorCode || '',
              pharmacyName: doc.pharmacy_name || '',
              healthBoard: doc.health_board || '',
              extracted_data: extractedData,
              // Map other fields from extractedData with proper typing
              financials: financialsObj,
              itemCounts: itemCountsObj,
              pfsDetails: pfsDetailsObj,
              regionalPayments: regionalPaymentsObj,
              highValueItems: highValueItemsArr,
            };
            
            return paymentDataItem;
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
