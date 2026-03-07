import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface StreakFlameProps {
  streak: number;
  lastSessionDate?: string | null;
  bestStreak?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function StreakFlame({ streak, lastSessionDate, bestStreak = 0, showLabel = true, size = 'md' }: StreakFlameProps) {
  const { t } = useTranslation();
  const [isDanger, setIsDanger] = useState(false);
  const [isBroken, setIsBroken] = useState(false);

  // Check if streak is in danger (no session in last 20h)
  useEffect(() => {
    if (!lastSessionDate || streak === 0) {
      setIsDanger(false);
      return;
    }
    const lastDate = new Date(lastSessionDate);
    const now = new Date();
    const hoursSince = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);
    setIsDanger(hoursSince >= 20 && hoursSince < 48);
    setIsBroken(hoursSince >= 48);
  }, [lastSessionDate, streak]);

  // Scale flame size based on streak
  const baseSize = size === 'sm' ? 24 : size === 'md' ? 36 : 48;
  const scale = Math.min(1 + (streak * 0.05), 1.8);
  const flameSize = baseSize * scale;

  const textSize = size === 'sm' ? 'text-sm' : size === 'md' ? 'text-xl' : 'text-3xl';
  const labelSize = size === 'sm' ? 'text-[9px]' : size === 'md' ? 'text-[10px]' : 'text-xs';

  return (
    <div className="flex flex-col items-center gap-1">
      <AnimatePresence mode="wait">
        {isBroken ? (
          <motion.div
            key="broken"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 0, opacity: 0, rotate: -30 }}
            transition={{ duration: 0.8 }}
            style={{ fontSize: flameSize }}
            className="leading-none"
          >
            🔥
          </motion.div>
        ) : (
          <motion.div
            key="flame"
            animate={isDanger ? {
              scale: [1, 1.15, 1],
              opacity: [1, 0.6, 1],
            } : {}}
            transition={isDanger ? { repeat: Infinity, duration: 2 } : {}}
            style={{ fontSize: flameSize }}
            className={`leading-none ${isDanger ? 'drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]' : streak > 0 ? 'drop-shadow-[0_0_12px_rgba(249,115,22,0.5)]' : 'opacity-30'}`}
          >
            🔥
          </motion.div>
        )}
      </AnimatePresence>
      {showLabel && (
        <div className="flex items-baseline gap-1">
          <span className={`${textSize} font-bold font-mono-num ${isDanger ? 'text-warning animate-pulse' : streak > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
            {streak}{t('dashboard.gamification.days')}
          </span>
        </div>
      )}
      {isDanger && streak > 0 && (
        <p className={`${labelSize} text-warning font-semibold text-center max-w-[140px]`}>
          {t('dashboard.gamification.streakDanger')}
        </p>
      )}
    </div>
  );
}
