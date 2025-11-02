import React, { useState, useRef, useEffect } from 'react';
import { Plus, MessageSquare, Trash2, Loader2, Pencil, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNexusStore } from '@/hooks/useNexusStore';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
export function NexusSidebar() {
  const sessions = useNexusStore((state) => state.sessions);
  const activeSessionId = useNexusStore((state) => state.activeSessionId);
  const isLoading = useNexusStore((state) => state.isLoading);
  const createSession = useNexusStore((state) => state.createSession);
  const switchSession = useNexusStore((state) => state.switchSession);
  const deleteSession = useNexusStore((state) => state.deleteSession);
  const updateSessionTitle = useNexusStore((state) => state.updateSessionTitle);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (editingSessionId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingSessionId]);
  const handleStartEditing = (session: { id: string; title: string }) => {
    setEditingSessionId(session.id);
    setNewTitle(session.title);
  };
  const handleSaveTitle = () => {
    if (editingSessionId && newTitle.trim()) {
      updateSessionTitle(editingSessionId, newTitle.trim());
    }
    setEditingSessionId(null);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setEditingSessionId(null);
    }
  };
  return (
    <div className="flex flex-col h-full bg-muted/30 p-3">
      <header className="flex items-center justify-between pb-3 mb-3 border-b">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-indigo flex items-center justify-center">
            <div className="size-4 bg-indigo-foreground rounded-sm" />
          </div>
          <h1 className="text-xl font-display font-bold">NexusDev</h1>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="gap-1"
          onClick={() => createSession()}
        >
          <Plus className="size-4" />
          New
        </Button>
      </header>
      <ScrollArea className="flex-1 -mx-3">
        <div className="px-3 space-y-1">
          {isLoading && sessions.length === 0 ? (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={cn(
                  'group flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors',
                  activeSessionId === session.id
                    ? 'bg-indigo/20 text-indigo'
                    : 'hover:bg-secondary'
                )}
                onClick={() => editingSessionId !== session.id && switchSession(session.id)}
              >
                {editingSessionId === session.id ? (
                  <div className="flex items-center gap-2 w-full">
                    <Input
                      ref={inputRef}
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onBlur={handleSaveTitle}
                      onKeyDown={handleKeyDown}
                      className="h-7 text-sm"
                    />
                    <Button size="icon" variant="ghost" className="size-6" onClick={handleSaveTitle}>
                      <Check className="size-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 truncate">
                      <MessageSquare className="size-4 flex-shrink-0" />
                      <span className="text-sm truncate">{session.title}</span>
                    </div>
                    <div className="flex items-center">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEditing(session);
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      <footer className="pt-3 mt-3 border-t">
        <p className="text-xs text-muted-foreground text-center">
          Vibe-coding Platform
        </p>
      </footer>
    </div>
  );
}