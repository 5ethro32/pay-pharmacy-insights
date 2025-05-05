
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
  previousMonthNetPayment?: number | null;
  contractorCode?: string | null;
  totalItems?: number | null;
  month?: string | null;
  year?: number | null;
  pharmacyFirstBase?: number | null;
  pharmacyFirstActivity?: number | null;
  pfsDetails?: any | null;
}

// Helper to detect if content might benefit from a chart
const shouldAddChartData = (content: string, dataContext: DataContext): { chartData: any[], chartType: string } | null => {
  // Check if response is about high value items
  if ((content.includes('highest value item') || content.includes('high-value item')) && dataContext.highValueItems?.length) {
    return {
      chartType: 'bar',
      chartData: dataContext.highValueItems.map((item, index) => ({
        name: item.paidProductName.split(' ').slice(0, 2).join(' ') + '...',
        fullName: item.paidProductName,
        value: item.paidGicInclBb
      })).slice(0, 5)
    };
  }
  
  // Check if response is about comparing payments
  if ((content.includes('payment') || content.includes('net payment')) && 
      dataContext.netPayment && dataContext.previousMonthNetPayment) {
    return {
      chartType: 'bar',
      chartData: [
        { name: dataContext.month, value: dataContext.netPayment },
        { name: 'Previous', value: dataContext.previousMonthNetPayment }
      ]
    };
  }

  // Check if response is about Pharmacy First services
  if (content.includes('Pharmacy First') && dataContext.pharmacyFirstBase && dataContext.pharmacyFirstActivity) {
    return {
      chartType: 'pie',
      chartData: [
        { name: 'Base Payment', value: dataContext.pharmacyFirstBase },
        { name: 'Activity Payment', value: dataContext.pharmacyFirstActivity }
      ]
    };
  }

  return null;
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
    console.log('Data context:', JSON.stringify(dataContext, null, 2));
    
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
      
      // Use the current date from the server instead of hardcoded date
      const currentDate = new Date();
      const currentMonth = currentDate.toLocaleString('en-US', { month: 'long' }).toUpperCase();
      const currentYear = currentDate.getFullYear();
      
      // Use provided date if available, otherwise use current date
      const month = ctx.month || currentMonth;
      const year = ctx.year || currentYear;
      
      systemPrompt += `\nLatest payment data is for: ${month} ${year}`;
      
      if (ctx.netPayment !== null && ctx.netPayment !== undefined) {
        systemPrompt += `\nNet Payment: £${ctx.netPayment.toLocaleString()}`;
        
        if (ctx.previousMonthNetPayment !== null && ctx.previousMonthNetPayment !== undefined) {
          const difference = ctx.netPayment - ctx.previousMonthNetPayment;
          const percentChange = ((difference / ctx.previousMonthNetPayment) * 100).toFixed(1);
          const direction = difference >= 0 ? 'up' : 'down';
          
          systemPrompt += `\nCompared to previous month: ${direction} ${Math.abs(difference).toLocaleString()} (${direction} ${Math.abs(parseFloat(percentChange))}%)`;
        }
      }
      
      if (ctx.totalItems) {
        systemPrompt += `\nTotal Items: ${ctx.totalItems.toLocaleString()}`;
      }
      
      if (ctx.pharmacyFirstBase || ctx.pharmacyFirstActivity) {
        const pfBase = ctx.pharmacyFirstBase || 0;
        const pfActivity = ctx.pharmacyFirstActivity || 0;
        systemPrompt += `\nPharmacy First Payments: Base £${pfBase.toLocaleString()}, Activity £${pfActivity.toLocaleString()}, Total £${(pfBase + pfActivity).toLocaleString()}`;
      }
      
      if (ctx.pfsDetails) {
        systemPrompt += "\n\nPharmacy First Scotland Details:";
        if (ctx.pfsDetails.consultations) 
          systemPrompt += `\nConsultations: ${ctx.pfsDetails.consultations}`;
        if (ctx.pfsDetails.treatmentItems) 
          systemPrompt += `\nTreatment Items: ${ctx.pfsDetails.treatmentItems}`;
        if (ctx.pfsDetails.referrals) 
          systemPrompt += `\nReferrals: ${ctx.pfsDetails.referrals}`;
        if (ctx.pfsDetails.basePayment) 
          systemPrompt += `\nBase Payment: £${ctx.pfsDetails.basePayment?.toLocaleString()}`;
        if (ctx.pfsDetails.activityPayment) 
          systemPrompt += `\nActivity Payment: £${ctx.pfsDetails.activityPayment?.toLocaleString()}`;
      }
      
      if (ctx.highValueItems && ctx.highValueItems.length > 0) {
        systemPrompt += "\n\nHigh Value Items:";
        ctx.highValueItems.forEach((item, index) => {
          systemPrompt += `\n${index + 1}. ${item.paidProductName} - £${item.paidGicInclBb.toLocaleString()}${item.paidQuantity ? ` (Quantity: ${item.paidQuantity})` : ''}${item.serviceFlag ? ` (Service: ${item.serviceFlag})` : ''}`;
        });
      }
      
      systemPrompt += "\n\nWhen answering questions about specific data, use the information provided above. If asked about data that is not provided, explain that you don't have that specific information.";
      
      // Add instructions for formatting responses
      systemPrompt += "\n\nWhen formatting your responses:";
      systemPrompt += "\n1. Use numbered lists for any sequential or ranked information.";
      systemPrompt += "\n2. Leave a blank line between paragraphs for better readability.";
      systemPrompt += "\n3. Use **bold** for important values, metrics, or headings.";
      systemPrompt += "\n4. Format high-value items as '1. DRUG NAME - £1,234.56 (Quantity: 123)'";
      
      // Add current date information
      systemPrompt += `\n\nToday's date is: ${currentDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    }
    
    console.log('System prompt:', systemPrompt);
    
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
    console.log('AI response:', aiResponse);
    
    // Check if we should add chart data to the response
    let chartData = null;
    let chartType = null;
    
    const chartInfo = shouldAddChartData(aiResponse, dataContext as DataContext);
    if (chartInfo) {
      chartData = chartInfo.chartData;
      chartType = chartInfo.chartType;
    }
    
    // Generate contextual suggested questions based on the current view and data context
    const suggestedQuestions = [
      "How does my net payment compare to last month?",
      "What are my highest value items?",
      "How is my Pharmacy First performance?",
      "Show me my dispensing fees trend",
      "Compare my items with previous month",
      "What's my payment breakdown?"
    ];

    return new Response(
      JSON.stringify({
        response: aiResponse,
        suggestedQuestions: suggestedQuestions,
        chartData: chartData,
        chartType: chartType
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
