import React, { useEffect, useState, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { AetherSidebar } from '@/components/AetherSidebar';
import { ChatPanel } from '@/components/ChatPanel';
import { ContextPanel } from '@/components/ContextPanel';
import { useAetherStore } from '@/hooks/useAetherStore';
import { Button } from '@/components/ui/button';
import { PanelLeftClose, PanelRightClose, PanelLeftOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
export function HomePage() {
  const fetchSessions = useAetherStore((state) => state.actions.fetchSessions);
  const switchSession = useAetherStore((state) => state.actions.switchSession);
  const sessions = useAetherStore((state) => state.sessions);
  const activeSessionId = useAetherStore((state) => state.activeSessionId);
  const [panelCollapseState, setPanelCollapseState] = useState({
    sidebar: false,
    context: false,
  });
  const contextPanelRef = useRef<React.ElementRef<typeof ResizablePanel>>(null);
  const sidebarPanelRef = useRef<React.ElementRef<typeof ResizablePanel>>(null);
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);
  useEffect(() => {
    if (!activeSessionId && sessions.length > 0) {
      switchSession(sessions[0].id);
    }
  }, [sessions, activeSessionId, switchSession]);
  const handleContextCollapseToggle = () => {
    if (panelCollapseState.context) {
      contextPanelRef.current?.expand();
    } else {
      contextPanelRef.current?.collapse();
    }
  };
  const handleSidebarCollapseToggle = () => {
    if (panelCollapseState.sidebar) {
      sidebarPanelRef.current?.expand();
    } else {
      sidebarPanelRef.current?.collapse();
    }
  };
  return (
    <AppLayout>
      <div className="h-screen w-screen p-4 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full w-full rounded-lg border bg-black/20 backdrop-blur-md ring-1 ring-inset ring-white/10 shadow-soft-glow">
          <ResizablePanel
            ref={sidebarPanelRef}
            defaultSize={25}
            minSize={20}
            maxSize={30}
            collapsible={true}
            collapsedSize={4}
            onCollapse={() => setPanelCollapseState((prev) => ({ ...prev, sidebar: true }))}
            onExpand={() => setPanelCollapseState((prev) => ({ ...prev, sidebar: false }))}
            className={cn(panelCollapseState.sidebar && 'min-w-[50px] transition-all duration-300 ease-in-out')}
          >
            <AetherSidebar isCollapsed={panelCollapseState.sidebar} />
          </ResizablePanel>
          <ResizableHandle withHandle className="relative">
             <Button
              size="icon"
              variant="ghost"
              className={cn(
                'absolute top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 hover:bg-background border',
                panelCollapseState.sidebar ? 'right-1/2 translate-x-1/2' : 'left-1/2 -translate-x-1/2'
              )}
              onClick={handleSidebarCollapseToggle}
            >
              {panelCollapseState.sidebar ? <PanelRightClose className="size-4" /> : <PanelLeftClose className="size-4" />}
            </Button>
          </ResizableHandle>
          <ResizablePanel defaultSize={50} minSize={30}>
            <ChatPanel />
          </ResizablePanel>
          <ResizableHandle withHandle className="relative">
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                'absolute top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 hover:bg-background border',
                panelCollapseState.context ? 'left-1/2 -translate-x-1/2' : 'right-1/2 translate-x-1/2'
              )}
              onClick={handleContextCollapseToggle}
            >
              {panelCollapseState.context ? <PanelLeftOpen className="size-4" /> : <PanelRightClose className="size-4" />}
            </Button>
          </ResizableHandle>
          <ResizablePanel
            ref={contextPanelRef}
            defaultSize={25}
            minSize={20}
            maxSize={30}
            collapsible={true}
            collapsedSize={0}
            onCollapse={() => setPanelCollapseState((prev) => ({ ...prev, context: true }))}
            onExpand={() => setPanelCollapseState((prev) => ({ ...prev, context: false }))}
          >
            <ContextPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </AppLayout>
  );
}