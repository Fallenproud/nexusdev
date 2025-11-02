import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wrench, CheckCircle2, XCircle, BrainCircuit } from 'lucide-react';
import type { ToolCall, WeatherResult, MCPResult, ErrorResult } from '../../worker/types';
interface ToolCallBadgeProps {
  toolCall: ToolCall;
}
const getToolInfo = (toolCall: ToolCall): { icon: React.ReactNode; text: string; variant: 'secondary' | 'destructive' } => {
  const result = toolCall.result as WeatherResult | MCPResult | ErrorResult | undefined;
  if (!result) {
    return {
      icon: <Wrench className="size-3" />,
      text: `${toolCall.name}: No result`,
      variant: 'secondary',
    };
  }
  if ('error' in result && result.error) {
    return {
      icon: <XCircle className="size-3" />,
      text: `${toolCall.name}: Failed`,
      variant: 'destructive',
    };
  }
  if (toolCall.name === 'get_weather') {
    const weather = result as WeatherResult;
    return {
      icon: <CheckCircle2 className="size-3" />,
      text: `Weather in ${weather.location}`,
      variant: 'secondary',
    };
  }
  if (toolCall.name === 'web_search') {
    const args = toolCall.arguments as { query?: string; url?: string };
    const searchText = args.query ? `"${args.query}"` : args.url;
    return {
      icon: <CheckCircle2 className="size-3" />,
      text: `Searched ${searchText}`,
      variant: 'secondary',
    };
  }
  return {
    icon: <CheckCircle2 className="size-3" />,
    text: `${toolCall.name}: Success`,
    variant: 'secondary',
  };
};
export function ToolCallBadge({ toolCall }: ToolCallBadgeProps) {
  const { icon, text, variant } = getToolInfo(toolCall);
  return (
    <Badge variant={variant} className="text-xs font-normal gap-1.5 items-center py-1">
      {icon}
      <span>{text}</span>
    </Badge>
  );
}