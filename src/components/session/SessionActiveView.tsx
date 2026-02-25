import { motion } from 'framer-motion';
import { Crown, Crosshair, X } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import EmotionalTracker from './EmotionalTracker';
import { useSessionTimer } from '@/hooks/useSessionTimer';
import { useTrades } from '@/hooks/useTrades';
import { useProfile } from '@/hooks/useProfile';
import { useState } from 'react';

interface SessionActiveViewProps {
  onTakeTrade: () => void;
  onEndSession: () => void;
}

export default function SessionActiveView({ onTakeTrade, onEndSession }: SessionActiveViewProps) {
  const { formatted } = useSessionTimer(true);
  const { todayTrades } = useTrades();
  const { profile } = useProfile();
  const [emotion, setEmotion] = useState<string | null>(null);

  const maxTrades = profile?.max_trades_per_day ?? 3;
  const totalPnl = todayTrades.reduce((s, t) => s + (Number(t.result_amount) || 0), 0);
  const avgScore = todayTrades.length > 0
    ? Math.round(todayTrades.reduce((s, t) => s + (t.total_score ?? 0), 0) / todayTrades.length)
    : 0;
  const wins = todayTrades.filter(t => (Number(t.result_amount) || 0) > 0).length;
  const winRate = todayTrades.length > 0 ? Math.round((wins / todayTrades.length) * 100) : 0;
  const horsplan = todayTrades.filter(t => !t.respected_plan).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">👑</span>
          <span className="font-display font-bold text-sm">SESSION MODE™</span>
        </div>
        <span className="text-[10px] font-semibold tracking-wider text-success animate-pulse-glow">
          ● EN COURS
        </span>
      </div>

      {/* Timer */}
      <div className="text-center py-3">
        <p className="text-3xl font-mono font-bold tracking-widest text-foreground">{formatted}</p>
        <p className="text-[10px] text-muted-foreground tracking-widest uppercase mt-1">Durée</p>
      </div>

      {/* Session info card */}
      <GlassCard elevated className="!p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div>
            <p className="text-sm font-display font-bold">{profile?.strategy || 'Ma stratégie'}</p>
            <p className="text-[10px] text-muted-foreground">{profile?.market || 'NQ'}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground uppercase">Score moy.</p>
            <p className="text-lg font-bold text-primary">{avgScore}%</p>
          </div>
        </div>

        <div className="grid grid-cols-4 divide-x divide-border/30">
          {[
            { label: 'TRADES', value: `${todayTrades.length}/${maxTrades}` },
            { label: 'P&L', value: `${totalPnl >= 0 ? '+' : ''}${totalPnl}$`, colorClass: totalPnl >= 0 ? 'text-success' : 'text-destructive' },
            { label: 'HORS PLAN', value: horsplan, colorClass: horsplan > 0 ? 'text-destructive' : 'text-success' },
            { label: 'WIN RATE', value: `${winRate}%` },
          ].map(s => (
            <div key={s.label} className="text-center py-3 px-2">
              <p className="text-[8px] font-semibold tracking-widest text-muted-foreground uppercase">{s.label}</p>
              <p className={`text-sm font-bold mt-0.5 ${s.colorClass || 'text-foreground'}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="p-4 pt-2">
          <p className="text-[10px] text-muted-foreground mb-2">Progression session</p>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(todayTrades.length / maxTrades) * 100}%` }}
            />
          </div>
        </div>
      </GlassCard>

      {/* Emotional tracker */}
      <GlassCard>
        <EmotionalTracker emotion={emotion} onSelect={setEmotion} />
      </GlassCard>

      {/* Trade list */}
      {todayTrades.length > 0 && (
        <GlassCard className="!p-0">
          <div className="flex items-center justify-between p-4 pb-2">
            <p className="text-xs font-display font-semibold">Trades de la session</p>
            <span className="text-[10px] text-muted-foreground">{todayTrades.length} pris</span>
          </div>
          <div className="divide-y divide-border/30">
            {todayTrades.map(t => {
              const pnl = Number(t.result_amount) || 0;
              return (
                <div key={t.id} className="flex items-center justify-between p-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      pnl >= 0 ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'
                    }`}>
                      {pnl >= 0 ? '↗' : '↘'}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{(t as any).pair || t.setup || 'Trade'}</p>
                      <div className="flex gap-2">
                        <span className="text-[10px] text-muted-foreground">Score {t.total_score}%</span>
                        {!t.respected_plan && (
                          <span className="text-[9px] font-bold text-destructive bg-destructive/10 px-1.5 rounded">HORS PLAN</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className={`text-sm font-bold ${pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {pnl >= 0 ? '+' : ''}{pnl}$
                  </p>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

      {/* CTAs */}
      <div className="space-y-3 pt-2">
        <button
          onClick={onTakeTrade}
          disabled={todayTrades.length >= maxTrades}
          className="glow-button w-full py-4 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Crosshair className="w-4 h-4" />
          {todayTrades.length >= maxTrades ? 'Limite atteinte' : 'Prendre un trade'}
        </button>
        <button
          onClick={onEndSession}
          className="w-full py-3 rounded-xl text-sm font-display font-semibold text-muted-foreground glass-card flex items-center justify-center gap-2 hover:text-destructive transition-colors"
        >
          <X className="w-4 h-4" />
          Terminer la session
        </button>
      </div>
    </motion.div>
  );
}
