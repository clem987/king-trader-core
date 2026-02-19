import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Filter, TrendingUp, TrendingDown } from 'lucide-react';
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
    <div className="min-h-screen pb-24 px-4 pt-12">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/dashboard')} className="text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-display font-bold">Journal</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(['all', 'winners', 'losers'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              filter === f ? 'glow-button text-primary-foreground' : 'glass-card text-muted-foreground'
            }`}
          >
            {f === 'all' ? 'Tous' : f === 'winners' ? 'Gagnants' : 'Perdants'}
          </button>
        ))}
      </div>

      {/* Trades list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">Aucun trade enregistré</p>
          </div>
        )}

        {filtered.map((trade, i) => (
          <motion.div
            key={trade.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <GlassCard className="py-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold">{trade.setup || 'Trade'}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(trade.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {Number(trade.result_amount) >= 0 ? (
                    <TrendingUp className="w-3.5 h-3.5 text-success" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-destructive" />
                  )}
                  <span className={`text-sm font-bold ${Number(trade.result_amount) >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {Number(trade.result_amount) >= 0 ? '+' : ''}{trade.result_amount}$
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${trade.total_score ?? 0}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{trade.total_score}/100</span>
              </div>

              {trade.notes && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{trade.notes}</p>
              )}
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
