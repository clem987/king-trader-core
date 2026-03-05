import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useTrades } from '@/hooks/useTrades';
import EmptyState from '@/components/EmptyState';

type FilterType = 'all' | 'winners' | 'losers';

export default function Journal() {
  const { trades } = useTrades();
  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = trades.filter(t => {
    if (filter === 'winners') return Number(t.result_amount) > 0;
    if (filter === 'losers') return Number(t.result_amount) < 0;
    return true;
  });

  const totalPnl = filtered.reduce((s, t) => s + (Number(t.result_amount) || 0), 0);
  const totalWins = filtered.filter(t => (Number(t.result_amount) || 0) > 0).length;
  const filteredWinRate = filtered.length > 0 ? Math.round((totalWins / filtered.length) * 100) : 0;
  const filteredAvgScore = filtered.length > 0
    ? Math.round(filtered.reduce((s, t) => s + (t.total_score ?? 0), 0) / filtered.length)
    : 0;

  return (
    <div className="p-4 lg:p-8 page-enter">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-display font-bold">Journal</h1>
          <p className="text-xs text-muted-foreground">{trades.length} trades enregistrés</p>
        </div>
        <div className="flex gap-2">
          {(['all', 'winners', 'losers'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
                filter === f ? 'glow-button border-transparent' : 'glass-card text-muted-foreground border-border'
              }`}
            >
              {f === 'all' ? 'Tous' : f === 'winners' ? '✓ Gagnants' : '✗ Perdants'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary bar */}
      {filtered.length > 0 && (
        <div className="flex items-center gap-4 mb-4 px-3 py-2.5 rounded-xl glass-card text-xs">
          <span className="text-muted-foreground">{filtered.length} trades</span>
          <span className="text-muted-foreground">·</span>
          <span className={`font-mono-num font-bold ${totalPnl >= 0 ? 'text-success' : 'text-destructive'}`}>
            {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(0)}$
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">WR <span className="font-mono-num text-foreground">{filteredWinRate}%</span></span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">Score moy <span className="font-mono-num text-foreground">{filteredAvgScore}%</span></span>
        </div>
      )}

      {/* Desktop table / mobile cards */}
      <div className="hidden lg:block">
        {filtered.length === 0 ? (
          <EmptyState
            icon="📋"
            title="Aucun trade enregistré"
            description="Lance ta première session pour commencer à tracker tes trades."
            action={{ label: 'Lancer une session', to: '/session' }}
          />
        ) : (
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-[9px] font-bold tracking-widest text-muted-foreground uppercase px-4 py-3">Date</th>
                  <th className="text-left text-[9px] font-bold tracking-widest text-muted-foreground uppercase px-4 py-3">Paire</th>
                  <th className="text-left text-[9px] font-bold tracking-widest text-muted-foreground uppercase px-4 py-3">Dir</th>
                  <th className="text-right text-[9px] font-bold tracking-widest text-muted-foreground uppercase px-4 py-3">R:R</th>
                  <th className="text-right text-[9px] font-bold tracking-widest text-muted-foreground uppercase px-4 py-3">P&L</th>
                  <th className="text-right text-[9px] font-bold tracking-widest text-muted-foreground uppercase px-4 py-3">Score</th>
                  <th className="text-center text-[9px] font-bold tracking-widest text-muted-foreground uppercase px-4 py-3">Plan</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(trade => {
                  const pnl = Number(trade.result_amount) || 0;
                  return (
                    <tr key={trade.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer">
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(trade.created_at || '').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold">{trade.pair || trade.setup || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold ${trade.direction === 'long' ? 'text-success' : 'text-destructive'}`}>
                          {trade.direction === 'long' ? '↗ Long' : trade.direction === 'short' ? '↘ Short' : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-right font-mono-num">{trade.rr_achieved || '—'}</td>
                      <td className={`px-4 py-3 text-xs text-right font-mono-num font-bold ${pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {pnl >= 0 ? '+' : ''}{pnl}$
                      </td>
                      <td className="px-4 py-3 text-xs text-right font-mono-num">{trade.total_score}%</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          trade.respected_plan ? 'chip-success' : 'chip-danger'
                        }`}>
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

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3">
        {filtered.length === 0 && (
          <EmptyState
            icon="📋"
            title="Aucun trade enregistré"
            description="Lance ta première session pour commencer à tracker tes trades."
            action={{ label: 'Lancer une session', to: '/session' }}
          />
        )}
        {filtered.map((trade, i) => {
          const pnl = Number(trade.result_amount) || 0;
          return (
            <motion.div key={trade.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <GlassCard className="py-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      pnl >= 0 ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'
                    }`}>
                      {pnl >= 0 ? '↗' : '↘'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{trade.pair || trade.setup || 'Trade'}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(trade.created_at || '').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold font-mono-num ${pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {pnl >= 0 ? '+' : ''}{pnl}$
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${trade.total_score ?? 0}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono-num font-semibold">{trade.total_score}%</span>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
