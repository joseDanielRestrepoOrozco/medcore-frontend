import { cn } from '@/lib/utils';
import { Home, Mail, Settings } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';

const nav = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/ruteo', label: 'Ruteo', icon: Mail },
  { to: '/configuraciones', label: 'Configuraciones', icon: Settings },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  return (
    <>
      <aside
        className="hidden md:flex md:fixed md:left-0 md:top-14 md:z-30 md:h-[calc(100vh-56px)] md:w-64 md:flex-col md:border-r"
        style={{ background: 'var(--sidebar-bg)' }}
      >
        <NavContent activePath={location.pathname} />
      </aside>

      <Sheet open={open} onOpenChange={(v) => (!v ? onClose() : undefined)}>
        <SheetContent side="left" className="p-0" style={{ background: 'var(--sidebar-bg)' }}>
          <div className="pt-4" />
          <NavContent activePath={location.pathname} onItemClick={onClose} />
        </SheetContent>
      </Sheet>
    </>
  );
}

function NavContent({ activePath, onItemClick }: { activePath: string; onItemClick?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {nav.map((item) => {
        const Icon = item.icon;
        const active = activePath === item.to;
        return (
          <Link key={item.to} to={item.to} onClick={onItemClick}>
            <Button variant={active ? 'secondary' : 'ghost'} className={cn('w-full justify-start', active && 'font-semibold')}>
              <Icon className="mr-2 size-4" />
              {item.label}
            </Button>
          </Link>
        );
      })}
    </nav>
  );
}

export default Sidebar;
