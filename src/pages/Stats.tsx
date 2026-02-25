import { useState, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import GlassCard from '@/components/GlassCard';
import ScoreRing from '@/components/ScoreRing';
import BottomNav from '@/components/BottomNav';
import { useTrades } from '@/hooks/useTrades';
import { useProfile } from '@/hooks/useProfile';

type Period = 'week' | 'month' | 'all';

export default function Stats() {
  const navigate = useNavigate();
  const { trades, avgScore } = useTrades();
  const { profile } = useProfile();
  const [period, setPeriod] = useState<Period>('month');
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

  // Cumulative PnL chart
  const pnlChartData = useMemo(() => {
    const sorted = [...filtered].sort((a, b) =>
      new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()
    );
    let cumulative = 0;
    return sorted.map(t => {
      cumulative += Number(t.result_amount) || 0;
      const d = new Date(t.created_at || '');
      return { date: `${d.getDate()}/${d.getMonth() + 1}`, pnl: cumulative };
    });
  }, [filtered]);

  // Score over time
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

  // Weekly bars
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

  // Heatmap
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
    <div className="min-h-screen pb-24 px-5 pt-14">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-display font-bold">Bilan</h1>
            <p className="text-[10px] text-muted-foreground">Ta progression de trader</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          {(['week', 'month', 'all'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                period === p ? 'glow-button border-transparent' : 'glass-card text-muted-foreground border-border'
              }`}
            >
              {p === 'week' ? '7j' : p === 'month' ? '30j' : 'Tout'}
            </button>
          ))}
        </div>
      </div>

      {/* Hero stats */}
      <GlassCard elevated className="mb-4 anim-fadeup">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase">P&L Total</p>
            <p className={`text-4xl font-bold font-display leading-none mt-1 ${totalPnl >= 0 ? 'text-success' : 'text-destructive'}`}>
              {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(0)}$
            </p>
            <p className="text-[10px] text-muted-foreground mt-2">Sur {filtered.length} trades</p>
          </div>
          <ScoreRing score={filteredAvgScore} size={86} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'WIN RATE', value: `${filteredWinRate}%`, c: 'text-success' },
            { label: 'STREAK 🔥', value: `${profile?.streak ?? 0}j`, c: 'text-primary' },
            { label: 'NIVEAU', value: profile?.level || 'Bronze', c: 'text-gold' },
          ].map(s => (
            <div key={s.label} className="glass-card p-2.5 text-center rounded-xl">
              <p className="text-[8px] font-semibold tracking-widest text-muted-foreground uppercase">{s.label}</p>
              <p className={`text-lg font-bold mt-0.5 ${s.c}`}>{s.value}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* PnL Chart */}
      {pnlChartData.length > 1 && (
        <GlassCard className="mb-4 anim-fadeup-1">
          <p className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase mb-3">P&L Cumulé</p>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={pnlChartData}>
              <defs>
                <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={totalPnl >= 0 ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)'} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={totalPnl >= 0 ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#6b7280' }} axisLine={false} tickLine={false} width={35} />
              <Tooltip contentStyle={{ background: '#0e1420', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="pnl" stroke={totalPnl >= 0 ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)'} fill="url(#pnlGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
      )}

      {/* Score Chart */}
      {scoreChartData.length > 1 && (
        <GlassCard className="mb-4 anim-fadeup-2">
          <p className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase mb-3">Score Process</p>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={scoreChartData}>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#6b7280' }} axisLine={false} tickLine={false} width={25} />
              <Tooltip contentStyle={{ background: '#0e1420', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="score" stroke="hsl(36, 90%, 55%)" strokeWidth={1.5} dot={{ r: 2, fill: 'hsl(36, 90%, 55%)' }} />
              <Line type="monotone" dataKey="avg" stroke="rgba(245,166,35,0.3)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      )}

      {/* Weekly bars */}
      <GlassCard className="mb-4 anim-fadeup-3">
        <p className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase mb-3">Performance par jour</p>
        <div className="flex items-end gap-1.5 h-20">
          {weekDays.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-md transition-all duration-500"
                style={{
                  height: d.count === 0 ? 4 : `${Math.max((d.score / 100) * 70, 4)}px`,
                  background: d.count === 0 ? 'rgba(255,255,255,0.06)' : d.score >= 75 ? 'hsl(142, 71%, 45%)' : d.score >= 50 ? 'hsl(38, 92%, 50%)' : 'hsl(0, 84%, 60%)',
                  minHeight: 4,
                }}
              />
              <span className="text-[9px] text-muted-foreground">{d.label}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Heatmap */}
      <GlassCard className="mb-4 anim-fadeup-4">
        <p className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase mb-3">Calendrier de discipline</p>
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
              <p className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase">Coût de l'indiscipline</p>
              <p className="text-2xl font-bold text-destructive mt-1">{horsplanCost}$</p>
              <p className="text-[10px] text-muted-foreground mt-1">perdus sur {horsplan.length} trades hors plan</p>
            </div>
            <span className="text-4xl">💸</span>
          </div>
          <div className="mt-3 p-3 rounded-xl bg-success/5 border border-success/10">
            <p className="text-[11px] text-success font-semibold">
              💡 En suivant ton plan à 100%, tu aurais fait <strong>+{(totalPnl - horsplanCost).toFixed(0)}$</strong>
            </p>
          </div>
        </GlassCard>
      )}

      <BottomNav />
    </div>
  );
}
