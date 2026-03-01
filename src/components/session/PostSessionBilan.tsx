import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, Lock, ClipboardList } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import ScoreRing from '@/components/ScoreRing';
import { useTrades } from '@/hooks/useTrades';
import { useProfile } from '@/hooks/useProfile';
import { useStrategies } from '@/hooks/useStrategies';
import { useStrategyChecklists } from '@/hooks/useStrategyChecklists';
import { toast } from 'sonner';

export default function PostSessionBilan() {
  const navigate = useNavigate();
  const { todayTrades } = useTrades();
  const { profile } = useProfile();
  const { activeStrategy } = useStrategies();
  const { getItems } = useStrategyChecklists(activeStrategy?.id || null);
  const afterItems = getItems('after');
  const [afterChecked, setAfterChecked] = useState<Set<string>>(new Set());
  const [note, setNote] = useState('');
  const [showed, setShowed] = useState(false);

  const toggleAfterCheck = (id: string) => {
    const next = new Set(afterChecked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setAfterChecked(next);
  };

  const afterProgress = afterItems.length > 0 ? (afterChecked.size / afterItems.length) * 100 : 0;

  useEffect(() => { setTimeout(() => setShowed(true), 100); }, []);

  const totalPnl = todayTrades.reduce((s, t) => s + (Number(t.result_amount) || 0), 0);
  const wins = todayTrades.filter(t => (Number(t.result_amount) || 0) > 0).length;
  const losses = todayTrades.length - wins;
  const avgScore = todayTrades.length > 0
    ? Math.round(todayTrades.reduce((s, t) => s + (t.total_score ?? 0), 0) / todayTrades.length)
    : 0;
  const horsplan = todayTrades.filter(t => !t.respected_plan);
  const horsplanPnl = horsplan.reduce((s, t) => s + (Number(t.result_amount) || 0), 0);
  const winRate = todayTrades.length > 0 ? Math.round((wins / todayTrades.length) * 100) : 0;
  const bestTrade = todayTrades.length > 0
    ? todayTrades.reduce((best, t) => (Number(t.result_amount) || 0) > (Number(best.result_amount) || 0) ? t : best)
    : null;

  const verdict = avgScore >= 75
    ? { emoji: '🏆', label: 'Excellente session', colorClass: 'text-success', msg: 'Tu as respecté ton plan. C\'est ça qui crée des résultats sur le long terme.' }
    : avgScore >= 50
    ? { emoji: '⚡', label: 'Session correcte', colorClass: 'text-warning', msg: 'Quelques déviations détectées. Analyse tes trades hors plan pour progresser.' }
    : { emoji: '⚠️', label: 'Session à risque', colorClass: 'text-destructive', msg: 'Trop de trades hors plan. Prends le temps de revoir tes règles.' };

  const handleSave = () => {
    toast.success(`Session sauvegardée ! ${avgScore >= 75 ? '+1 streak 🔥' : 'Score enregistré'}`);
    navigate('/dashboard');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: showed ? 1 : 0 }}
      className="space-y-4"
    >
      {/* Verdict Header */}
      <div className="text-center py-4">
        <span className="text-5xl">{verdict.emoji}</span>
        <h2 className={`text-xl font-display font-bold mt-3 ${verdict.colorClass}`}>{verdict.label}</h2>
        <p className="text-xs text-muted-foreground mt-2 max-w-xs mx-auto">{verdict.msg}</p>
      </div>

      {/* Score global */}
      <GlassCard elevated className="text-center py-6">
        <p className="text-[10px] font-semibold tracking-widest text-muted-foreground mb-3 uppercase">Score Process Final</p>
        <div className="flex justify-center mb-3">
          <ScoreRing score={avgScore} size={100} />
        </div>
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden mx-8 mt-2">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${avgScore}%` }} />
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">Min requis: 70% pour valider la session</p>
      </GlassCard>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="text-center py-4">
          <p className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase">P&L Session</p>
          <p className={`text-2xl font-display font-bold mt-1 ${totalPnl >= 0 ? 'text-success' : 'text-destructive'}`}>
            {totalPnl >= 0 ? '+' : ''}{totalPnl}$
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">{wins} win · {losses} loss</p>
        </GlassCard>
        <GlassCard className="text-center py-4">
          <p className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase">Win Rate</p>
          <p className="text-2xl font-display font-bold mt-1">{winRate}%</p>
          <div className="h-1 rounded-full bg-secondary overflow-hidden mx-4 mt-2">
            <div className="h-full rounded-full bg-success" style={{ width: `${winRate}%` }} />
          </div>
        </GlassCard>
        <GlassCard className="text-center py-4">
          <p className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase">Dans le plan</p>
          <p className="text-2xl font-display font-bold mt-1">{todayTrades.length - horsplan.length}/{todayTrades.length}</p>
          <p className={`text-[10px] mt-1 ${horsplan.length > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
            {horsplan.length > 0 ? `${horsplan.length} hors plan` : '✓ Aucune déviation'}
          </p>
        </GlassCard>
        <GlassCard className="text-center py-4">
          <p className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase">Meilleur trade</p>
          <p className="text-2xl font-display font-bold mt-1 text-success">
            {bestTrade ? `+${Number(bestTrade.result_amount) || 0}$` : '-'}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">{bestTrade?.setup || '-'}</p>
        </GlassCard>
      </div>

      {/* Coût indiscipline */}
      {horsplan.length > 0 && (
        <GlassCard className="border border-destructive/15">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">💸</span>
              <div>
                <p className="text-xs font-display font-semibold">Coût de l'indiscipline</p>
                <p className="text-[10px] text-muted-foreground">Trades hors plan</p>
              </div>
            </div>
          </div>
          {horsplan.map(t => (
            <div key={t.id} className="flex justify-between py-2 border-t border-border/30">
              <span className="text-xs text-muted-foreground">{t.setup} · Score {t.total_score}%</span>
              <span className="text-xs font-bold text-destructive">{Number(t.result_amount) || 0}$</span>
            </div>
          ))}
          <div className="flex justify-between pt-2 mt-1 border-t border-border/50">
            <span className="text-xs font-semibold">Total perdu hors plan</span>
            <span className="text-sm font-bold text-destructive">{horsplanPnl}$</span>
          </div>
        </GlassCard>
      )}

      {/* Detail trades */}
      <GlassCard className="!p-0">
        <div className="p-4 pb-2">
          <p className="text-xs font-display font-semibold">Détail des trades</p>
        </div>
        <div className="divide-y divide-border/30">
          {todayTrades.map(t => {
            const pnl = Number(t.result_amount) || 0;
            return (
              <div key={t.id} className="flex items-center justify-between p-4 py-3">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    pnl >= 0 ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'
                  }`}>
                    {pnl >= 0 ? '✓' : '✗'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{(t as any).pair || t.setup || 'Trade'}</p>
                    <div className="flex gap-2 items-center">
                      <p className="text-[10px] text-muted-foreground">Score {t.total_score}%</p>
                      {(t as any).emotion && <span className="text-[9px]">{(t as any).emotion === 'calm' ? '😌' : (t as any).emotion === 'stressed' ? '😰' : '😐'}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {pnl >= 0 ? '+' : ''}{pnl}$
                  </p>
                  {!t.respected_plan && <span className="text-[9px] font-bold text-destructive">HORS PLAN</span>}
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Note */}
      <GlassCard>
        <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-2">Note de session</p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ce que j'ai bien fait, ce que j'améliore, mon état d'esprit..."
          className="glass-input w-full px-3 py-2 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none h-20"
        />
      </GlassCard>

      {/* Save CTA */}
      <button
        onClick={handleSave}
        className="glow-button w-full py-4 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2"
      >
        💾 Sauvegarder la session · {avgScore >= 70 ? '+1 streak 🔥' : 'score enregistré'}
      </button>
    </motion.div>
  );
}
