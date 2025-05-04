
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DataContext {
  highValueItems?: Array<{
    paidProductName: string;
    paidGicInclBb: number;
    paidQuantity?: number;
    serviceFlag?: string;
  }> | null;
  netPayment?: number | null;
  contractorCode?: string | null;
  totalItems?: number | null;
  month?: string | null;
  year?: number | null;
  pharmacyFirstBase?: number | null;
  pharmacyFirstActivity?: number | null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, currentView, dataContext } = await req.json();
    
    console.log('Received message:', message);
    console.log('Current view:', currentView);
    console.log('Data context:', dataContext);
    
    // Use the OpenAI API key from Supabase secrets
    const openaiApiKey = Deno.env.get('Scriptly RX');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key is not configured');
    }
    
    // Create a context-aware system message based on the current view and data
    let systemPrompt = "You are Scriptly Assistant, an AI designed to help pharmacists understand their payment data. ";
    
    // Add context based on the current view/path
    if (currentView.includes('/dashboard')) {
      systemPrompt += "You are currently on the Dashboard page which shows monthly payment summary, key metrics, and high-value items. " + 
        "This page helps pharmacists track payment trends over time.";
    } else if (currentView.includes('/comparison/month')) {
      systemPrompt += "You are currently on the Monthly Comparison page which compares pharmacy payments over different months. " +
        "This helps pharmacists identify seasonal trends and payment variations.";
    } else if (currentView.includes('/comparison/peer')) {
      systemPrompt += "You are currently on the Peer Comparison page which benchmarks a pharmacy against similar pharmacies. " +
        "This helps pharmacists understand their performance relative to peers.";
    } else if (currentView.includes('/comparison/group')) {
      systemPrompt += "You are currently on the Group Comparison page which compares multiple pharmacies within the same group. " +
        "This helps pharmacy owners track performance across their portfolio.";
    } else if (currentView.includes('/insights')) {
      systemPrompt += "You are currently on the Insights page which provides AI-powered analysis of pharmacy payment data. " +
        "This helps pharmacists identify opportunities and issues.";
    }
    
    // Add data context if available
    const ctx = dataContext as DataContext;
    if (ctx) {
      systemPrompt += "\n\nData Context for this pharmacy:";
      
      if (ctx.contractorCode) {
        systemPrompt += `\nContractor Code: ${ctx.contractorCode}`;
      }
      
      if (ctx.month && ctx.year) {
        systemPrompt += `\nLatest payment data is for: ${ctx.month} ${ctx.year}`;
      }
      
      if (ctx.netPayment) {
        systemPrompt += `\nNet Payment: £${ctx.netPayment.toLocaleString()}`;
      }
      
      if (ctx.totalItems) {
        systemPrompt += `\nTotal Items: ${ctx.totalItems.toLocaleString()}`;
      }
      
      if (ctx.pharmacyFirstBase || ctx.pharmacyFirstActivity) {
        const pfBase = ctx.pharmacyFirstBase || 0;
        const pfActivity = ctx.pharmacyFirstActivity || 0;
        systemPrompt += `\nPharmacy First Payments: Base £${pfBase.toLocaleString()}, Activity £${pfActivity.toLocaleString()}, Total £${(pfBase + pfActivity).toLocaleString()}`;
      }
      
      if (ctx.highValueItems && ctx.highValueItems.length > 0) {
        systemPrompt += "\n\nHigh Value Items:";
        ctx.highValueItems.forEach((item, index) => {
          systemPrompt += `\n${index + 1}. ${item.paidProductName} - £${item.paidGicInclBb.toLocaleString()}${item.paidQuantity ? ` (Quantity: ${item.paidQuantity})` : ''}${item.serviceFlag ? ` (Service: ${item.serviceFlag})` : ''}`;
        });
      }
      
      systemPrompt += "\n\nWhen answering questions about specific data, use the information provided above. If asked about data that is not provided, explain that you don't have that specific information.";
    }
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using the recommended model
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Generate contextual suggested questions based on the current view and data context
    let suggestedQuestions = [];
    
    if (currentView.includes('/dashboard')) {
      suggestedQuestions = [
        "How does my net payment compare to last month?",
        "What are my highest value items?",
        "How is my Pharmacy First performance?",
        "What's my payment date for next month?",
      ];
    } else if (currentView.includes('/comparison/month')) {
      suggestedQuestions = [
        "Which month had my highest net payment?",
        "How have my item counts changed over time?",
        "What's the trend in my dispensing fees?",
        "When did I have the most PFS consultations?",
      ];
    } else if (currentView.includes('/comparison/peer')) {
      suggestedQuestions = [
        "How do my payments compare to other pharmacies?",
        "Is my PFS performance above average?",
        "What's the average payment in my health board?",
        "How many items do similar pharmacies dispense?",
      ];
    } else if (currentView.includes('/comparison/group')) {
      suggestedQuestions = [
        "Which of my pharmacies performs best?",
        "How do payments differ across my group?",
        "Which location has the highest PFS activity?",
        "How do item counts vary across my pharmacies?",
      ];
    } else if (currentView.includes('/insights')) {
      suggestedQuestions = [
        "What insights can you provide about my data?",
        "How can I improve my pharmacy performance?",
        "What patterns do you see in my payment history?",
        "What recommendations do you have for me?",
      ];
    } else {
      // Default suggestions for other pages
      suggestedQuestions = [
        "How can I use Scriptly to improve my pharmacy?",
        "What features are available in my plan?",
        "How do I interpret my payment schedule?",
        "Can you explain key pharmacy payment terms?",
      ];
    }

    return new Response(
      JSON.stringify({
        response: aiResponse,
        suggestedQuestions: suggestedQuestions
      }),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      }
    );
  } catch (error) {
    console.error('Error in scriptly-assistant function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process your request',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
