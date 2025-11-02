import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { Send, Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAetherStore } from '@/hooks/useAetherStore';
import { ChatMessage } from './ChatMessage';
import { ModelSelector } from './ModelSelector';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
export function ChatPanel() {
  const messages = useAetherStore((state) => state.messages);
  const streamingMessage = useAetherStore((state) => state.streamingMessage);
  const isProcessing = useAetherStore((state) => state.isProcessing);
  const sendMessage = useAetherStore((state) => state.actions.sendMessage);
  const activeSessionId = useAetherStore((state) => state.activeSessionId);
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const examplePrompts = [
    'Plan a new feature for a SaaS app',
    'Write a React component for a login form',
    'Explain the difference between REST and GraphQL',
    'Draft an email to my team about a deadline',
  ];
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [input]);
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
  const handleExamplePromptClick = (prompt: string) => {
    setInput(prompt);
    textareaRef.current?.focus();
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
              <h3 className="text-lg font-semibold text-foreground mb-2">Welcome to AetherCode</h3>
              <p className="max-w-md mb-6">Start a conversation or try one of these examples to begin.</p>
              <div className="flex flex-wrap justify-center gap-2 max-w-md">
                {examplePrompts.map((prompt) => (
                  <Badge
                    key={prompt}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary/20 transition-all transform hover:-translate-y-0.5"
                    onClick={() => handleExamplePromptClick(prompt)}
                  >
                    {prompt}
                  </Badge>
                ))}
              </div>
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
        <form
          onSubmit={handleSubmit}
          className={cn(
            'relative rounded-lg border border-border transition-shadow',
            'focus-within:border-primary focus-within:shadow-primary focus-within:animate-glow-border'
          )}
        >
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AetherCode to do something..."
            className="w-full min-h-[48px] max-h-48 resize-none rounded-lg pr-14 pl-4 py-3 text-base bg-background border-none focus-visible:ring-0 focus-visible:ring-offset-0"
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