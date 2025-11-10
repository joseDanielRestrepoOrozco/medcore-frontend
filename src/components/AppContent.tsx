import React from 'react';
import { useSidebar } from '@/components/ui/sidebar';

const AppContent: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { state, isMobile } = useSidebar();
  const paddingLeft = !isMobile
    ? state === 'expanded'
      ? 'var(--sidebar-width)'
      : 'var(--sidebar-width-icon)'
    : '0px';

  return (
    <main className="flex-1 min-h-screen bg-background max-w-dvw" style={{ paddingLeft }}>
      {children}
    </main>
  );
};

export default AppContent;
