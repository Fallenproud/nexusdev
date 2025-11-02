import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import type { Message } from '../../worker/types';
import { CodeBlock } from './CodeBlock';
import { ToolCallResult } from './ToolCallResult';
interface ChatMessageProps {
  message: Message;
}
export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 5, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -5, scale: 0.98 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn('flex items-start gap-3 w-full', isUser ? 'justify-end' : 'justify-start')}
    >
      {!isUser && (
        <div className="flex-shrink-0 size-8 rounded-full bg-primary flex items-center justify-center">
          <Bot className="size-5 text-primary-foreground" />
        </div>
      )}
      <div
        className={cn(
          'flex flex-col max-w-md lg:max-w-2xl rounded-2xl p-4 text-sm',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-lg'
            : 'bg-muted text-foreground rounded-bl-lg'
        )}
      >
        <ReactMarkdown
          className="prose prose-sm dark:prose-invert prose-p:whitespace-pre-wrap prose-p:my-0 prose-headings:my-2 prose-ul:my-2 prose-ol:my-2 max-w-none"
          components={{
            code({ inline, className, children, ...props }: React.ComponentPropsWithoutRef<'code'> & { inline?: boolean }) {
              return (
                <CodeBlock inline={inline} className={className}>
                  {String(children)}
                </CodeBlock>
              );
            },
          }}
        >
          {message.content}
        </ReactMarkdown>
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-3 pt-3 border-t border-current/20 space-y-3">
            {message.toolCalls.map((tool, idx) => (
              <ToolCallResult key={tool.id || idx} toolCall={tool} />
            ))}
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