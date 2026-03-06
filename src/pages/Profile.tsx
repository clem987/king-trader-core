import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/lib/auth';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import GlassCard from '@/components/GlassCard';
import { toast } from 'sonner';

const LEVEL_XP: Record<string, { min: number; max: number; next: string | null; color: string }> = {
  Bronze:  { min: 0,   max: 50,  next: 'Gold',    color: '#cd7f32' },
  Gold:    { min: 50,  max: 150, next: 'Diamond',  color: '#f59e0b' },
  Diamond: { min: 150, max: 300, next: 'Master',   color: '#60a5fa' },
  Master:  { min: 300, max: 500, next: 'King',     color: '#a855f7' },
  King:    { min: 500, max: 500, next: null,        color: '#f97316' },
};

export default function Profile() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useProfile();
  const { user, signOut } = useAuth();
  const { plan, monthlySessionsUsed } = usePlanLimits();
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.username) setUsername(profile.username);
  }, [profile?.username]);

  const level = (profile?.level || 'Bronze') as string;
  const levelInfo = LEVEL_XP[level] || LEVEL_XP.Bronze;
  const xp = profile?.xp ?? 0;
  const xpProgress = levelInfo.max > levelInfo.min
    ? Math.min(((xp - levelInfo.min) / (levelInfo.max - levelInfo.min)) * 100, 100)
    : 100;

  const handleSave = async () => {
    if (!username.trim()) return;
    setSaving(true);
    try {
      await updateProfile.mutateAsync({ username: username.trim() });
      toast.success('Profil mis à jour');
    } catch {
      toast.error('Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24 lg:pb-8 page-enter">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-primary-foreground shrink-0"
          style={{ background: `linear-gradient(135deg, ${levelInfo.color}, hsl(var(--primary)))` }}
        >
          {(profile?.username || user?.email || 'U')[0].toUpperCase()}
        </div>
        <div>
          <div className="text-xl font-display font-extrabold">{profile?.username || 'Trader'}</div>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="text-xs font-mono font-bold px-2 py-0.5 rounded-full"
              style={{
                background: `${levelInfo.color}20`,
                color: levelInfo.color,
                border: `1px solid ${levelInfo.color}40`,
              }}
            >
              {level}
            </span>
            <span className="text-xs text-muted-foreground">{xp} XP</span>
          </div>
        </div>
      </div>

      {/* XP Progress */}
      <GlassCard className="mb-5">
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm font-bold">Progression niveau</div>
          {levelInfo.next && <div className="text-xs text-muted-foreground">→ {levelInfo.next}</div>}
        </div>
        <div className="h-2 bg-muted/30 rounded-full mb-2">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${xpProgress}%`, background: `linear-gradient(90deg, ${levelInfo.color}, hsl(var(--primary)))` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{xp} XP</span>
          <span>{levelInfo.max} XP</span>
        </div>
      </GlassCard>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'STREAK', value: `${profile?.streak ?? 0}j`, icon: '🔥', color: 'hsl(var(--gold))' },
          { label: 'RECORD', value: `${(profile as any)?.best_streak ?? 0}j`, icon: '🏆', color: 'hsl(var(--primary))' },
          { label: 'PLAN', value: plan.charAt(0).toUpperCase() + plan.slice(1), icon: '👑', color: 'hsl(var(--success))' },
        ].map(s => (
          <GlassCard key={s.label} className="text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-lg font-mono font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[9px] font-mono tracking-widest text-muted-foreground">{s.label}</div>
          </GlassCard>
        ))}
      </div>

      {/* Plan usage */}
      {plan === 'free' && (
        <GlassCard className="mb-5 border border-primary/15">
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm font-bold">Plan Free</div>
            <button onClick={() => navigate('/pricing')} className="text-xs text-primary font-bold hover:underline">
              Upgrader →
            </button>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Sessions ce mois</span>
            <span className="font-mono font-bold text-primary">{monthlySessionsUsed}/5</span>
          </div>
          <div className="h-1.5 bg-muted/30 rounded-full">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(monthlySessionsUsed / 5) * 100}%`,
                background: monthlySessionsUsed >= 4
                  ? 'linear-gradient(90deg, hsl(var(--destructive)), hsl(var(--primary)))'
                  : 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--gold)))',
              }}
            />
          </div>
        </GlassCard>
      )}

      {/* Edit profile */}
      <GlassCard className="mb-5">
        <div className="text-xs font-mono tracking-widest text-muted-foreground mb-3">MON PROFIL</div>
        <div className="mb-3">
          <label className="text-xs text-muted-foreground mb-1 block">Nom d'affichage</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="glass-input w-full px-4 py-3 rounded-xl text-sm outline-none"
            placeholder="Ton pseudo"
          />
        </div>
        <div className="text-xs text-muted-foreground mb-4">Email : {user?.email}</div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="glow-button w-full py-3 rounded-xl font-bold text-sm"
        >
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </GlassCard>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-3.5 rounded-xl text-destructive border border-destructive/20 hover:bg-destructive/5 transition-all font-display font-semibold text-sm flex items-center justify-center gap-2"
      >
        ↩ Déconnexion
      </button>
    </div>
  );
}
