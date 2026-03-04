import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crosshair, TrendingUp, Flame, Lightbulb } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import ScoreRing from '@/components/ScoreRing';
import { useProfile } from '@/hooks/useProfile';
import { useTrades } from '@/hooks/useTrades';
import { useStrategies } from '@/hooks/useStrategies';
import { useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip } from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { trades, todayTrades, avgScore } = useTrades();
  const { activeStrategy } = useStrategies();

  const totalPnl = trades.reduce((s, t) => s + (Number(t.result_amount) || 0), 0);
  const totalWins = trades.filter(t => (Number(t.result_amount) || 0) > 0).length;
  const totalWinRate = trades.length > 0 ? Math.round((totalWins / trades.length) * 100) : 0;

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Bonjour' : now.getHours() < 18 ? 'Bon après-midi' : 'Bonsoir';
  const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // Score chart data (last 30 days)
  const scoreChartData = useMemo(() => {
    const sorted = [...trades]
      .sort((a, b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime())
      .slice(-30);
    return sorted.map((t, i) => ({
      i,
      score: t.total_score ?? 0,
    }));
  }, [trades]);

  // Recent sessions (last 5)
  const recentTrades = trades.slice(0, 5);

  // Insights
  const horsplanCount = trades.filter(t => !t.respected_plan).length;
  const horsplanCost = trades.filter(t => !t.respected_plan).reduce((s, t) => s + (Number(t.result_amount) || 0), 0);

  const strategyName = activeStrategy?.name || profile?.strategy || 'Ma stratégie';
  const market = activeStrategy?.market || profile?.market || 'NQ';
  const rrMin = activeStrategy?.rr_min || profile?.min_rr || 2;
  const maxTrades = activeStrategy?.max_trades || profile?.max_trades_per_day || 3;

  return (
    <div className="p-4 lg:p-8">
      {/* Greeting */}
      <div className="mb-6 anim-fadeup">
        <h1 className="text-xl lg:text-2xl font-display font-bold">
          {greeting}, {profile?.username || 'Trader'} 👋
        </h1>
        <p className="text-xs text-muted-foreground capitalize mt-0.5">{dateStr}</p>
        <p className="text-[11px] text-muted-foreground italic mt-1">"La discipline crée la rentabilité."</p>
      </div>

      {/* 4 Hero stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 anim-fadeup-1">
        {/* Score Process */}
        <GlassCard elevated className="flex flex-col items-center py-5">
          <ScoreRing score={avgScore} size={72} strokeWidth={6} />
          <p className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase mt-2">Score Process</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Objectif : 75%</p>
        </GlassCard>

        {/* P&L Total */}
        <GlassCard className="flex flex-col justify-center">
          <p className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase">P&L Total</p>
          <p className={`text-2xl lg:text-3xl font-bold font-mono-num mt-1 ${totalPnl >= 0 ? 'text-success' : 'text-destructive'}`}>
            {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(0)}$
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">{trades.length} trades</p>
        </GlassCard>

        {/* Win Rate */}
        <GlassCard className="flex flex-col justify-center">
          <p className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase">Win Rate</p>
          <p className="text-2xl lg:text-3xl font-bold font-mono-num mt-1">{totalWinRate}%</p>
          <p className="text-[10px] text-muted-foreground mt-1">{totalWins} trades gagnés</p>
        </GlassCard>

        {/* Streak */}
        <GlassCard className="flex flex-col justify-center">
          <p className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase">Streak</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <Flame className="w-5 h-5 text-gold" />
            <p className="text-2xl lg:text-3xl font-bold font-mono-num">{profile?.streak || 0}j</p>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Record : {profile?.streak || 0}j</p>
        </GlassCard>
      </div>

      {/* Session CTA card */}
      <GlassCard elevated className="mb-6 anim-fadeup-2">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase">⚡ Stratégie active</p>
            <p className="text-base font-display font-bold mt-1 truncate">{strategyName}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {market} · R:R min {rrMin}:1 · max {maxTrades} trades
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate('/session')}
            className="glow-button px-6 py-3 rounded-xl font-display font-bold text-sm flex items-center gap-2 shrink-0"
          >
            <Crosshair className="w-4 h-4" />
            Démarrer la session
          </motion.button>
        </div>
      </GlassCard>

      {/* 2-column layout on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 anim-fadeup-3">
        {/* Recent sessions */}
        <GlassCard>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase">Sessions récentes</p>
            <button onClick={() => navigate('/journal')} className="text-[10px] text-primary font-semibold hover:underline">
              Voir tout
            </button>
          </div>
          {recentTrades.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">Aucun trade encore. Lance ta première session !</p>
          ) : (
            <div className="space-y-2">
              {recentTrades.map(trade => {
                const pnl = Number(trade.result_amount) || 0;
                return (
                  <div key={trade.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold ${
                        pnl >= 0 ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'
                      }`}>
                        {pnl >= 0 ? '↗' : '↘'}
                      </div>
                      <div>
                        <p className="text-xs font-semibold">{trade.pair || trade.setup || 'Trade'}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(trade.created_at || '').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          {' · Score '}
                          <span className="font-mono-num">{trade.total_score}%</span>
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold font-mono-num ${pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {pnl >= 0 ? '+' : ''}{pnl}$
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>

        {/* Score Process chart */}
        <GlassCard>
          <p className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase mb-3">Score Process — 30 derniers trades</p>
          {scoreChartData.length > 1 ? (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={scoreChartData}>
                <XAxis dataKey="i" hide />
                <Tooltip
                  contentStyle={{ background: 'hsl(222, 35%, 9%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 11 }}
                  labelFormatter={() => ''}
                  formatter={(value: number) => [`${value}%`, 'Score']}
                />
                <Line type="monotone" dataKey="score" stroke="hsl(24, 95%, 53%)" strokeWidth={2} dot={{ r: 2, fill: 'hsl(24, 95%, 53%)' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[160px]">
              <p className="text-xs text-muted-foreground">Pas assez de données</p>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Insights */}
      <div className="mt-4 anim-fadeup-4">
        <GlassCard>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-primary" />
            <p className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase">Insights</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-xs">📊</span>
              <p className="text-xs text-muted-foreground">
                Score moyen : <span className="text-foreground font-mono-num font-bold">{avgScore}%</span> → objectif 75%
              </p>
            </div>
            {horsplanCount > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-xs">😤</span>
                <p className="text-xs text-muted-foreground">
                  {horsplanCount} trades hors plan → <span className="text-destructive font-mono-num font-bold">{horsplanCost}$</span>
                </p>
              </div>
            )}
            <div className="flex items-start gap-2">
              <span className="text-xs">💡</span>
              <p className="text-xs text-muted-foreground">Complète ta checklist pré-session pour améliorer ton score.</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
