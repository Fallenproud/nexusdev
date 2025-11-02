import React, { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { NexusSidebar } from '@/components/NexusSidebar';
import { ChatPanel } from '@/components/ChatPanel';
import { useNexusStore } from '@/hooks/useNexusStore';
export function HomePage() {
  const fetchSessions = useNexusStore((state) => state.fetchSessions);
  const switchSession = useNexusStore((state) => state.switchSession);
  const sessions = useNexusStore((state) => state.sessions);
  const activeSessionId = useNexusStore((state) => state.activeSessionId);
  useEffect(() => {
    const initialize = async () => {
      await fetchSessions();
      // After fetching, if there's no active session but there are sessions available,
      // switch to the first one.
      if (!activeSessionId && sessions.length > 0) {
        switchSession(sessions[0].id);
      }
    };
    initialize();
  }, [fetchSessions]); // Only run on mount
  // This effect ensures that if sessions load and there's no active one, the first is selected.
  useEffect(() => {
    if (!activeSessionId && sessions.length > 0) {
      switchSession(sessions[0].id);
    }
  }, [sessions, activeSessionId, switchSession]);
  return (
    <AppLayout>
      <div className="h-screen w-screen p-4">
        <ResizablePanelGroup direction="horizontal" className="h-full w-full rounded-lg border">
          <ResizablePanel defaultSize={20} minSize={15} maxSize={25}>
            <NexusSidebar />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={80}>
            <ChatPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </AppLayout>
  );
}