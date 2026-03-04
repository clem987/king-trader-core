import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import Topbar from './Topbar';
import AppSidebar from './AppSidebar';
import BottomNav from '@/components/BottomNav';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col">
      <Topbar onToggleSidebar={() => setSidebarOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto">
          <div className={`mx-auto w-full ${isMobile ? 'pb-20' : ''}`} style={{ maxWidth: isMobile ? undefined : '1200px' }}>
            {children}
          </div>
        </main>
      </div>
      {isMobile && <BottomNav />}
    </div>
  );
}
