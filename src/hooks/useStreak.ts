import { useProfile } from './useProfile';

export function useStreak() {
  const { profile, updateProfile } = useProfile();

  const updateStreakAfterSession = async (avgScore: number) => {
    if (!profile) return;

    const today = new Date().toISOString().split('T')[0];
    const lastSession = (profile as any).last_session_date || '';

    // Already sessioned today → no streak change
    if (lastSession === today) {
      await updateProfile.mutateAsync({ last_session_date: today } as any);
      return { newStreak: profile.streak ?? 0, improved: false };
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const isConsecutive = lastSession === yesterday;

    let newStreak = profile.streak ?? 0;

    if (avgScore >= 75) {
      newStreak = isConsecutive ? newStreak + 1 : 1;
    } else {
      newStreak = 0;
    }

    const newBestStreak = Math.max(newStreak, (profile as any).best_streak ?? 0);

    await updateProfile.mutateAsync({
      streak: newStreak,
      best_streak: newBestStreak,
      last_session_date: today,
    } as any);

    return { newStreak, improved: newStreak > (profile.streak ?? 0) };
  };

  return { updateStreakAfterSession };
}
