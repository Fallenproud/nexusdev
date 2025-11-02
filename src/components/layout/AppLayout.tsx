import React, { useEffect } from 'react';
import { useAetherStore } from '@/hooks/useAetherStore';
import { ThemeToggle } from '@/components/ThemeToggle';
type AppLayoutProps = {
  children: React.ReactNode;
  className?: string;
};
export function AppLayout({ children, className }: AppLayoutProps): JSX.Element {
  const activeSessionId = useAetherStore((state) => state.activeSessionId);
  const actions = useAetherStore((state) => state.actions);

  useEffect(() => {
    if (!activeSessionId) {
      actions.createSession();
    }
  }, [activeSessionId, actions]);

  return (
    <div className={className}>
      <ThemeToggle className="absolute top-4 right-4 z-50" />
      {children}
    </div>
  );
}