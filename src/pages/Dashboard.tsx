import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crosshair, TrendingUp, Target, Flame, Brain, Crown } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import ScoreRing from '@/components/ScoreRing';
import BottomNav from '@/components/BottomNav';
import { useProfile } from '@/hooks/useProfile';
import { useTrades } from '@/hooks/useTrades';
import { useAuth } from '@/lib/auth';

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { todayTrades, winrate, todayPnl, avgScore } = useTrades();
  const { user } = useAuth();

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'King': return 'text-warning';
      case 'Master': return 'text-primary';
      case 'Diamond': return 'text-blue-400';
      case 'Gold': return 'text-yellow-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold">
            KING <span className="text-gradient">TRADER</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {profile?.username || 'Trader'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`text-xs font-semibold ${getLevelColor(profile?.level || 'Bronze')}`}>
            {profile?.level || 'Bronze'}
          </div>
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
            <Crown className="w-4 h-4 text-primary" />
          </div>
        </div>
      </div>

      {/* Score ring */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center mb-6"
      >
        <GlassCard elevated className="flex items-center gap-6 px-6 py-5 w-full">
          <ScoreRing score={avgScore} label="Score" />
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Streak</span>
              <div className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-primary" />
                <span className="text-sm font-semibold">{profile?.streak || 0}j</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">XP</span>
              <span className="text-sm font-semibold">{profile?.xp || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Niveau</span>
              <span className={`text-sm font-semibold ${getLevelColor(profile?.level || 'Bronze')}`}>
                {profile?.level || 'Bronze'}
              </span>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <GlassCard className="text-center py-4">
          <TrendingUp className={`w-4 h-4 mx-auto mb-1.5 ${todayPnl >= 0 ? 'text-success' : 'text-destructive'}`} />
          <p className={`text-lg font-bold ${todayPnl >= 0 ? 'text-success' : 'text-destructive'}`}>
            {todayPnl >= 0 ? '+' : ''}{todayPnl}$
          </p>
          <p className="text-[10px] text-muted-foreground">PnL Jour</p>
        </GlassCard>

        <GlassCard className="text-center py-4">
          <Target className="w-4 h-4 mx-auto mb-1.5 text-primary" />
          <p className="text-lg font-bold">{winrate}%</p>
          <p className="text-[10px] text-muted-foreground">Winrate</p>
        </GlassCard>

        <GlassCard className="text-center py-4">
          <Brain className="w-4 h-4 mx-auto mb-1.5 text-primary" />
          <p className="text-lg font-bold">{todayTrades.length}</p>
          <p className="text-[10px] text-muted-foreground">Trades</p>
        </GlassCard>
      </div>

      {/* Session button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/session')}
        className="glow-button w-full py-4 rounded-2xl font-bold text-primary-foreground flex items-center justify-center gap-3 text-base mb-6"
      >
        <Crosshair className="w-5 h-5" />
        Démarrer Session
      </motion.button>

      {/* Today trades */}
      {todayTrades.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Trades du jour</h3>
          <div className="space-y-2">
            {todayTrades.map((trade) => (
              <GlassCard key={trade.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{trade.setup || 'Trade'}</p>
                  <p className="text-[10px] text-muted-foreground">Score: {trade.total_score}/100</p>
                </div>
                <span className={`text-sm font-bold ${Number(trade.result_amount) >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {Number(trade.result_amount) >= 0 ? '+' : ''}{trade.result_amount}$
                </span>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
