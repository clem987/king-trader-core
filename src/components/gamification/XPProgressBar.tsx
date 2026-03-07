import { useTranslation } from 'react-i18next';
import { useGamification } from '@/hooks/useGamification';

interface XPProgressBarProps {
  compact?: boolean;
}

export default function XPProgressBar({ compact = false }: XPProgressBarProps) {
  const { t } = useTranslation();
  const { xp, level, levelName, nextLevelName, xpForCurrentLevel, xpForNextLevel, xpProgress, isMaxLevel } = useGamification();

  const levelIcon = level >= 5 ? '👑' : level >= 4 ? '💎' : level >= 3 ? '🏆' : level >= 2 ? '⭐' : '🌱';

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm">{levelIcon}</span>
        <div className="flex-1">
          <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${xpProgress}%`,
                background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--gold)))',
              }}
            />
          </div>
        </div>
        <span className="text-[10px] font-mono-num text-muted-foreground">{xp} XP</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{levelIcon}</span>
          <div>
            <p className="text-xs font-bold">{levelName}</p>
            <p className="text-[9px] text-muted-foreground">{t('dashboard.gamification.level')} {level}</p>
          </div>
        </div>
        <span className="text-xs font-mono-num font-bold text-primary">{xp} XP</span>
      </div>
      <div className="h-2 rounded-full bg-muted/30 overflow-hidden mb-1.5">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${xpProgress}%`,
            background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--gold)))',
          }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        {isMaxLevel ? (
          <span>{t('dashboard.gamification.maxLevel')}</span>
        ) : (
          <>
            <span>{xpForCurrentLevel} XP</span>
            <span>{t('dashboard.gamification.xpRemaining', { xp: xpForNextLevel - xp, level: nextLevelName })}</span>
          </>
        )}
      </div>
    </div>
  );
}
