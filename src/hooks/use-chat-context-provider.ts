
import { useLocation } from 'react-router-dom';
import { useCallback } from 'react';

export const useChatContextProvider = () => {
  const location = useLocation();

  const getSuggestedQuestions = useCallback(() => {
    const path = location.pathname;
    const searchParams = new URLSearchParams(location.search);
    const activeTab = searchParams.get('tab');
    
    // Dashboard page
    if (path === '/dashboard') {
      if (activeTab === 'upload') {
        return [
          "How do I upload my payment schedule?",
          "What file formats do you support?",
          "How long does processing take?",
          "Can I upload multiple files at once?",
        ];
      } else if (activeTab === 'documents') {
        return [
          "How do I delete a document?",
          "Can I export my data?",
          "How is my data secured?",
          "What data is extracted from my documents?",
        ];
      } else {
        // Main dashboard tab
        return [
          "How does my net payment compare to last month?",
          "What are my highest value items?",
          "How is my Pharmacy First performance?",
          "What's my payment date for next month?",
        ];
      }
    }
    
    // Month comparison page
    else if (path === '/comparison/month') {
      return [
        "Which month had my highest net payment?",
        "How have my item counts changed over time?",
        "What's the trend in my dispensing fees?",
        "When did I have the most PFS consultations?",
      ];
    }
    
    // Peer comparison page
    else if (path === '/comparison/peer') {
      return [
        "How do my payments compare to other pharmacies?",
        "Is my PFS performance above average?",
        "What's the average payment in my health board?",
        "How many items do similar pharmacies dispense?",
      ];
    }
    
    // Group comparison page
    else if (path === '/comparison/group') {
      return [
        "Which of my pharmacies performs best?",
        "How do payments differ across my group?",
        "Which location has the highest PFS activity?",
        "How do item counts vary across my pharmacies?",
      ];
    }
    
    // Insights page
    else if (path === '/insights') {
      return [
        "What insights can you provide about my data?",
        "How can I improve my pharmacy performance?",
        "What patterns do you see in my payment history?",
        "What recommendations do you have for me?",
      ];
    }
    
    // Default questions for all other pages
    return [
      "How can I use Scriptly to improve my pharmacy?",
      "What features are available in my plan?",
      "How do I interpret my payment schedule?",
      "Can you explain key pharmacy payment terms?",
    ];
    
  }, [location.pathname, location.search]);
  
  return { getSuggestedQuestions };
};
