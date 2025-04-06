
import { PaymentData } from "@/types/paymentTypes";
import { formatMonth } from "./DashboardUtilityFunctions";

export const checkUploadStatus = (documents: PaymentData[]) => {
  if (documents.length === 0) return { upToDate: false, message: "No uploads" };
  
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  
  const today = new Date();
  const currentMonthIndex = today.getMonth();
  const currentYear = today.getFullYear();
  
  const sortedDocs = [...documents].sort((a, b) => {
    if (a.year !== b.year) {
      return b.year - a.year;
    }
    
    const months = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];
    
    return months.indexOf(b.month) - months.indexOf(a.month);
  });
  
  if (sortedDocs.length > 0) {
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const isPaymentDeadlinePassed = today.getDate() >= lastDayOfMonth;
    
    const expectedMonthOffset = isPaymentDeadlinePassed ? 2 : 3;
    let expectedMonthIndex = (currentMonthIndex - expectedMonthOffset) % 12;
    if (expectedMonthIndex < 0) expectedMonthIndex += 12;
    
    const expectedYear = (currentMonthIndex < expectedMonthOffset) ? currentYear - 1 : currentYear;
    const expectedMonth = months[expectedMonthIndex];
    
    const expectedDocExists = sortedDocs.some(doc => 
      (doc.month.toUpperCase() === expectedMonth.toUpperCase() || 
       formatMonth(doc.month).toUpperCase() === expectedMonth.toUpperCase()) && 
      doc.year === expectedYear
    );
    
    if (expectedDocExists) {
      return { upToDate: true, message: "Up to date" };
    } else {
      return { 
        upToDate: false, 
        message: `Missing ${expectedMonth.substring(0, 3)} ${expectedYear}` 
      };
    }
  }
  
  return { upToDate: false, message: "No recent uploads" };
};

export const getNextDispensingPeriod = () => {
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  
  const today = new Date();
  const currentMonthIndex = today.getMonth();
  const currentYear = today.getFullYear();
  
  let nextDispensingMonthIndex = (currentMonthIndex - 2) % 12;
  if (nextDispensingMonthIndex < 0) nextDispensingMonthIndex += 12;
  
  const nextDispensingYear = (currentMonthIndex < 2) ? currentYear - 1 : currentYear;
  
  return { 
    month: months[nextDispensingMonthIndex], 
    year: nextDispensingYear 
  };
};
