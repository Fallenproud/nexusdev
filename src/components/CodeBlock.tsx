'use client';
import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';
interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
}
export function CodeBlock({ inline, className, children }: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const codeString = String(children).replace(/\n$/, '');
  const handleCopy = () => {
    navigator.clipboard.writeText(codeString).then(
      () => {
        setIsCopied(true);
        toast.success('Code copied to clipboard!');
        setTimeout(() => setIsCopied(false), 2000);
      },
      () => {
        toast.error('Failed to copy code.');
      }
    );
  };
  if (inline) {
    return (
      <code className="bg-muted text-foreground font-mono text-sm px-1 py-0.5 rounded-sm">
        {children}
      </code>
    );
  }
  return (
    <div className="relative my-2 bg-[#1e1e1e] rounded-lg overflow-hidden border">
      <div className="flex items-center justify-between px-4 py-1 bg-muted/50 border-b">
        <span className="text-xs text-muted-foreground">{match ? match[1] : 'code'}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleCopy}
          disabled={isCopied}
        >
          {isCopied ? (
            <Check className="size-4 text-green-500" />
          ) : (
            <Copy className="size-4" />
          )}
          <span className="sr-only">Copy code</span>
        </Button>
      </div>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={match ? match[1] : undefined}
        PreTag="div"
        customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
        codeTagProps={{ style: { fontFamily: 'var(--font-mono)' } }}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
}