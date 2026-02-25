import { Home, BookOpen, BarChart3, Settings, Crosshair } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const navItems = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: BookOpen, label: 'Journal', path: '/journal' },
  { icon: Crosshair, label: 'Session', path: '/session', isCenter: true },
  { icon: BarChart3, label: 'Stats', path: '/stats' },
  { icon: Settings, label: 'Réglages', path: '/settings' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="nav-glass fixed bottom-0 left-0 right-0 z-50 safe-area-bottom" style={{ borderRadius: '20px 20px 0 0' }}>
      <div className="flex items-center justify-around max-w-md mx-auto px-6 py-2.5 pb-5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="relative -mt-6"
              >
                <div className="glow-button w-14 h-14 rounded-full flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
              </button>
            );
          }

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-1 py-1 px-3 relative"
            >
              <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-[10px] font-semibold tracking-wider transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-1 w-1 h-1 rounded-full bg-primary"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
