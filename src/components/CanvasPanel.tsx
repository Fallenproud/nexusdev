import React from 'react';
import { useAetherStore } from '@/hooks/useAetherStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CodeBlock } from './CodeBlock';
import ReactMarkdown from 'react-markdown';
import { FileText, Code, Eye } from 'lucide-react';
export function CanvasPanel() {
  const canvasContent = useAetherStore((state) => state.canvasContent);
  const renderContent = () => {
    if (!canvasContent) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
          <Eye className="size-12 mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-foreground mb-2">AI Canvas</h3>
          <p className="max-w-md text-sm">
            Complex outputs from the AI, like documents or code snippets, will appear here.
          </p>
          <p className="text-xs mt-2">Try asking the AI to "draft a project plan in markdown".</p>
        </div>
      );
    }
    switch (canvasContent.type) {
      case 'markdown':
        return (
          <ReactMarkdown
            className="prose prose-sm dark:prose-invert prose-p:whitespace-pre-wrap p-4 max-w-none"
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
            {canvasContent.content}
          </ReactMarkdown>
        );
      case 'code':
        return <CodeBlock>{canvasContent.content}</CodeBlock>;
      default:
        return (
          <div className="p-4">
            <h4 className="font-semibold mb-2">Unsupported Content Type: {canvasContent.type}</h4>
            <pre className="text-xs bg-muted p-2 rounded-md whitespace-pre-wrap break-all">
              {canvasContent.content}
            </pre>
          </div>
        );
    }
  };
  const getHeaderInfo = () => {
    if (!canvasContent) {
      return { icon: <FileText className="size-5 text-muted-foreground" />, title: 'Canvas' };
    }
    switch (canvasContent.type) {
      case 'markdown':
        return { icon: <FileText className="size-5 text-muted-foreground" />, title: 'Markdown Document' };
      case 'code':
        return { icon: <Code className="size-5 text-muted-foreground" />, title: 'Code Snippet' };
      default:
        return { icon: <FileText className="size-5 text-muted-foreground" />, title: 'Canvas Content' };
    }
  };
  const { icon, title } = getHeaderInfo();
  return (
    <div className="flex flex-col h-full bg-muted/30">
      <header className="flex items-center gap-2 p-3 border-b">
        {icon}
        <h2 className="text-lg font-display font-semibold">{title}</h2>
      </header>
      <ScrollArea className="flex-1">{renderContent()}</ScrollArea>
    </div>
  );
}