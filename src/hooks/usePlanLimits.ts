import { useProfile } from './useProfile';

export const PLAN_LIMITS = {
  free: {
    sessionsPerMonth: 5,
    strategies: 1,
    statsHistory: 7,
    exportCsv: false,
    aiInsights: false,
    postSessionBilan: false,
    advancedStats: false,
  },
  pro: {
    sessionsPerMonth: Infinity,
    strategies: Infinity,
    statsHistory: Infinity,
    exportCsv: true,
    aiInsights: true,
    postSessionBilan: true,
    advancedStats: true,
  },
  elite: {
    sessionsPerMonth: Infinity,
    strategies: Infinity,
    statsHistory: Infinity,
    exportCsv: true,
    aiInsights: true,
    postSessionBilan: true,
    advancedStats: true,
    aiCoach: true,
    squads: true,
  },
} as const;

type PlanKey = 'free' | 'pro' | 'elite';

export function usePlanLimits() {
  const { profile } = useProfile();
  const plan = ((profile as any)?.plan || 'free') as PlanKey;
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

  const monthlySessionsUsed = (profile as any)?.monthly_sessions_count ?? 0;

  const canStartSession = plan !== 'free' ||
    monthlySessionsUsed < limits.sessionsPerMonth;

  const sessionsRemaining = plan === 'free'
    ? Math.max(0, (limits.sessionsPerMonth as number) - monthlySessionsUsed)
    : Infinity;

  return {
    plan,
    limits,
    monthlySessionsUsed,
    sessionsRemaining,
    canStartSession,
    isPro: plan === 'pro' || plan === 'elite',
    isElite: plan === 'elite',
  };
}
