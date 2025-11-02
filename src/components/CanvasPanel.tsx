import React, { useState, useEffect } from 'react';
import { useAetherStore } from '@/hooks/useAetherStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CodeBlock } from './CodeBlock';
import ReactMarkdown from 'react-markdown';
import { FileText, Code, Eye, GitMerge, Edit, Save, X } from 'lucide-react';
import { MermaidDiagram } from './MermaidDiagram';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
export function CanvasPanel() {
  const canvasContent = useAetherStore((state) => state.canvasContent);
  const setCanvasContent = useAetherStore((state) => state.actions.setCanvasContent);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  useEffect(() => {
    if (canvasContent) {
      setEditedContent(canvasContent.content);
    } else {
      setEditedContent('');
    }
  }, [canvasContent]);
  const handleSave = () => {
    if (canvasContent) {
      setCanvasContent({ ...canvasContent, content: editedContent });
      setIsEditing(false);
      toast.success('Canvas content saved.');
    }
  };
  const handleCancel = () => {
    if (canvasContent) {
      setEditedContent(canvasContent.content);
    }
    setIsEditing(false);
  };
  const renderContent = () => {
    if (!canvasContent) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
          <Eye className="size-12 mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-foreground mb-2">AI Canvas</h3>
          <p className="max-w-md text-sm">
            Complex outputs from the AI, like documents or code snippets, will appear here.
          </p>
          <p className="text-xs mt-2">Try asking the AI to "generate a flowchart for a user login process".</p>
        </div>
      );
    }
    if (isEditing) {
      return (
        <Textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="w-full h-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-mono text-sm"
        />
      );
    }
    switch (canvasContent.contentType) {
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
      case 'mermaid':
        return <MermaidDiagram chart={canvasContent.content} />;
      default:
        return (
          <div className="p-4">
            <h4 className="font-semibold mb-2">Unsupported Content Type: {canvasContent.contentType}</h4>
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
    switch (canvasContent.contentType) {
      case 'markdown':
        return { icon: <FileText className="size-5 text-muted-foreground" />, title: 'Markdown Document' };
      case 'code':
        return { icon: <Code className="size-5 text-muted-foreground" />, title: 'Code Snippet' };
      case 'mermaid':
        return { icon: <GitMerge className="size-5 text-muted-foreground" />, title: 'Mermaid Diagram' };
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
        <div className="ml-auto">
          {isEditing ? (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSave}>
                <Save className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCancel}>
                <X className="size-4" />
              </Button>
            </div>
          ) : (
            canvasContent && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditing(true)}>
                <Edit className="size-4" />
              </Button>
            )
          )}
        </div>
      </header>
      <ScrollArea className="flex-1">{renderContent()}</ScrollArea>
    </div>
  );
}