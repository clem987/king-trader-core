import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '@/components/GlassCard';
import ScoreRing from '@/components/ScoreRing';
import BottomNav from '@/components/BottomNav';
import { useTrades } from '@/hooks/useTrades';
import { useProfile } from '@/hooks/useProfile';

export default function Stats() {
  const navigate = useNavigate();
  const { trades, winrate, avgScore } = useTrades();
  const { profile } = useProfile();

  const totalPnl = trades.reduce((s, t) => s + (Number(t.result_amount) || 0), 0);
  const avgRR = trades.length > 0
    ? (trades.filter(t => (t.result_amount ?? 0) > 0).length / Math.max(trades.filter(t => (t.result_amount ?? 0) < 0).length, 1)).toFixed(1)
    : '0';

  const emotionalErrors = trades.filter(t => t.felt_fear || t.hesitated).length;
  const planRespect = trades.length > 0
    ? Math.round((trades.filter(t => t.respected_plan).length / trades.length) * 100)
    : 0;

  return (
    <div className="min-h-screen pb-24 px-4 pt-12">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/dashboard')} className="text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-display font-bold">Statistiques</h1>
      </div>

      <div className="flex justify-center mb-6">
        <ScoreRing score={avgScore} size={140} label="Score moyen" />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <GlassCard className="text-center py-4">
          <p className="text-2xl font-bold">{winrate}%</p>
          <p className="text-[10px] text-muted-foreground">Winrate</p>
        </GlassCard>
        <GlassCard className="text-center py-4">
          <p className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-success' : 'text-destructive'}`}>
            {totalPnl >= 0 ? '+' : ''}{totalPnl}$
          </p>
          <p className="text-[10px] text-muted-foreground">PnL Total</p>
        </GlassCard>
        <GlassCard className="text-center py-4">
          <p className="text-2xl font-bold">{trades.length}</p>
          <p className="text-[10px] text-muted-foreground">Total Trades</p>
        </GlassCard>
        <GlassCard className="text-center py-4">
          <p className="text-2xl font-bold">{planRespect}%</p>
          <p className="text-[10px] text-muted-foreground">Plan respecté</p>
        </GlassCard>
      </div>

      <h3 className="text-sm font-semibold mb-3">Détails</h3>
      <div className="space-y-2">
        <GlassCard className="flex justify-between py-3">
          <span className="text-sm text-muted-foreground">R:R moyen</span>
          <span className="text-sm font-bold">{avgRR}</span>
        </GlassCard>
        <GlassCard className="flex justify-between py-3">
          <span className="text-sm text-muted-foreground">Erreurs émotionnelles</span>
          <span className="text-sm font-bold text-destructive">{emotionalErrors}</span>
        </GlassCard>
        <GlassCard className="flex justify-between py-3">
          <span className="text-sm text-muted-foreground">XP Total</span>
          <span className="text-sm font-bold">{profile?.xp || 0}</span>
        </GlassCard>
        <GlassCard className="flex justify-between py-3">
          <span className="text-sm text-muted-foreground">Streak actuel</span>
          <span className="text-sm font-bold">{profile?.streak || 0} jours</span>
        </GlassCard>
      </div>

      <BottomNav />
    </div>
  );
}
