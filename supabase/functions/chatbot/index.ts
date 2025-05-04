
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// OpenAI API key from environment variable
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

// CORS headers for cross-origin requests
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
    const { query, context, conversationHistory } = await req.json();

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Create a system prompt with context about the pharmacy analytics domain
    const systemPrompt = `
You are PharmacyAssist, a specialized AI assistant for Scriptly Analytics, a platform for Scottish pharmacy professionals.
You help users understand their pharmacy payment data and metrics.

${context ? `Current context: ${context}` : ''}

KEY TERMINOLOGY:
- Net Payment: The final payment received by the pharmacy after deductions
- Gross Ingredient Cost: The total cost of all prescribed medications
- Supplementary Payments: Additional payments for services beyond dispensing
- Average Value Per Item: The average value of each dispensed item
- PFS/Pharmacy First: A service where pharmacies treat minor ailments

When analyzing data:
1. Be concise but informative
2. Highlight significant trends or changes
3. Explain pharmacy-specific terminology
4. Suggest potential action items when appropriate
5. Reference specific metrics and time periods when available

Respond in a professional, helpful tone suitable for healthcare professionals.
`;

    // Make a request to the OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationHistory.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: "user", content: query }
        ],
        temperature: 0.3,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || 'API request failed');
    }

    return new Response(JSON.stringify({
      response: result.choices[0].message.content,
      conversationId: result.id,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chatbot function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
