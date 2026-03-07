import { useMemo, useState, useCallback } from 'react';
import { useProfile } from './useProfile';
import { useTranslation } from 'react-i18next';

const LEVELS = [
  { level: 1, minXp: 0, maxXp: 100 },
  { level: 2, minXp: 101, maxXp: 300 },
  { level: 3, minXp: 301, maxXp: 600 },
  { level: 4, minXp: 601, maxXp: 1000 },
  { level: 5, minXp: 1001, maxXp: Infinity },
];

export function getLevelFromXP(xp: number): number {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) return LEVELS[i].level;
  }
  return 1;
}

export function useGamification() {
  const { profile, updateProfile } = useProfile();
  const { t } = useTranslation();
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevelName, setNewLevelName] = useState('');
  const [newLevel, setNewLevel] = useState(1);

  const xp = profile?.xp ?? 0;
  const level = getLevelFromXP(xp);
  const levelConfig = LEVELS[level - 1];
  const nextLevelConfig = level < 5 ? LEVELS[level] : null;

  const levelName = t(`levels.${level}`);
  const nextLevelName = nextLevelConfig ? t(`levels.${level + 1}`) : null;

  const xpForCurrentLevel = levelConfig.minXp;
  const xpForNextLevel = nextLevelConfig ? nextLevelConfig.minXp : levelConfig.minXp;
  const isMaxLevel = level >= 5;

  const xpProgress = useMemo(() => {
    if (isMaxLevel) return 100;
    const range = xpForNextLevel - xpForCurrentLevel;
    return Math.min(((xp - xpForCurrentLevel) / range) * 100, 100);
  }, [xp, xpForCurrentLevel, xpForNextLevel, isMaxLevel]);

  const addXP = useCallback(async (amount: number) => {
    if (!profile) return;
    const currentXp = profile.xp ?? 0;
    const newXp = currentXp + amount;
    const oldLevel = getLevelFromXP(currentXp);
    const newLvl = getLevelFromXP(newXp);

    await updateProfile.mutateAsync({ xp: newXp } as any);

    if (newLvl > oldLevel) {
      setNewLevel(newLvl);
      setNewLevelName(t(`levels.${newLvl}`));
      setShowLevelUp(true);
    }
  }, [profile, updateProfile, t]);

  const closeLevelUp = useCallback(() => setShowLevelUp(false), []);

  return {
    xp,
    level,
    levelName,
    nextLevelName,
    xpForCurrentLevel,
    xpForNextLevel,
    xpProgress,
    isMaxLevel,
    addXP,
    showLevelUp,
    newLevelName,
    newLevel,
    closeLevelUp,
  };
}
