import React, { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { NexusSidebar } from '@/components/NexusSidebar';
import { ChatPanel } from '@/components/ChatPanel';
import { ContextPanel } from '@/components/ContextPanel';
import { useNexusStore } from '@/hooks/useNexusStore';
export function HomePage() {
  const fetchSessions = useNexusStore((state) => state.fetchSessions);
  const switchSession = useNexusStore((state) => state.switchSession);
  const sessions = useNexusStore((state) => state.sessions);
  const activeSessionId = useNexusStore((state) => state.activeSessionId);
  // This effect runs once on mount to fetch the initial list of sessions.
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);
  // This effect ensures that if sessions load and there's no active one,
  // the first session is selected. It runs whenever the list of sessions
  // or the active session ID changes.
  useEffect(() => {
    if (!activeSessionId && sessions.length > 0) {
      switchSession(sessions[0].id);
    }
  }, [sessions, activeSessionId, switchSession]);
  return (
    <AppLayout>
      <div className="h-screen w-screen p-4">
        <ResizablePanelGroup direction="horizontal" className="h-full w-full rounded-lg border">
          <ResizablePanel defaultSize={75} minSize={50}>
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
                <NexusSidebar />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={75}>
                <ChatPanel />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={25} minSize={20} maxSize={30} collapsible={true} collapsedSize={0}>
            <ContextPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </AppLayout>
  );
}