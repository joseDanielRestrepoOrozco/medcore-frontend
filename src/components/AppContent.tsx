import React from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';

const AppContent: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { token } = useAuth();
  const showSidebar = !!token;

  if (showSidebar) {
    // Use SidebarInset to align with shadcn Sidebar gap (avoids double spacing)
    return (
      <SidebarInset className="flex-1 min-h-screen bg-background max-w-dvw">
        {children}
      </SidebarInset>
    );
  }

  // No sidebar (logged out): center content
  return (
    <main className="flex-1 min-h-screen bg-background max-w-dvw mx-auto max-w-4xl text-center">
      {children}
    </main>
  );
};

export default AppContent;
