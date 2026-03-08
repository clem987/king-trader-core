import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useTrades } from '@/hooks/useTrades';
import EmptyState from '@/components/EmptyState';
import { useTranslation } from 'react-i18next';

type FilterType = 'all' | 'winners' | 'losers';

export default function Journal() {
  const { t } = useTranslation();
  const { trades } = useTrades();
  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = trades.filter(tr => {
    if (filter === 'winners') return Number(tr.result_amount) > 0;
    if (filter === 'losers') return Number(tr.result_amount) < 0;
    return true;
  });

  const totalPnl = filtered.reduce((s, tr) => s + (Number(tr.result_amount) || 0), 0);
  const totalWins = filtered.filter(tr => (Number(tr.result_amount) || 0) > 0).length;
  const filteredWinRate = filtered.length > 0 ? Math.round((totalWins / filtered.length) * 100) : 0;
  const filteredAvgScore = filtered.length > 0
    ? Math.round(filtered.reduce((s, tr) => s + (tr.total_score ?? 0), 0) / filtered.length) : 0;

  const filterLabels: Record<FilterType, string> = {
    all: t('journal.all'),
    winners: t('journal.winners'),
    losers: t('journal.losers'),
  };

  const pnlColor = (pnl: number) => pnl > 0 ? 'text-success' : pnl < 0 ? 'text-destructive' : 'text-muted-foreground';
  const pnlBg = (pnl: number) => pnl > 0 ? 'bg-success/15 text-success' : pnl < 0 ? 'bg-destructive/15 text-destructive' : 'bg-muted/30 text-muted-foreground';
  const pnlArrow = (pnl: number) => pnl > 0 ? '↗' : pnl < 0 ? '↘' : '→';
  const scoreColor = (score: number) => score >= 75 ? 'text-success' : score >= 50 ? 'text-warning' : 'text-destructive';

  return (
    <div className="p-4 lg:p-8 page-enter">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-display font-bold">{t('journal.title')}</h1>
          <p className="text-xs text-muted-foreground">{t('journal.tradesRecorded', { count: trades.length })}</p>
        </div>
        <div className="flex gap-2">
          {(['all', 'winners', 'losers'] as FilterType[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
                filter === f ? 'glow-button border-transparent' : 'glass-card text-muted-foreground border-border'
              }`}>
              {filterLabels[f]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center gap-4 mb-4 px-3 py-2.5 rounded-xl glass-card text-xs">
          <span className="text-muted-foreground">{filtered.length} {t('common.trades')}</span>
          <span className="text-muted-foreground">·</span>
          <span className={`font-mono-num font-bold ${pnlColor(totalPnl)}`}>
            {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(0)}$
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">WR <span className="font-mono-num text-foreground">{filteredWinRate}%</span></span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{t('dashboard.score')} <span className="font-mono-num text-foreground">{filteredAvgScore}%</span></span>
        </div>
      )}

      <div className="hidden lg:block">
        {filtered.length === 0 ? (
          <EmptyState icon="📋" title={t('journal.noTrades')} description={t('journal.noTradesDesc')} action={{ label: t('journal.launchSession'), to: '/session' }} />
        ) : (
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['date', 'pair', 'dir', 'rr', 'pnl', 'score', 'plan'].map(col => (
                    <th key={col} className={`text-${col === 'rr' || col === 'pnl' || col === 'score' ? 'right' : col === 'plan' ? 'center' : 'left'} text-[9px] font-bold tracking-widest text-muted-foreground uppercase px-4 py-3`}>
                      {t(`journal.${col}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(trade => {
                  const pnl = Number(trade.result_amount) || 0;
                  const score = trade.total_score ?? 0;
                  return (
                    <tr key={trade.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer">
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(trade.created_at || '').toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold">{trade.pair || trade.setup || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold ${trade.direction === 'long' ? 'text-success' : 'text-destructive'}`}>
                          {trade.direction === 'long' ? t('journal.long') : trade.direction === 'short' ? t('journal.short') : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-right font-mono-num">{trade.rr_achieved || '—'}</td>
                      <td className={`px-4 py-3 text-xs text-right font-mono-num font-bold ${pnlColor(pnl)}`}>
                        {pnl > 0 ? '+' : ''}{pnl}$
                      </td>
                      <td className={`px-4 py-3 text-xs text-right font-mono-num ${scoreColor(score)}`}>{score}%</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${trade.respected_plan ? 'chip-success' : 'chip-danger'}`}>
                          {trade.respected_plan ? '✓' : 'HORS'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="lg:hidden space-y-3">
        {filtered.length === 0 && (
          <EmptyState icon="📋" title={t('journal.noTrades')} description={t('journal.noTradesDesc')} action={{ label: t('journal.launchSession'), to: '/session' }} />
        )}
        {filtered.map((trade, i) => {
          const pnl = Number(trade.result_amount) || 0;
          const score = trade.total_score ?? 0;
          return (
            <motion.div key={trade.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <GlassCard className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${pnlBg(pnl)}`}>
                      {pnlArrow(pnl)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{trade.pair || trade.setup || 'Trade'}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(trade.created_at || '').toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold font-mono-num ${pnlColor(pnl)}`}>
                      {pnl > 0 ? '+' : ''}{pnl}$
                    </p>
                    <p className={`text-xs font-mono-num font-semibold ${scoreColor(score)}`}>{score}%</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
