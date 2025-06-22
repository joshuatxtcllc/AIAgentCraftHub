import { useState, useRef, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAssistantStore } from '@/store/assistant-store';
import { type ChatMessage, type Assistant } from '@shared/schema';
import { Bot, User, Send, Activity } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile'

export function ChatInterface() {
  const [input, setInput] = useState('');
  const { chatMessages, addChatMessage, currentConversationId, currentAssistant } = useAssistantStore();

  // For demo purposes, we'll use the current assistant or first available one
  const { data: assistants = [] } = useQuery<Assistant[]>({
    queryKey: ['/api/assistants'],
  });

  const activeAssistant = currentAssistant || assistants[0];

  // If no assistant is available, show create assistant message
  if (!activeAssistant) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Chat Interface</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 text-center space-y-4">
          <Bot className="w-12 h-12 text-muted-foreground" />
          <div className="space-y-2">
            <h3 className="text-lg font-medium">No Assistant Available</h3>
            <p className="text-muted-foreground max-w-md">
              Create an assistant first using the step-by-step wizard to start chatting.
            </p>
          </div>
          <Button onClick={() => window.location.href = '/'} variant="outline">
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, assistantId }: { message: string; assistantId: number }) => {
      const response = await apiRequest('POST', '/api/chat', {
        message,
        assistantId
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Add both user message and AI response to the store
      const userMessage: ChatMessage = {
        id: `user_${Date.now()}`,
        role: 'user',
        content: input,
        timestamp: new Date().toISOString()
      };

      addChatMessage(userMessage);
      addChatMessage(data.response);
      setInput('');
    },
  });

  const handleSendMessage = () => {
    if (!input.trim() || sendMessageMutation.isPending || !activeAssistant) return;

    sendMessageMutation.mutate({
      message: input,
      assistantId: activeAssistant.id
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{activeAssistant.name}</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
            <Badge variant="secondary" className="bg-secondary/10 text-secondary">
              <Activity className="w-3 h-3 mr-1" />
              Online
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Chat Messages */}
        <ScrollArea className="h-64 w-full pr-4">
          <div className="space-y-4">
            {/* Welcome Message */}
            {chatMessages.length === 0 && (
              <div className="flex space-x-3 chat-bubble">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-sm text-foreground">
                      Hello! I'm your AI assistant. I can help you with customer inquiries, data analysis, and workflow automation. What would you like to test today?
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">AI Assistant • Just now</p>
                </div>
              </div>
            )}

            {/* Chat Messages */}
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex space-x-3 chat-bubble",
                  message.role === 'user' ? "justify-end" : ""
                )}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}

                <div className={cn("flex-1", message.role === 'user' ? "text-right" : "")}>
                  <div className={cn(
                    "rounded-lg p-3",
                    message.role === 'user' 
                      ? "bg-primary text-primary-foreground inline-block" 
                      : "bg-muted text-foreground"
                  )}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {message.role === 'user' ? 'You' : 'AI Assistant'} • {formatTime(message.timestamp)}
                  </p>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {sendMessageMutation.isPending && (
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">AI Assistant • Thinking...</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Chat Input */}
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            className="flex-1"
            disabled={sendMessageMutation.isPending}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!input.trim() || sendMessageMutation.isPending}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour ago`;
  return date.toLocaleDateString();
}