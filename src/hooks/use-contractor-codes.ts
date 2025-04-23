import { useState, useEffect } from 'react';
import { PaymentData } from '@/types/paymentTypes';

interface ContractorCodeInfo {
  code: string;
  pharmacyName: string | undefined;
  documentCount: number;
}

export function useContractorCodes(documents: PaymentData[]) {
  const [contractorCodes, setContractorCodes] = useState<ContractorCodeInfo[]>([]);
  const [selectedContractorCode, setSelectedContractorCode] = useState<string | null>(null);
  const [hasMultipleCodes, setHasMultipleCodes] = useState<boolean>(false);

  useEffect(() => {
    if (!documents || documents.length === 0) {
      setContractorCodes([]);
      setSelectedContractorCode(null);
      setHasMultipleCodes(false);
      return;
    }

    // Extract unique contractor codes
    const codeMap = new Map<string, ContractorCodeInfo>();
    
    documents.forEach(doc => {
      if (doc.contractorCode) {
        const existingCode = codeMap.get(doc.contractorCode);
        
        if (existingCode) {
          codeMap.set(doc.contractorCode, {
            ...existingCode,
            documentCount: existingCode.documentCount + 1,
          });
        } else {
          codeMap.set(doc.contractorCode, {
            code: doc.contractorCode,
            pharmacyName: doc.pharmacyName,
            documentCount: 1,
          });
        }
      }
    });
    
    const uniqueCodes = Array.from(codeMap.values());
    setContractorCodes(uniqueCodes);
    setHasMultipleCodes(uniqueCodes.length > 1);
    
    // Set the first code as selected if nothing is currently selected
    if (!selectedContractorCode && uniqueCodes.length > 0) {
      setSelectedContractorCode(uniqueCodes[0].code);
    }
  }, [documents, selectedContractorCode]);

  // Filter documents by the selected contractor code
  const filteredDocuments = documents.filter(doc => 
    !selectedContractorCode || doc.contractorCode === selectedContractorCode
  );

  return {
    contractorCodes,
    selectedContractorCode,
    setSelectedContractorCode,
    hasMultipleCodes,
    filteredDocuments
  };
} 