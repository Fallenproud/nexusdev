import React, { useEffect, useState, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { AetherSidebar } from '@/components/AetherSidebar';
import { ChatPanel } from '@/components/ChatPanel';
import { ContextPanel } from '@/components/ContextPanel';
import { useAetherStore } from '@/hooks/useAetherStore';
import { Button } from '@/components/ui/button';
import { PanelLeftClose, PanelRightClose } from 'lucide-react';
import { cn } from '@/lib/utils';
export function HomePage() {
  const fetchSessions = useAetherStore((state) => state.actions.fetchSessions);
  const switchSession = useAetherStore((state) => state.actions.switchSession);
  const sessions = useAetherStore((state) => state.sessions);
  const activeSessionId = useAetherStore((state) => state.activeSessionId);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const contextPanelRef = useRef<React.ElementRef<typeof ResizablePanel>>(null);
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
  const handleCollapseToggle = () => {
    if (isCollapsed) {
      contextPanelRef.current?.expand();
    } else {
      contextPanelRef.current?.collapse();
    }
  };
  return (
    <AppLayout>
      <div className="h-screen w-screen p-4 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full w-full rounded-lg border bg-black/20 backdrop-blur-md ring-1 ring-inset ring-white/10 shadow-soft-glow">
          <ResizablePanel defaultSize={75} minSize={50}>
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
                <AetherSidebar />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={75}>
                <ChatPanel />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle withHandle className="relative">
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                'absolute top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 hover:bg-background border',
                isCollapsed ? 'left-1/2 -translate-x-1/2' : 'right-1/2 translate-x-1/2'
              )}
              onClick={handleCollapseToggle}
            >
              {isCollapsed ? <PanelLeftClose className="size-4" /> : <PanelRightClose className="size-4" />}
            </Button>
          </ResizableHandle>
          <ResizablePanel
            ref={contextPanelRef}
            defaultSize={25}
            minSize={20}
            maxSize={30}
            collapsible={true}
            collapsedSize={0}
            onCollapse={() => setIsCollapsed(true)}
            onExpand={() => setIsCollapsed(false)}
          >
            <ContextPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </AppLayout>
  );
}