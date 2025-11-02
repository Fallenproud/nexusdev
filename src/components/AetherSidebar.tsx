import React, { useState } from 'react';
import { useAetherStore } from '@/hooks/useAetherStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, MessageSquare, Trash2, Edit3, Check, X, Bot, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Logo } from './Logo';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { ModelSelector } from './ModelSelector';
import { toast } from 'sonner';
import type { Message } from '../../worker/types';
interface AetherSidebarProps {
  isCollapsed: boolean;
  onSessionChange?: () => void;
  showModelSelector?: boolean;
}
const formatMessageForExport = (message: Message): string => {
  const author = message.role === 'user' ? 'You' : 'AetherCode';
  const timestamp = new Date(message.timestamp).toLocaleString();
  let content = message.content;
  if (message.toolCalls && message.toolCalls.length > 0) {
    const toolDetails = message.toolCalls
      .map((tc) => {
        const args = JSON.stringify(tc.arguments, null, 2);
        return `\n<details><summary>Tool Call: \`${tc.name}\`</summary>\n\n\`\`\`json\n${args}\n\`\`\`\n\n</details>`;
      })
      .join('');
    content += toolDetails;
  }
  return `**${author}** (${timestamp}):\n\n${content}\n\n---\n\n`;
};
export function AetherSidebar({ isCollapsed, onSessionChange, showModelSelector }: AetherSidebarProps) {
  const sessions = useAetherStore((state) => state.sessions);
  const activeSessionId = useAetherStore((state) => state.activeSessionId);
  const messages = useAetherStore((state) => state.messages);
  const isFetchingSessions = useAetherStore((state) => state.isFetchingSessions);
  const { createSession, switchSession, deleteSession, updateSessionTitle } = useAetherStore(
    (state) => state.actions
  );
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const handleSwitchSession = (sessionId: string) => {
    switchSession(sessionId);
    onSessionChange?.();
  };
  const handleEdit = (sessionId: string, currentTitle: string) => {
    setEditingSessionId(sessionId);
    setNewTitle(currentTitle);
  };
  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setNewTitle('');
  };
  const handleSaveTitle = (sessionId: string) => {
    if (newTitle.trim()) {
      updateSessionTitle(sessionId, newTitle.trim());
      handleCancelEdit();
    }
  };
  const handleExportChat = () => {
    const activeSession = sessions.find((s) => s.id === activeSessionId);
    if (!activeSession || messages.length === 0) {
      toast.error('No active chat to export.');
      return;
    }
    const markdownContent = `# Chat with AetherCode: ${activeSession.title}\n\n${messages
      .map(formatMessageForExport)
      .join('')}`;
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSession.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Chat exported successfully.');
  };
  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <div className="flex flex-col h-full bg-muted/30 p-2 items-center">
          <header className="pb-3 mb-3 border-b border-border/50">
            <Logo />
          </header>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="w-9 h-9 mb-3" onClick={() => createSession()}>
                <Plus className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">New Session</TooltipContent>
          </Tooltip>
          <ScrollArea className="flex-1 w-full">
            <div className="space-y-1">
              {isFetchingSessions ? (
                <div className="space-y-1">
                  <Skeleton className="w-9 h-9 rounded-md" />
                  <Skeleton className="w-9 h-9 rounded-md" />
                  <Skeleton className="w-9 h-9 rounded-md" />
                </div>
              ) : (
                sessions.map((session) => (
                  <Tooltip key={session.id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={activeSessionId === session.id ? 'secondary' : 'ghost'}
                        size="icon"
                        className="w-9 h-9"
                        onClick={() => handleSwitchSession(session.id)}
                      >
                        <MessageSquare className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">{session.title}</TooltipContent>
                  </Tooltip>
                ))
              )}
            </div>
          </ScrollArea>
          <footer className="mt-auto pt-2 border-t border-border/50">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="w-9 h-9" onClick={handleExportChat}>
                  <Download className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Export Chat</TooltipContent>
            </Tooltip>
          </footer>
        </div>
      </TooltipProvider>
    );
  }
  return (
    <div className="flex flex-col h-full bg-muted/30 p-3">
      <header className="pb-3 mb-3 border-b">
        <Logo />
      </header>
      <Button
        variant="outline"
        className="w-full gap-2 mb-3 bg-background/50 hover:bg-background"
        onClick={() => createSession()}
      >
        <Plus className="size-4" />
        New Session
      </Button>
      <ScrollArea className="flex-1 -mx-3">
        {isFetchingSessions ? (
          <div className="px-3 space-y-1">
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
            <Bot className="size-10 mb-3" />
            <p className="text-sm font-medium">No sessions yet.</p>
            <p className="text-xs">Click "New Session" to start a conversation.</p>
          </div>
        ) : (
          <div className="px-3 space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={cn(
                  'group flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors',
                  activeSessionId === session.id ? 'bg-primary/20 text-primary' : 'hover:bg-secondary'
                )}
                onClick={() => handleSwitchSession(session.id)}
              >
                <div className="flex items-start gap-2 overflow-hidden">
                  <MessageSquare className="size-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 overflow-hidden">
                    {editingSessionId === session.id ? (
                      <Input
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveTitle(session.id);
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        className="h-6 text-sm px-1"
                        autoFocus
                        onBlur={() => handleSaveTitle(session.id)}
                      />
                    ) : (
                      <p className="text-sm font-medium truncate">{session.title}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(session.lastActive), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {editingSessionId === session.id ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveTitle(session.id);
                        }}
                      >
                        <Check className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelEdit();
                        }}
                      >
                        <X className="size-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(session.id, session.title);
                        }}
                      >
                        <Edit3 className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive/80 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
      <footer className="mt-auto pt-3 border-t space-y-2">
        {showModelSelector && <ModelSelector />}
        <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground" onClick={handleExportChat}>
          <Download className="size-4" />
          Export Chat
        </Button>
      </footer>
    </div>
  );
}