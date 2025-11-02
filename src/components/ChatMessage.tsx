import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { renderToolCall } from '@/lib/chat';
import type { Message } from '../../worker/types';
interface ChatMessageProps {
  message: Message;
}
export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn('flex items-start gap-3', isUser ? 'justify-end' : 'justify-start')}
    >
      {!isUser && (
        <div className="flex-shrink-0 size-8 rounded-full bg-indigo flex items-center justify-center">
          <Bot className="size-5 text-indigo-foreground" />
        </div>
      )}
      <div
        className={cn(
          'max-w-md lg:max-w-2xl rounded-2xl p-4 text-sm',
          isUser
            ? 'bg-indigo text-indigo-foreground rounded-br-lg'
            : 'bg-muted text-foreground rounded-bl-lg'
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-3 pt-3 border-t border-current/20">
            <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
              <Wrench className="size-3" />
              <span>Tools used:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {message.toolCalls.map((tool, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs font-normal">
                  {renderToolCall(tool)}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 size-8 rounded-full bg-secondary flex items-center justify-center">
          <User className="size-5 text-secondary-foreground" />
        </div>
      )}
    </motion.div>
  );
}