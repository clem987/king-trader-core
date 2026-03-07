import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/lib/auth';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useGamification } from '@/hooks/useGamification';
import GlassCard from '@/components/GlassCard';
import XPProgressBar from '@/components/gamification/XPProgressBar';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export default function Profile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile, updateProfile } = useProfile();
  const { user, signOut } = useAuth();
  const { plan, monthlySessionsUsed } = usePlanLimits();
  const { levelName } = useGamification();
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.username) setUsername(profile.username);
  }, [profile?.username]);

  const handleSave = async () => {
    if (!username.trim()) return;
    setSaving(true);
    try {
      await updateProfile.mutateAsync({ username: username.trim() });
      toast.success(t('profile.profileUpdated'));
    } catch { toast.error(t('common.error')); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24 lg:pb-8 page-enter">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-primary-foreground shrink-0"
          style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--gold)))' }}>
          {(profile?.username || user?.email || 'U')[0].toUpperCase()}
        </div>
        <div>
          <div className="text-xl font-display font-extrabold">{profile?.username || 'Trader'}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(249,115,22,0.15)', color: 'hsl(var(--primary))', border: '1px solid rgba(249,115,22,0.3)' }}>
              {levelName}
            </span>
            <span className="text-xs text-muted-foreground">{profile?.xp ?? 0} XP</span>
          </div>
        </div>
      </div>

      <GlassCard className="mb-5">
        <div className="text-sm font-bold mb-3">{t('profile.levelProgress')}</div>
        <XPProgressBar />
      </GlassCard>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: t('profile.streak'), value: `${profile?.streak ?? 0}${t('dashboard.gamification.days')}`, icon: '🔥', color: 'hsl(var(--gold))' },
          { label: t('profile.record'), value: `${(profile as any)?.best_streak ?? 0}${t('dashboard.gamification.days')}`, icon: '🏆', color: 'hsl(var(--primary))' },
          { label: t('profile.planLabel'), value: plan.charAt(0).toUpperCase() + plan.slice(1), icon: '👑', color: 'hsl(var(--success))' },
        ].map(s => (
          <GlassCard key={s.label} className="text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-lg font-mono font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[9px] font-mono tracking-widest text-muted-foreground">{s.label}</div>
          </GlassCard>
        ))}
      </div>

      {plan === 'free' && (
        <GlassCard className="mb-5 border border-primary/15">
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm font-bold">{t('profile.planFree')}</div>
            <button onClick={() => navigate('/pricing')} className="text-xs text-primary font-bold hover:underline">
              {t('common.upgrade')} →
            </button>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>{t('profile.sessionsThisMonth')}</span>
            <span className="font-mono font-bold text-primary">{monthlySessionsUsed}/5</span>
          </div>
          <div className="h-1.5 bg-muted/30 rounded-full">
            <div className="h-full rounded-full transition-all"
              style={{ width: `${(monthlySessionsUsed / 5) * 100}%`, background: monthlySessionsUsed >= 4 ? 'linear-gradient(90deg, hsl(var(--destructive)), hsl(var(--primary)))' : 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--gold)))' }}
            />
          </div>
        </GlassCard>
      )}

      <GlassCard className="mb-5">
        <div className="text-xs font-mono tracking-widest text-muted-foreground mb-3">{t('profile.myProfile')}</div>
        <div className="mb-3">
          <label className="text-xs text-muted-foreground mb-1 block">{t('profile.displayName')}</label>
          <input value={username} onChange={e => setUsername(e.target.value)}
            className="glass-input w-full px-4 py-3 rounded-xl text-sm outline-none" placeholder={t('profile.pseudoPlaceholder')} />
        </div>
        <div className="text-xs text-muted-foreground mb-4">{t('profile.email')} : {user?.email}</div>
        <button onClick={handleSave} disabled={saving} className="glow-button w-full py-3 rounded-xl font-bold text-sm">
          {saving ? t('common.saving') : t('common.save')}
        </button>
      </GlassCard>

      <button onClick={async () => { await signOut(); navigate('/'); }}
        className="w-full py-3.5 rounded-xl text-destructive border border-destructive/20 hover:bg-destructive/5 transition-all font-display font-semibold text-sm flex items-center justify-center gap-2">
        ↩ {t('common.logout')}
      </button>
    </div>
  );
}
