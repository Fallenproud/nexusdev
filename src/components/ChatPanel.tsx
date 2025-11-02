import React, { useEffect, useRef, useState } from 'react';
import { Send, Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNexusStore } from '@/hooks/useNexusStore';
import { ChatMessage } from './ChatMessage';
import { ModelSelector } from './ModelSelector';
import { Toaster } from '@/components/ui/sonner';
export function ChatPanel() {
  const messages = useNexusStore((state) => state.messages);
  const streamingMessage = useNexusStore((state) => state.streamingMessage);
  const isProcessing = useNexusStore((state) => state.isProcessing);
  const sendMessage = useNexusStore((state) => state.sendMessage);
  const activeSessionId = useNexusStore((state) => state.activeSessionId);
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, streamingMessage]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    sendMessage(input.trim());
    setInput('');
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  return (
    <div className="flex flex-col h-full bg-muted/50 rounded-lg border">
      <header className="flex items-center justify-between p-3 border-b">
        <h2 className="text-lg font-display font-semibold">Conversation</h2>
        <ModelSelector />
      </header>
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-6 space-y-6">
          {messages.length === 0 && !isProcessing && (
            <div className="text-center text-muted-foreground py-16 flex flex-col items-center">
              <Bot className="size-12 mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-1">Welcome to NexusDev</h3>
              <p className="max-w-md">Start a conversation to begin planning, architecting, and building your next project.</p>
            </div>
          )}
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {streamingMessage && (
            <ChatMessage
              message={{
                id: 'streaming',
                role: 'assistant',
                content: streamingMessage,
                timestamp: Date.now(),
              }}
            />
          )}
        </div>
      </ScrollArea>
      <footer className="p-4 border-t">
        <form onSubmit={handleSubmit} className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask NexusDev to do something..."
            className="w-full min-h-[48px] max-h-48 resize-none rounded-lg pr-14 pl-4 py-3 text-base bg-background"
            rows={1}
            disabled={isProcessing || !activeSessionId}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-3 top-1/2 -translate-y-1/2"
            disabled={!input.trim() || isProcessing || !activeSessionId}
          >
            {isProcessing ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Send className="size-5" />
            )}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-2">
          AI interactions may have usage limits. Built with ❤️ at Cloudflare.
        </p>
      </footer>
      <Toaster richColors closeButton theme="dark" />
    </div>
  );
}