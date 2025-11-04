import { type ReactNode, useState } from 'react';
import LayoutNavbar from './Navbar';
import LayoutSidebar from './Sidebar';

export default function AppLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LayoutNavbar onToggleSidebar={() => setOpen(v => !v)} />
      <div className="flex">
        <LayoutSidebar open={open} onClose={() => setOpen(false)} />
        <main className="flex-1 px-4 sm:px-6 md:px-8 py-4 md:ml-64">{children}</main>
      </div>
    </div>
  );
}
