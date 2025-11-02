import React, { useState } from 'react';
import { useAetherStore } from '@/hooks/useAetherStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, MessageSquare, Trash2, Edit3, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Logo } from './Logo';
export function AetherSidebar() {
  const sessions = useAetherStore((state) => state.sessions);
  const activeSessionId = useAetherStore((state) => state.activeSessionId);
  const { createSession, switchSession, deleteSession, updateSessionTitle } = useAetherStore(
    (state) => state.actions
  );
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
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
        <div className="px-3 space-y-1">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={cn(
                'group flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors',
                activeSessionId === session.id
                  ? 'bg-primary/20 text-primary'
                  : 'hover:bg-secondary'
              )}
              onClick={() => switchSession(session.id)}
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
      </ScrollArea>
    </div>
  );
}