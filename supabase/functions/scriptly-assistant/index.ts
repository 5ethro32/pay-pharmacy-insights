
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, paymentData, currentView } = await req.json();
    
    console.log('Received message:', message);
    console.log('Current view:', currentView);
    
    // This is where you would integrate with an LLM API like OpenAI
    // Example integration (replace with your preferred LLM service):
    // const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    // if (!openAIApiKey) throw new Error("Missing OpenAI API key");
    
    // For now, we'll use more sophisticated mock responses based on context
    let responseText = "";
    let suggestedQuestions: string[] = [];

    // Create contextual responses based on the message content and current view
    if (message.toLowerCase().includes('payment')) {
      responseText = "Based on your payment data, I can see your net payment has increased by 3.2% compared to last month. Your total payment was £24,532.";
      suggestedQuestions = [
        "When is my next payment date?",
        "How has my payment changed over 6 months?",
        "Break down my payment by service type",
      ];
    } else if (message.toLowerCase().includes('pharmacy first') || message.toLowerCase().includes('pfs')) {
      responseText = "Your Pharmacy First performance is strong with 142 consultations this month, which is 15% higher than the average in your health board. Your compliance rate is 97%.";
      suggestedQuestions = [
        "How does my PFS compare to others?",
        "What's my PFS payment breakdown?",
        "How can I improve my PFS performance?",
      ];
    } else if (message.toLowerCase().includes('item') || message.toLowerCase().includes('prescription')) {
      responseText = "Your highest value items this month were Apixaban 5mg tablets (£3,245), Rivaroxaban 20mg tablets (£2,870), and Edoxaban 60mg tablets (£2,110). Your prescription volume increased 5% from last month.";
      suggestedQuestions = [
        "What's my average item value?",
        "Which items had the biggest change?",
        "Show my item count trends",
      ];
    } else {
      // Default response with data awareness
      responseText = "I'm analyzing your pharmacy payment data. I can help answer questions about your payments, prescription volumes, Pharmacy First Service performance, or specific items. What would you like to know?";
      suggestedQuestions = [
        "How does my net payment compare to last month?",
        "What are my highest value items?",
        "Show me my Pharmacy First performance",
        "When is my next payment due?",
      ];
    }

    return new Response(
      JSON.stringify({
        response: responseText,
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
