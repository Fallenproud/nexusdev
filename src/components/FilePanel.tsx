import React, { useEffect } from 'react';
import { useAetherStore } from '@/hooks/useAetherStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Folder, File, Loader2, ServerCrash } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
export function FilePanel() {
  const files = useAetherStore((state) => state.files);
  const fetchFiles = useAetherStore((state) => state.actions.fetchFiles);
  const activeSessionId = useAetherStore((state) => state.activeSessionId);
  const isFetchingSessions = useAetherStore((state) => state.isFetchingSessions);
  useEffect(() => {
    if (activeSessionId) {
      fetchFiles();
    }
  }, [activeSessionId, fetchFiles]);
  const fileEntries = Object.entries(files || {});
  const renderContent = () => {
    if (isFetchingSessions) {
      return (
        <div className="px-3 space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      );
    }
    if (!activeSessionId) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
          <ServerCrash className="size-10 mb-3" />
          <p className="text-sm font-medium">No Active Session</p>
          <p className="text-xs">Select a session to view its files.</p>
        </div>
      );
    }
    if (fileEntries.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
          <Folder className="size-10 mb-3" />
          <p className="text-sm font-medium">No Files</p>
          <p className="text-xs">The AI has not created any files yet.</p>
        </div>
      );
    }
    return (
      <div className="px-3 space-y-1">
        {fileEntries.map(([path]) => (
          <div key={path} className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary transition-colors">
            <File className="size-4 flex-shrink-0 text-muted-foreground" />
            <span className="text-sm font-mono truncate" title={path}>
              {path}
            </span>
          </div>
        ))}
      </div>
    );
  };
  return (
    <div className="flex flex-col h-full bg-muted/30">
      <header className="flex items-center gap-2 p-3 border-b">
        <Folder className="size-5 text-muted-foreground" />
        <h2 className="text-lg font-display font-semibold">Files</h2>
      </header>
      <ScrollArea className="flex-1 py-3">{renderContent()}</ScrollArea>
    </div>
  );
}