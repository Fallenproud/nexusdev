import React from 'react';
import { Wrench, CheckCircle2, XCircle, Search, Thermometer, FileText } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import type { ToolCall, WeatherResult, MCPResult, ErrorResult } from '../../worker/types';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { CodeBlock } from './CodeBlock';
interface ToolCallResultProps {
  toolCall: ToolCall;
}
const getToolInfo = (toolCall: ToolCall) => {
  const result = toolCall.result as WeatherResult | MCPResult | ErrorResult | undefined;
  const isError = result && 'error' in result && !!result.error;
  let icon = <Wrench className="size-4" />;
  if (toolCall.name.includes('search')) icon = <Search className="size-4" />;
  if (toolCall.name.includes('weather')) icon = <Thermometer className="size-4" />;
  const statusIcon = isError ? (
    <XCircle className="size-4 text-destructive" />
  ) : (
    <CheckCircle2 className="size-4 text-green-500" />
  );
  return { isError, icon, statusIcon, result };
};
export function ToolCallResult({ toolCall }: ToolCallResultProps) {
  const { isError, icon, statusIcon, result } = getToolInfo(toolCall);
  const renderResult = () => {
    if (!result) {
      return <p className="text-xs text-muted-foreground">No result returned.</p>;
    }
    if (isError) {
      return <p className="text-xs text-destructive">{(result as ErrorResult).error}</p>;
    }
    if (toolCall.name === 'get_weather') {
      const weather = result as WeatherResult;
      return (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="font-semibold">Location:</div><div>{weather.location}</div>
          <div className="font-semibold">Temp:</div><div>{weather.temperature}°C</div>
          <div className="font-semibold">Condition:</div><div>{weather.condition}</div>
          <div className="font-semibold">Humidity:</div><div>{weather.humidity}%</div>
        </div>
      );
    }
    if ('content' in result) {
      const content = (result as MCPResult).content;
      return (
        <ReactMarkdown
          className="prose prose-xs dark:prose-invert max-w-none"
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
          {content}
        </ReactMarkdown>
      );
    }
    return <pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify(result, null, 2)}</pre>;
  };
  return (
    <div className={cn('p-3 rounded-md border bg-background/50', isError ? 'border-destructive/50' : 'border-border')}>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1" className="border-b-0">
          <AccordionTrigger className="p-0 hover:no-underline">
            <div className="flex items-center gap-2 text-xs font-semibold">
              {statusIcon}
              {icon}
              <span className="font-mono">{toolCall.name}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-3 pb-0">
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground">Arguments:</h4>
              <pre className="text-xs bg-muted/50 p-2 rounded-md whitespace-pre-wrap break-all">
                {JSON.stringify(toolCall.arguments, null, 2)}
              </pre>
              <h4 className="text-xs font-semibold text-muted-foreground">Result:</h4>
              <div className="text-xs p-2 rounded-md bg-muted/50">{renderResult()}</div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}