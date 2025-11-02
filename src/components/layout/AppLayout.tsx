import React from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
type AppLayoutProps = {
  children: React.ReactNode;
  className?: string;
};
export function AppLayout({ children, className }: AppLayoutProps): JSX.Element {
  return (
    <div className={className}>
      <ThemeToggle className="absolute top-4 right-4 z-50" />
      {children}
    </div>
  );
}