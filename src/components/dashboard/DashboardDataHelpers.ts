
import { PaymentData } from "@/types/paymentTypes";
import { sortDocumentsChronologically } from "./DashboardUtilityFunctions";

export const getSelectedData = (documents: PaymentData[], selectedMonth: string | null) => {
  if (!selectedMonth) return null;
  
  const [month, yearStr] = selectedMonth.split(' ');
  const year = parseInt(yearStr);
  
  return documents.find(doc => doc.month === month && doc.year === year);
};

export const getPreviousMonthData = (documents: PaymentData[], selectedMonth: string | null) => {
  if (!selectedMonth || documents.length <= 1) return null;
  
  const currentDoc = getSelectedData(documents, selectedMonth);
  if (!currentDoc) return null;
  
  const sortedDocs = sortDocumentsChronologically(documents);
  
  const currentIndex = sortedDocs.findIndex(
    doc => doc.month === currentDoc.month && doc.year === currentDoc.year
  );
  
  if (currentIndex !== -1 && currentIndex < sortedDocs.length - 1) {
    return sortedDocs[currentIndex + 1];
  }
  
  return null;
};
