import { motion } from 'framer-motion';

interface TradeCardProps {
  trade: {
    id: string;
    pair?: string | null;
    setup?: string | null;
    direction?: string | null;
    result_amount?: number | null;
    total_score?: number | null;
    respected_plan?: boolean | null;
    rr_achieved?: number | null;
  };
  index?: number;
}

export default function TradeCard({ trade, index = 0 }: TradeCardProps) {
  const pnl = Number(trade.result_amount) || 0;
  const score = trade.total_score ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card p-4 rounded-2xl"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
            pnl >= 0 ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'
          }`}>
            {trade.direction === 'LONG' || trade.direction === 'long' ? '↗' : '↘'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-display font-semibold">
                {trade.pair || trade.setup || 'Trade'}
              </span>
              {!trade.respected_plan && (
                <span className="text-[9px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded-full">
                  HORS PLAN
                </span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">
              R:R {trade.rr_achieved || '—'} · Score{' '}
              <span className={`font-bold ${
                score >= 75 ? 'text-success' : score >= 50 ? 'text-warning' : 'text-destructive'
              }`}>
                {score}%
              </span>
            </p>
          </div>
        </div>
        <p className={`text-base font-bold font-mono-num ${pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
          {pnl >= 0 ? '+' : ''}{pnl}$
        </p>
      </div>
    </motion.div>
  );
}
