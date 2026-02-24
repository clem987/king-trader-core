import { useState, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import GlassCard from '@/components/GlassCard';
import ScoreRing from '@/components/ScoreRing';
import BottomNav from '@/components/BottomNav';
import { useTrades } from '@/hooks/useTrades';
import { useProfile } from '@/hooks/useProfile';

type Period = 'week' | 'month' | 'all';

export default function Stats() {
  const navigate = useNavigate();
  const { trades, winrate, avgScore } = useTrades();
  const { profile } = useProfile();
  const [period, setPeriod] = useState<Period>('week');

  const now = new Date();

  const filtered = useMemo(() => {
    if (period === 'all') return trades;
    const days = period === 'week' ? 7 : 30;
    const cutoff = new Date(now.getTime() - days * 86400000);
    return trades.filter(t => new Date(t.created_at || '') >= cutoff);
  }, [trades, period]);

  const totalPnl = filtered.reduce((s, t) => s + (Number(t.result_amount) || 0), 0);
  const wins = filtered.filter(t => (Number(t.result_amount) || 0) > 0).length;
  const filteredWinRate = filtered.length > 0 ? Math.round((wins / filtered.length) * 100) : 0;
  const filteredAvgScore = filtered.length > 0
    ? Math.round(filtered.reduce((s, t) => s + (t.total_score ?? 0), 0) / filtered.length)
    : 0;
  const horsplan = filtered.filter(t => !t.respected_plan);
  const horsplanCost = horsplan.reduce((s, t) => s + (Number(t.result_amount) || 0), 0);

  // Cumulative PnL chart data
  const pnlChartData = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => 
      new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()
    );
    let cumulative = 0;
    return sorted.map(t => {
      cumulative += Number(t.result_amount) || 0;
      const d = new Date(t.created_at || '');
      return {
        date: `${d.getDate()}/${d.getMonth() + 1}`,
        pnl: cumulative,
      };
    });
  }, [filtered]);

  // Score over time chart data
  const scoreChartData = useMemo(() => {
    const sorted = [...filtered].sort((a, b) =>
      new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()
    );
    return sorted.map((t, i) => {
      const d = new Date(t.created_at || '');
      return {
        date: `${d.getDate()}/${d.getMonth() + 1}`,
        score: t.total_score ?? 0,
        avg: Math.round(sorted.slice(0, i + 1).reduce((s, x) => s + (x.total_score ?? 0), 0) / (i + 1)),
      };
    });
  }, [filtered]);

  // Weekly performance bars (last 7 days)
  const weekDays = useMemo(() => {
    const labels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getTime() - (6 - i) * 86400000);
      const dayTrades = trades.filter(t => t.date === d.toISOString().split('T')[0]);
      const score = dayTrades.length > 0
        ? Math.round(dayTrades.reduce((s, t) => s + (t.total_score ?? 0), 0) / dayTrades.length)
        : 0;
      return { label: labels[d.getDay() === 0 ? 6 : d.getDay() - 1], score, count: dayTrades.length };
    });
  }, [trades]);

  // Monthly heatmap (last 28 days)
  const heatmap = useMemo(() => {
    return Array.from({ length: 28 }, (_, i) => {
      const d = new Date(now.getTime() - (27 - i) * 86400000);
      const dayTrades = trades.filter(t => t.date === d.toISOString().split('T')[0]);
      const score = dayTrades.length > 0
        ? Math.round(dayTrades.reduce((s, t) => s + (t.total_score ?? 0), 0) / dayTrades.length)
        : null;
      return { day: d.getDate(), score };
    });
  }, [trades]);

  return (
    <div className="min-h-screen pb-24 px-4 pt-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-display font-bold">Bilan</h1>
            <p className="text-[10px] text-muted-foreground">Ta progression de trader</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          {(['week', 'month', 'all'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                period === p ? 'bg-orange text-orange-foreground' : 'glass-card text-muted-foreground'
              }`}
            >
              {p === 'week' ? '7j' : p === 'month' ? '30j' : 'Tout'}
            </button>
          ))}
        </div>
      </div>

      {/* Hero stats */}
      <GlassCard elevated className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[9px] font-mono tracking-widest text-muted-foreground">P&L TOTAL</p>
            <p className={`text-4xl font-bold font-display leading-none mt-1 ${totalPnl >= 0 ? 'text-success' : 'text-destructive'}`}>
              {totalPnl >= 0 ? '+' : ''}{totalPnl}$
            </p>
            <p className="text-[10px] text-muted-foreground mt-2">
              Sur {filtered.length} trades
            </p>
          </div>
          <ScoreRing score={filteredAvgScore} size={86} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'WIN RATE', value: `${filteredWinRate}%`, colorClass: 'text-success' },
            { label: 'STREAK 🔥', value: `${profile?.streak ?? 0}j`, colorClass: 'text-orange' },
            { label: 'NIVEAU', value: profile?.level || 'Bronze', colorClass: 'text-gold' },
          ].map(s => (
            <div key={s.label} className="glass-card p-2.5 text-center rounded-xl">
              <p className="text-[8px] font-mono tracking-widest text-muted-foreground">{s.label}</p>
              <p className={`text-lg font-bold mt-0.5 ${s.colorClass}`}>{s.value}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Weekly performance bars */}
      <GlassCard className="mb-4">
        <p className="text-[9px] font-mono tracking-widest text-muted-foreground mb-3">PERFORMANCE PAR JOUR</p>
        <div className="flex items-end gap-1.5 h-20">
          {weekDays.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-md transition-all duration-500"
                style={{
                  height: d.count === 0 ? 4 : `${Math.max((d.score / 100) * 70, 4)}px`,
                  background: d.count === 0
                    ? 'rgba(255,255,255,0.06)'
                    : d.score >= 75 ? 'hsl(142, 71%, 45%)'
                    : d.score >= 50 ? 'hsl(38, 92%, 50%)'
                    : 'hsl(0, 84%, 60%)',
                  minHeight: 4,
                }}
              />
              <span className="text-[9px] font-mono text-muted-foreground">{d.label}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-3">
          {[
            { c: 'bg-success', l: '≥75%' },
            { c: 'bg-warning', l: '50-75%' },
            { c: 'bg-destructive', l: '<50%' },
          ].map(l => (
            <div key={l.l} className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
              <div className={`w-2 h-2 rounded-sm ${l.c}`} />
              {l.l}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Heatmap */}
      <GlassCard className="mb-4">
        <p className="text-[9px] font-mono tracking-widest text-muted-foreground mb-3">CALENDRIER DE DISCIPLINE</p>
        <div className="grid grid-cols-7 gap-1">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
            <div key={i} className="text-center text-[8px] text-muted-foreground pb-1">{d}</div>
          ))}
          {heatmap.map((d, i) => (
            <div
              key={i}
              className="aspect-square rounded-md"
              style={{
                background: d.score === null
                  ? 'rgba(255,255,255,0.03)'
                  : d.score >= 75 ? `rgba(34,197,94,${0.2 + (d.score - 75) / 100})`
                  : d.score >= 50 ? 'rgba(234,179,8,0.2)'
                  : 'rgba(239,68,68,0.2)',
              }}
              title={d.score !== null ? `${d.score}%` : 'Repos'}
            />
          ))}
        </div>
      </GlassCard>

      {/* Coût indiscipline */}
      {horsplan.length > 0 && (
        <GlassCard className="mb-4 border border-destructive/15">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-mono tracking-widest text-muted-foreground">COÛT DE L'INDISCIPLINE</p>
              <p className="text-2xl font-bold text-destructive mt-1">{horsplanCost}$</p>
              <p className="text-[10px] text-muted-foreground mt-1">perdus sur trades hors plan</p>
            </div>
            <span className="text-4xl">💸</span>
          </div>
          <div className="mt-3 p-3 rounded-xl bg-success/5 border border-success/10">
            <p className="text-[11px] text-success font-semibold">
              💡 En suivant ton plan à 100%, tu aurais fait <strong>+{totalPnl - horsplanCost}$</strong>
            </p>
          </div>
        </GlassCard>
      )}

      {/* Insights */}
      <GlassCard className="mb-4">
        <p className="text-[9px] font-mono tracking-widest text-muted-foreground mb-3">INSIGHTS</p>
        <div className="space-y-2">
          {filtered.length > 0 ? (
            <>
              <div className="glass-card p-3 rounded-xl flex items-start gap-3">
                <span className="text-lg">📊</span>
                <span className="text-xs text-foreground font-medium leading-relaxed">
                  Score moyen de {filteredAvgScore}% sur {filtered.length} trades — {filteredAvgScore >= 75 ? 'excellent !' : filteredAvgScore >= 50 ? 'à améliorer' : 'attention requise'}.
                </span>
              </div>
              {horsplan.length > 0 && (
                <div className="glass-card p-3 rounded-xl flex items-start gap-3">
                  <span className="text-lg">😤</span>
                  <span className="text-xs text-destructive font-medium leading-relaxed">
                    {horsplan.length} trade(s) hors plan détecté(s) — ils t'ont coûté {horsplanCost}$.
                  </span>
                </div>
              )}
              <div className="glass-card p-3 rounded-xl flex items-start gap-3">
                <span className="text-lg">🔥</span>
                <span className="text-xs text-orange font-medium leading-relaxed">
                  Streak actuel: {profile?.streak ?? 0} jours · XP: {profile?.xp ?? 0}
                </span>
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">Aucun trade sur cette période</p>
          )}
        </div>
      </GlassCard>

      <BottomNav />
    </div>
  );
}
