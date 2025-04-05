
import { useState } from "react";
import { Send, Bot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const ChatbotTab = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hello! I'm your pharmacy analytics assistant. How can I help you analyze your payment data today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: "user" as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    
    try {
      // Check if API key is set
      const apiKey = localStorage.getItem("OPENAI_API_KEY");
      
      if (!apiKey) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "I need an API key to analyze your data. Please set your OpenAI API key in the settings."
        }]);
        setLoading(false);
        return;
      }

      // This would be replaced by a call to your Supabase Edge Function in production
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a pharmacy analytics assistant that helps pharmacists understand their payment data, identify trends, and optimize their business. Be concise but informative."
            },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: input }
          ],
          max_tokens: 1000
        })
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || "Error connecting to OpenAI");
      }
      
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.choices[0].message.content
      }]);
    } catch (error) {
      console.error("Error querying OpenAI:", error);
      toast({
        title: "Error connecting to AI assistant",
        description: error.message || "Please check your API key and try again.",
        variant: "destructive"
      });
      
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I encountered an error. Please check your API key or try again later."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const setApiKey = () => {
    const key = prompt("Please enter your OpenAI API key:");
    if (key) {
      localStorage.setItem("OPENAI_API_KEY", key);
      toast({
        title: "API key saved",
        description: "Your OpenAI API key has been saved successfully."
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">AI Pharmacy Assistant</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={setApiKey}
            >
              Set API Key
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Chat with your AI pharmacy analyst to better understand your payment data, get insights, and optimize your pharmacy operations.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 h-[500px] border overflow-y-auto mb-4 flex flex-col">
            <div className="flex-1 space-y-4">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`
                      max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-red-700 text-white' 
                          : 'bg-white border border-gray-200'
                      }
                    `}
                  >
                    <div className="flex items-start gap-2">
                      {message.role === 'assistant' && (
                        <Avatar className="h-8 w-8 bg-red-50 border border-red-100">
                          <AvatarFallback>
                            <Bot className="h-4 w-4 text-red-700" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] p-3 rounded-lg bg-white border border-gray-200">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 bg-red-50 border border-red-100">
                        <AvatarFallback>
                          <Bot className="h-4 w-4 text-red-700" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "250ms" }}></div>
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "500ms" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Input 
              placeholder="Ask about your pharmacy data..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="flex-1"
            />
            <Button 
              onClick={handleSend} 
              disabled={!input.trim() || loading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle>Suggested Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            variant="outline" 
            onClick={() => {
              setInput("What trends do you see in my monthly prescription volumes?");
            }}
            className="w-full justify-start text-left"
          >
            What trends do you see in my monthly prescription volumes?
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              setInput("How does my AMS reimbursement compare to previous months?");
            }}
            className="w-full justify-start text-left"
          >
            How does my AMS reimbursement compare to previous months?
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              setInput("What parts of my payment show the greatest variance?");
            }}
            className="w-full justify-start text-left"
          >
            What parts of my payment show the greatest variance?
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatbotTab;
