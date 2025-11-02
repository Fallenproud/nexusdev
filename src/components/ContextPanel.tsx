import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNexusStore } from '@/hooks/useNexusStore';
import { Badge } from '@/components/ui/badge';
import { Info, Wrench, Calendar, Clock, Hash } from 'lucide-react';
import { format } from 'date-fns';
// Mocked tool definitions based on worker/tools.ts
const availableTools = [
  { name: 'get_weather', description: 'Get current weather information for a location.' },
  { name: 'web_search', description: 'Search the web or fetch content from a URL.' },
];
export function ContextPanel() {
  const activeSessionId = useNexusStore((state) => state.activeSessionId);
  const sessions = useNexusStore((state) => state.sessions);
  const activeSession = sessions.find((s) => s.id === activeSessionId);
  return (
    <div className="flex flex-col h-full bg-muted/30 p-3">
      <header className="flex items-center gap-2 pb-3 mb-3 border-b">
        <Info className="size-5 text-muted-foreground" />
        <h2 className="text-lg font-display font-semibold">Context</h2>
      </header>
      <ScrollArea className="flex-1 -mx-3">
        <div className="px-3 space-y-6">
          {activeSession ? (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Active Nexus</h3>
              <div className="text-sm space-y-2">
                <p className="font-medium text-foreground break-all">{activeSession.title}</p>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Hash className="size-3.5" />
                  <span className="font-mono text-xs truncate">{activeSession.id}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="size-3.5" />
                  <span className="text-xs">
                    Created: {format(new Date(activeSession.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="size-3.5" />
                  <span className="text-xs">
                    Last Active: {format(new Date(activeSession.lastActive), 'p')}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p className="text-sm">No active session selected.</p>
            </div>
          )}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Available Tools</h3>
            <div className="space-y-3">
              {availableTools.map((tool) => (
                <div key={tool.name} className="p-3 rounded-md bg-background/50 border">
                  <div className="flex items-center gap-2 mb-1">
                    <Wrench className="size-4 text-indigo" />
                    <p className="font-mono text-sm font-medium text-foreground">{tool.name}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{tool.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
      <footer className="pt-3 mt-3 border-t">
        <p className="text-xs text-muted-foreground text-center">
          Context-aware information panel.
        </p>
      </footer>
    </div>
  );
}