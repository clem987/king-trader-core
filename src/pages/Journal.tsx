import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '@/components/GlassCard';
import BottomNav from '@/components/BottomNav';
import { useTrades } from '@/hooks/useTrades';

type FilterType = 'all' | 'winners' | 'losers';

export default function Journal() {
  const navigate = useNavigate();
  const { trades } = useTrades();
  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = trades.filter(t => {
    if (filter === 'winners') return Number(t.result_amount) > 0;
    if (filter === 'losers') return Number(t.result_amount) < 0;
    return true;
  });

  return (
    <div className="min-h-screen pb-24 px-5 pt-14">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/dashboard')} className="text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-display font-bold">Journal</h1>
          <p className="text-[10px] text-muted-foreground">{trades.length} trades enregistrés</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
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

      {/* Trades list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-3xl mb-3">📋</p>
            <p className="text-muted-foreground text-sm font-display font-semibold">Aucun trade enregistré</p>
          </div>
        )}

        {filtered.map((trade, i) => {
          const pnl = Number(trade.result_amount) || 0;
          return (
            <motion.div
              key={trade.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <GlassCard className="py-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      pnl >= 0 ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'
                    }`}>
                      {pnl >= 0 ? '↗' : '↘'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        {(trade as any).pair || trade.setup || 'Trade'}
                        {(trade as any).direction && <span className="text-muted-foreground text-[10px] ml-1.5">{(trade as any).direction}</span>}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(trade.created_at || '').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        {trade.setup && ` · ${trade.setup}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {pnl >= 0 ? '+' : ''}{pnl}$
                    </span>
                    {(trade as any).rr_achieved > 0 && (
                      <p className="text-[10px] text-muted-foreground">{(trade as any).rr_achieved}R</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${trade.total_score ?? 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground font-semibold">{trade.total_score}%</span>
                </div>

                {/* QCM chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(trade as any).setup_respected !== undefined && (
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${(trade as any).setup_respected ? 'chip-success' : 'chip-danger'}`}>
                      Setup {(trade as any).setup_respected ? '✓' : '✗'}
                    </span>
                  )}
                  {(trade as any).plan_respected !== undefined && (
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${(trade as any).plan_respected ? 'chip-success' : 'chip-danger'}`}>
                      Plan {(trade as any).plan_respected ? '✓' : '✗'}
                    </span>
                  )}
                  {(trade as any).emotion && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full chip">
                      {(trade as any).emotion === 'calm' ? '😌' : (trade as any).emotion === 'stressed' ? '😰' : '😐'} {(trade as any).emotion}
                    </span>
                  )}
                </div>

                {trade.notes && (
                  <p className="text-[10px] text-muted-foreground mt-2 line-clamp-2 italic">{trade.notes}</p>
                )}
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}
