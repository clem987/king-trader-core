import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import GlassCard from '@/components/GlassCard';
import ScoreRing from '@/components/ScoreRing';
import { useTrades } from '@/hooks/useTrades';
import { useProfile } from '@/hooks/useProfile';
import { useTranslation } from 'react-i18next';

type Period = 'week' | 'month' | 'all';

export default function Stats() {
  const { t } = useTranslation();
  const { trades, avgScore } = useTrades();
  const { profile } = useProfile();
  const [period, setPeriod] = useState<Period>('month');
  const now = new Date();

  const filtered = useMemo(() => {
    if (period === 'all') return trades;
    const days = period === 'week' ? 7 : 30;
    const cutoff = new Date(now.getTime() - days * 86400000);
    return trades.filter(tr => new Date(tr.created_at || '') >= cutoff);
  }, [trades, period]);

  const totalPnl = filtered.reduce((s, tr) => s + (Number(tr.result_amount) || 0), 0);
  const wins = filtered.filter(tr => (Number(tr.result_amount) || 0) > 0).length;
  const filteredWinRate = filtered.length > 0 ? Math.round((wins / filtered.length) * 100) : 0;
  const filteredAvgScore = filtered.length > 0
    ? Math.round(filtered.reduce((s, tr) => s + (tr.total_score ?? 0), 0) / filtered.length) : 0;
  const horsplan = filtered.filter(tr => !tr.respected_plan);
  const horsplanCost = horsplan.reduce((s, tr) => s + (Number(tr.result_amount) || 0), 0);

  const daysShort = t('stats.daysShort', { returnObjects: true }) as string[];

  const pnlChartData = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime());
    let cumulative = 0;
    return sorted.map(tr => {
      cumulative += Number(tr.result_amount) || 0;
      const d = new Date(tr.created_at || '');
      return { date: `${d.getDate()}/${d.getMonth() + 1}`, pnl: cumulative };
    });
  }, [filtered]);

  const scoreChartData = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime());
    return sorted.map((tr, i) => {
      const d = new Date(tr.created_at || '');
      return {
        date: `${d.getDate()}/${d.getMonth() + 1}`,
        score: tr.total_score ?? 0,
        avg: Math.round(sorted.slice(0, i + 1).reduce((s, x) => s + (x.total_score ?? 0), 0) / (i + 1)),
      };
    });
  }, [filtered]);

  const heatmap = useMemo(() => {
    return Array.from({ length: 28 }, (_, i) => {
      const d = new Date(now.getTime() - (27 - i) * 86400000);
      const dayTrades = trades.filter(tr => tr.date === d.toISOString().split('T')[0]);
      const score = dayTrades.length > 0
        ? Math.round(dayTrades.reduce((s, tr) => s + (tr.total_score ?? 0), 0) / dayTrades.length)
        : null;
      return { day: d.getDate(), score };
    });
  }, [trades]);

  const periodLabels: Record<Period, string> = { week: t('stats.7d'), month: t('stats.30d'), all: t('stats.allTime') };

  return (
    <div className="p-4 lg:p-8 page-enter">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-display font-bold">{t('stats.title')}</h1>
          <p className="text-xs text-muted-foreground">{t('stats.subtitle')}</p>
        </div>
        <div className="flex gap-1.5">
          {(['week', 'month', 'all'] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                period === p ? 'glow-button border-transparent' : 'glass-card text-muted-foreground border-border'
              }`}>
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      <GlassCard elevated className="mb-6 anim-fadeup">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase">{t('stats.pnlTotal')}</p>
            <p className={`text-4xl font-bold font-mono-num leading-none mt-1 ${totalPnl >= 0 ? 'text-success' : 'text-destructive'}`}>
              {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(0)}$
            </p>
            <p className="text-[10px] text-muted-foreground mt-2">{t('stats.onTrades', { count: filtered.length })}</p>
          </div>
          <ScoreRing score={filteredAvgScore} size={86} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: t('stats.winRate'), value: `${filteredWinRate}%`, c: 'text-success' },
            { label: t('stats.streakFire'), value: `${profile?.streak ?? 0}${t('dashboard.gamification.days')}`, c: 'text-primary' },
            { label: t('stats.level'), value: profile?.level || 'Bronze', c: 'text-gold' },
          ].map(s => (
            <div key={s.label} className="glass-card p-2.5 text-center rounded-xl">
              <p className="text-[8px] font-semibold tracking-widest text-muted-foreground uppercase">{s.label}</p>
              <p className={`text-lg font-bold font-mono-num mt-0.5 ${s.c}`}>{s.value}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {pnlChartData.length > 1 && (
          <GlassCard className="anim-fadeup-1">
            <p className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase mb-3">{t('stats.cumulativePnl')}</p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={pnlChartData}>
                <defs>
                  <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={totalPnl >= 0 ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)'} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={totalPnl >= 0 ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} width={35} />
                <Tooltip contentStyle={{ background: 'hsl(222, 35%, 9%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 11 }} />
                <Area type="monotone" dataKey="pnl" stroke={totalPnl >= 0 ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)'} fill="url(#pnlGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        )}
        {scoreChartData.length > 1 && (
          <GlassCard className="anim-fadeup-2">
            <p className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase mb-3">{t('stats.scoreProcess')}</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={scoreChartData}>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} width={25} />
                <Tooltip contentStyle={{ background: 'hsl(222, 35%, 9%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 11 }} />
                <Line type="monotone" dataKey="score" stroke="hsl(24, 95%, 53%)" strokeWidth={1.5} dot={{ r: 2, fill: 'hsl(24, 95%, 53%)' }} />
                <Line type="monotone" dataKey="avg" stroke="rgba(249,115,22,0.3)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard className="anim-fadeup-3">
          <p className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase mb-3">{t('stats.disciplineCalendar')}</p>
          <div className="grid grid-cols-7 gap-1">
            {(Array.isArray(daysShort) ? daysShort : ['L','M','M','J','V','S','D']).map((d, i) => (
              <div key={i} className="text-center text-[8px] text-muted-foreground pb-1">{d}</div>
            ))}
            {heatmap.map((d, i) => (
              <div key={i} className="aspect-square rounded-md"
                style={{
                  background: d.score === null ? 'rgba(255,255,255,0.03)'
                    : d.score >= 75 ? `rgba(34,197,94,${0.2 + (d.score - 75) / 100})`
                    : d.score >= 50 ? 'rgba(234,179,8,0.2)' : 'rgba(239,68,68,0.2)',
                }}
                title={d.score !== null ? `${d.score}%` : ''}
              />
            ))}
          </div>
        </GlassCard>
        {horsplan.length > 0 && (
          <GlassCard className="border border-destructive/15 anim-fadeup-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase">{t('stats.indisciplineCost')}</p>
                <p className="text-2xl font-bold font-mono-num text-destructive mt-1">{horsplanCost}$</p>
                <p className="text-[10px] text-muted-foreground mt-1">{t('stats.lostOnOutOfPlan', { count: horsplan.length })}</p>
              </div>
              <span className="text-4xl">💸</span>
            </div>
            <div className="mt-3 p-3 rounded-xl bg-success/5 border border-success/10">
              <p className="text-[11px] text-success font-semibold">
                {t('stats.followingPlan')} <strong className="font-mono-num">+{(totalPnl - horsplanCost).toFixed(0)}$</strong>
              </p>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
