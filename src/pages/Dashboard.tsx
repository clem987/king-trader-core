import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crosshair, TrendingUp, Target, Flame, Crown, Settings } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import ScoreRing from '@/components/ScoreRing';
import BottomNav from '@/components/BottomNav';
import { useProfile } from '@/hooks/useProfile';
import { useTrades } from '@/hooks/useTrades';

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { todayTrades, winrate, todayPnl, avgScore, trades } = useTrades();

  const totalPnl = trades.reduce((s, t) => s + (Number(t.result_amount) || 0), 0);
  const totalWins = trades.filter(t => (Number(t.result_amount) || 0) > 0).length;
  const totalWinRate = trades.length > 0 ? Math.round((totalWins / trades.length) * 100) : 0;
  const avgRR = trades.length > 0
    ? (trades.reduce((s, t) => s + (Number((t as any).rr_achieved) || 0), 0) / trades.length).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen pb-24 px-5 pt-14">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 anim-fadeup">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,166,35,0.12)' }}>
            <span className="text-lg">👑</span>
          </div>
          <div>
            <h1 className="text-xl font-display font-bold">King Trader</h1>
            <p className="text-[11px] text-muted-foreground">Discipline is Power</p>
          </div>
        </div>
        <button onClick={() => navigate('/settings')} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center">
          <Settings className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Score card */}
      <GlassCard elevated className="mb-4 anim-fadeup-1">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">Score Process</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="chip">
              <span>🔥</span>
              <span>{profile?.streak || 0}j</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <ScoreRing score={avgScore} size={100} label="Process" />
          {trades.length > 0 ? (
            <div className="flex-1 grid grid-cols-2 gap-3">
              <div>
                <p className={`text-xl font-display font-bold ${totalPnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(0)}$
                </p>
                <p className="text-[10px] text-muted-foreground">P&L Total</p>
              </div>
              <div>
                <p className="text-xl font-display font-bold">{totalWinRate}%</p>
                <p className="text-[10px] text-muted-foreground">Win Rate</p>
              </div>
              <div>
                <p className="text-xl font-display font-bold">{trades.length}</p>
                <p className="text-[10px] text-muted-foreground">Trades</p>
              </div>
              <div>
                <p className="text-xl font-display font-bold">{avgRR}R</p>
                <p className="text-[10px] text-muted-foreground">R:R moy</p>
              </div>
            </div>
          ) : (
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Lance ta première session pour voir tes stats apparaître ici.</p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Start Session CTA */}
      <div className="anim-fadeup-2 mb-4">
        <GlassCard className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Stratégie active</p>
            <p className="text-sm font-display font-bold mt-0.5">{profile?.strategy || 'Ma stratégie'}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {profile?.market || 'NQ'} · R:R min {profile?.min_rr || 2}:1 · max {profile?.max_trades_per_day || 3} trades
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/session')}
            className="glow-button px-5 py-3 rounded-xl font-display font-bold text-sm flex items-center gap-2"
          >
            <Crosshair className="w-4 h-4" />
            Démarrer
          </motion.button>
        </GlassCard>
      </div>

      {/* Today trades */}
      {todayTrades.length > 0 && (
        <div className="anim-fadeup-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-display font-semibold text-muted-foreground">Trades du jour</p>
            <p className="text-[10px] text-muted-foreground">{todayTrades.length} pris</p>
          </div>
          <div className="space-y-2">
            {todayTrades.map((trade) => {
              const pnl = Number(trade.result_amount) || 0;
              return (
                <GlassCard key={trade.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      pnl >= 0 ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'
                    }`}>
                      {pnl >= 0 ? '↗' : '↘'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{(trade as any).pair || trade.setup || 'Trade'}</p>
                      <p className="text-[10px] text-muted-foreground">Score {trade.total_score}%</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {pnl >= 0 ? '+' : ''}{pnl}$
                  </span>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      {todayTrades.length === 0 && trades.length === 0 && (
        <div className="text-center py-12 anim-fadeup-3">
          <p className="text-3xl mb-3">⚡</p>
          <p className="text-sm font-display font-bold text-foreground">Prêt pour ta première session ?</p>
          <p className="text-xs text-muted-foreground mt-1">
            Lance le Session Mode™ et commence à construire ton historique de discipline.
          </p>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
