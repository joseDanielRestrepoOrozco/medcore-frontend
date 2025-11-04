import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

export function Navbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b" style={{ background: 'var(--navbar-bg)' }}>
      <div className="flex h-14 items-center justify-between px-3 sm:px-4">
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={onToggleSidebar} aria-label="Abrir menú">
            <Menu className="size-5" />
          </Button>
        </div>
        <div className="font-semibold text-slate-900">Monitoreo de Emails</div>
        <div className="flex items-center gap-2"></div>
      </div>
    </header>
  );
}

export default Navbar;
