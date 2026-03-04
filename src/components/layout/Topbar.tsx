import { Crown, Flame, Menu } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth';

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Session', path: '/session' },
  { label: 'Journal', path: '/journal' },
  { label: 'Stats', path: '/stats' },
];

interface TopbarProps {
  onToggleSidebar?: () => void;
}

export default function Topbar({ onToggleSidebar }: TopbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useProfile();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-xl flex items-center px-4 lg:px-6 sticky top-0 z-50">
      {/* Left — Logo */}
      <div className="flex items-center gap-3 min-w-[180px]">
        {isMobile && (
          <button onClick={onToggleSidebar} className="p-1.5 rounded-lg hover:bg-muted transition-colors mr-1">
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg glow-button flex items-center justify-center">
            <Crown className="w-4 h-4" />
          </div>
          {!isMobile && (
            <span className="font-display font-bold text-sm tracking-tight">
              KING <span className="text-gradient">TRADER</span>
            </span>
          )}
        </button>
      </div>

      {/* Center — Nav (desktop) */}
      {!isMobile && (
        <nav className="flex-1 flex items-center justify-center gap-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-4 py-1.5 rounded-lg text-xs font-display font-semibold transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      )}

      {/* Right — Streak + Plan + Avatar */}
      <div className="flex items-center gap-2 min-w-[180px] justify-end">
        <div className="chip text-[11px]">
          <Flame className="w-3 h-3" />
          <span className="font-mono-num">{profile?.streak || 0}j</span>
        </div>
        <div className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border">
          Free
        </div>
        <Avatar className="w-7 h-7 cursor-pointer" onClick={() => navigate('/settings')}>
          <AvatarFallback className="bg-card text-[10px] font-bold text-muted-foreground border border-border">
            {(profile?.username || user?.email || 'U')[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
