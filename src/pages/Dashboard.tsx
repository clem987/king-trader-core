import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crosshair, Lightbulb, Zap } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import ScoreRing from '@/components/ScoreRing';
import LevelUpModal from '@/components/gamification/LevelUpModal';
import { useProfile } from '@/hooks/useProfile';
import { useTrades } from '@/hooks/useTrades';
import { useStrategies } from '@/hooks/useStrategies';
import { useGamification } from '@/hooks/useGamification';
import { useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { useTranslation } from 'react-i18next';

const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.3, ease: [0, 0, 0.2, 1] as const }
  }),
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profile } = useProfile();
  const { trades, todayTrades, avgScore } = useTrades();
  const { activeStrategy } = useStrategies();
  const { showLevelUp, newLevelName, newLevel, closeLevelUp } = useGamification();

  const totalPnl = trades.reduce((s, t) => s + (Number(t.result_amount) || 0), 0);
  const totalWins = trades.filter(t => (Number(t.result_amount) || 0) > 0).length;
  const totalWinRate = trades.length > 0 ? Math.round((totalWins / trades.length) * 100) : 0;

  const now = new Date();
  const greeting = now.getHours() < 12 ? t('dashboard.greeting_morning') : now.getHours() < 18 ? t('dashboard.greeting_afternoon') : t('dashboard.greeting_evening');

  const scoreChartData = useMemo(() => {
    const sorted = [...trades]
      .sort((a, b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime())
      .slice(-30);
    return sorted.map((t, i) => ({ i, score: t.total_score ?? 0 }));
  }, [trades]);

  const recentTrades = trades.slice(0, 5);
  const horsplanCount = trades.filter(t => !t.respected_plan).length;
  const horsplanCost = trades.filter(t => !t.respected_plan).reduce((s, t) => s + (Number(t.result_amount) || 0), 0);

  const strategyName = activeStrategy?.name || profile?.strategy || 'Ma stratégie';
  const market = activeStrategy?.market || profile?.market || 'NQ';
  const rrMin = activeStrategy?.rr_min || profile?.min_rr || 2;
  const maxTrades = activeStrategy?.max_trades || profile?.max_trades_per_day || 3;
  const streak = profile?.streak ?? 0;

  return (
    <div className="p-4 lg:p-8">
      <LevelUpModal show={showLevelUp} levelName={newLevelName} level={newLevel} onClose={closeLevelUp} />

      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-display font-bold">
          {greeting}, {profile?.username || 'Trader'} 👋
        </h1>
        <p className="text-[11px] text-muted-foreground italic mt-1">{t('dashboard.quote')}</p>
      </div>

      {/* 4 Hero stat cards with staggered animation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <motion.div custom={0} initial="hidden" animate="visible" variants={cardVariants}>
          <GlassCard elevated className="flex flex-col items-center py-5 h-full">
            <ScoreRing score={avgScore} size={72} strokeWidth={6} />
            <p className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase mt-2">{t('dashboard.scoreProcess')}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{t('dashboard.objective')}</p>
          </GlassCard>
        </motion.div>

        <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariants}>
          <GlassCard className="flex flex-col justify-center h-full">
            <p className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase">{t('dashboard.pnlTotal')}</p>
            <p className={`text-2xl lg:text-3xl font-bold font-mono-num mt-1 ${totalPnl >= 0 ? 'text-success' : 'text-destructive'}`}>
              {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(0)}$
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">{trades.length} {t('common.trades')}</p>
          </GlassCard>
        </motion.div>

        <motion.div custom={2} initial="hidden" animate="visible" variants={cardVariants}>
          <GlassCard className="flex flex-col justify-center h-full">
            <p className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase">{t('dashboard.winRate')}</p>
            <p className="text-2xl lg:text-3xl font-bold font-mono-num mt-1">{totalWinRate}%</p>
            <p className="text-[10px] text-muted-foreground mt-1">{totalWins} {t('dashboard.tradesWon')}</p>
          </GlassCard>
        </motion.div>

        <motion.div custom={3} initial="hidden" animate="visible" variants={cardVariants}>
          <GlassCard className="flex flex-col items-center justify-center h-full">
            <span className={`text-3xl leading-none ${streak > 0 ? 'drop-shadow-[0_0_12px_rgba(249,115,22,0.5)]' : 'opacity-30'}`}>🔥</span>
            <p className={`text-2xl font-bold font-mono-num mt-1 ${streak > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
              {streak}{t('dashboard.gamification.days')}
            </p>
            <p className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase mt-1">{t('dashboard.streak')}</p>
            <p className="text-[10px] text-muted-foreground">{t('dashboard.record')} : {(profile as any)?.best_streak ?? 0}{t('dashboard.gamification.days')}</p>
          </GlassCard>
        </motion.div>
      </div>

      {/* Session CTA */}
      <motion.div custom={4} initial="hidden" animate="visible" variants={cardVariants}>
        <GlassCard elevated className="mb-6 border border-primary/15">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase">{t('dashboard.activeStrategy')}</p>
              <p className="text-base font-display font-bold mt-1 truncate">{strategyName}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {market} · R:R min {rrMin}:1 · max {maxTrades} {t('common.trades')}
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate('/session')}
              className="glow-button px-6 py-3 rounded-xl font-display font-bold text-sm flex items-center gap-2 shrink-0"
            >
              <Zap className="w-4 h-4" />
              {t('dashboard.startSession')}
            </motion.button>
          </div>
        </GlassCard>
      </motion.div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase">{t('dashboard.recentSessions')}</p>
            <button onClick={() => navigate('/journal')} className="text-[10px] text-primary font-semibold hover:underline">
              {t('common.seeAll')}
            </button>
          </div>
          {recentTrades.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">{t('dashboard.noTradesYet')}</p>
          ) : (
            <div className="space-y-2">
              {recentTrades.map(trade => {
                const pnl = Number(trade.result_amount) || 0;
                return (
                  <div key={trade.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold ${
                        pnl > 0 ? 'bg-success/15 text-success' : pnl < 0 ? 'bg-destructive/15 text-destructive' : 'bg-muted/30 text-muted-foreground'
                      }`}>
                        {pnl > 0 ? '↗' : pnl < 0 ? '↘' : '→'}
                      </div>
                      <div>
                        <p className="text-xs font-semibold">{trade.pair || trade.setup || 'Trade'}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(trade.created_at || '').toLocaleDateString()}
                          {' · '}{t('dashboard.score')}{' '}
                          <span className="font-mono-num">{trade.total_score}%</span>
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold font-mono-num ${
                      pnl > 0 ? 'text-success' : pnl < 0 ? 'text-destructive' : 'text-muted-foreground'
                    }`}>
                      {pnl > 0 ? '+' : ''}{pnl}$
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>

        <GlassCard>
          <p className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase mb-3">{t('dashboard.scoreLast30')}</p>
          {scoreChartData.length > 1 ? (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={scoreChartData}>
                <XAxis dataKey="i" hide />
                <Tooltip
                  contentStyle={{ background: 'hsl(222, 35%, 9%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 11 }}
                  labelFormatter={() => ''}
                  formatter={(value: number) => [`${value}%`, t('dashboard.score')]}
                />
                <Line type="monotone" dataKey="score" stroke="hsl(24, 95%, 53%)" strokeWidth={2} dot={{ r: 2, fill: 'hsl(24, 95%, 53%)' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[160px]">
              <p className="text-xs text-muted-foreground">{t('common.noData')}</p>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Insights */}
      <div className="mt-4">
        <GlassCard>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-primary" />
            <p className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase">{t('dashboard.insights')}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-xs">📊</span>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.avgScore')} : <span className="text-foreground font-mono-num font-bold">{avgScore}%</span> → {t('dashboard.objective')}
              </p>
            </div>
            {horsplanCount > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-xs">😤</span>
                <p className="text-xs text-muted-foreground">
                  {horsplanCount} {t('dashboard.outOfPlanTrades')} → <span className="text-destructive font-mono-num font-bold">{horsplanCost}$</span>
                </p>
              </div>
            )}
            <div className="flex items-start gap-2">
              <span className="text-xs">💡</span>
              <p className="text-xs text-muted-foreground">{t('dashboard.completeChecklist')}</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
