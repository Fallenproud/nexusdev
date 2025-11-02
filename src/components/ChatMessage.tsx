import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import type { Message } from '../../worker/types';
import { CodeBlock } from './CodeBlock';
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
      className={cn('flex items-start gap-3 w-full', isUser ? 'justify-end' : 'justify-start')}
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
        <ReactMarkdown
          className="prose prose-sm dark:prose-invert prose-p:whitespace-pre-wrap prose-p:my-0 prose-headings:my-2 prose-ul:my-2 prose-ol:my-2 max-w-none"
          components={{
            code({ node, inline, className, children, ...props }) {
              return (
                <CodeBlock inline={inline} className={className} {...props}>
                  {children}
                </CodeBlock>
              );
            },
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
      {isUser && (
        <div className="flex-shrink-0 size-8 rounded-full bg-secondary flex items-center justify-center">
          <User className="size-5 text-secondary-foreground" />
        </div>
      )}
    </motion.div>
  );
}