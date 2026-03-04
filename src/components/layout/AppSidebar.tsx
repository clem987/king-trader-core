import { Home, Crosshair, BookOpen, BarChart3, Settings, Layers, ChevronRight, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';

const mainNav = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Crosshair, label: 'Session MODE™', path: '/session' },
  { icon: BookOpen, label: 'Journal', path: '/journal' },
  { icon: BarChart3, label: 'Stats', path: '/stats' },
];

const secondaryNav = [
  { icon: Layers, label: 'Stratégies', path: '/strategies' },
  { icon: Settings, label: 'Réglages', path: '/settings' },
];

interface AppSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function AppSidebar({ open, onClose }: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useProfile();
  const isMobile = useIsMobile();

  const handleNav = (path: string) => {
    navigate(path);
    if (isMobile) onClose();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full w-[240px] bg-sidebar border-r border-sidebar-border">
      {/* Mobile close */}
      {isMobile && (
        <div className="flex items-center justify-end p-3">
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase px-3 mb-2">Navigation</p>
        {mainNav.map(item => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="font-display text-[13px]">{item.label}</span>
            </button>
          );
        })}

        <div className="pt-4">
          <p className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase px-3 mb-2">Configuration</p>
          {secondaryNav.map(item => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="font-display text-[13px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Upsell */}
      <div className="px-3 pb-4">
        <div className="glass-card p-3 rounded-xl">
          <p className="text-[10px] text-muted-foreground font-medium">
            Plan Free · 0/5 sessions
          </p>
          <div className="h-1 rounded-full bg-muted mt-2 overflow-hidden">
            <div className="h-full rounded-full bg-primary w-0" />
          </div>
          <button
            onClick={() => handleNav('/pricing')}
            className="flex items-center gap-1 text-[11px] font-display font-bold text-primary mt-2.5 hover:underline"
          >
            Passer à Pro
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );

  // Desktop: always visible
  if (!isMobile) {
    return <aside className="hidden lg:block shrink-0">{sidebarContent}</aside>;
  }

  // Mobile: overlay
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: -240 }}
            animate={{ x: 0 }}
            exit={{ x: -240 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 z-[70]"
          >
            {sidebarContent}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
