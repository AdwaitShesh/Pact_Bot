import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface AIChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
}

export function AIChatDialog({ isOpen, onClose, contractId }: AIChatDialogProps) {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Array<{ type: 'user' | 'ai'; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    const userMessage = prompt.trim();
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setPrompt('');
    setIsLoading(true);

    try {
      const result = await api.post(`/contracts/${contractId}/ask`, {
        prompt: userMessage
      });
      setMessages(prev => [...prev, { type: 'ai', content: result.data.response }]);
    } catch (error) {
      console.error('AI chat error:', error);
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: 'Sorry, I encountered an error processing your request.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>Ask AI about this contract</DialogTitle>
        </DialogHeader>
        
        {/* Chat messages container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 mb-4 bg-muted rounded-lg">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground">
              👋 Hi! I'm your AI assistant. Ask me anything about this contract!
            </div>
          )}
          
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted border-muted-foreground/20 border'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="space-y-4 mt-auto bg-card">
          <Textarea
            placeholder="Ask a question about the contract..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            className="min-h-[80px] resize-none bg-muted"
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Send'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 