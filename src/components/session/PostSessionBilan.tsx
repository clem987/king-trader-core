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
import { useStreak } from '@/hooks/useStreak';
import { useGamification } from '@/hooks/useGamification';
import { showXPToast } from '@/components/gamification/XPToast';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export default function PostSessionBilan() {
  const { t } = useTranslation();
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
    if (next.has(id)) next.delete(id); else next.add(id);
    setAfterChecked(next);
  };

  const afterProgress = afterItems.length > 0 ? (afterChecked.size / afterItems.length) * 100 : 0;
  useEffect(() => { setTimeout(() => setShowed(true), 100); }, []);

  const totalPnl = todayTrades.reduce((s, tr) => s + (Number(tr.result_amount) || 0), 0);
  const wins = todayTrades.filter(tr => (Number(tr.result_amount) || 0) > 0).length;
  const losses = todayTrades.length - wins;
  const avgTradeScore = todayTrades.length > 0 ? todayTrades.reduce((s, tr) => s + (tr.total_score ?? 0), 0) / todayTrades.length : 0;
  const postSessionScore = afterItems.length > 0 ? (afterChecked.size / afterItems.length) * 30 : 30;
  const avgScore = Math.round(avgTradeScore + postSessionScore);
  const horsplan = todayTrades.filter(tr => !tr.respected_plan);
  const horsplanPnl = horsplan.reduce((s, tr) => s + (Number(tr.result_amount) || 0), 0);
  const winRate = todayTrades.length > 0 ? Math.round((wins / todayTrades.length) * 100) : 0;
  const bestTrade = todayTrades.length > 0 ? todayTrades.reduce((best, tr) => (Number(tr.result_amount) || 0) > (Number(best.result_amount) || 0) ? tr : best) : null;

  const verdict = avgScore >= 75
    ? { emoji: '🏆', label: t('bilan.excellent'), colorClass: 'text-success', msg: t('bilan.excellentMsg') }
    : avgScore >= 50
    ? { emoji: '⚡', label: t('bilan.correct'), colorClass: 'text-warning', msg: t('bilan.correctMsg') }
    : { emoji: '⚠️', label: t('bilan.risky'), colorClass: 'text-destructive', msg: t('bilan.riskyMsg') };

  const { updateStreakAfterSession } = useStreak();
  const { addXP } = useGamification();

  const handleSave = async () => {
    try {
      // XP rewards
      let totalXp = 30; // session complete
      showXPToast(30, t('gamification.sessionXp'));
      
      if (avgScore > 80) {
        totalXp += 20;
        setTimeout(() => showXPToast(20, t('gamification.bonusScoreXp')), 500);
      }
      
      const allRulesRespected = todayTrades.every(tr => tr.respected_plan);
      if (allRulesRespected && todayTrades.length > 0) {
        totalXp += 15;
        setTimeout(() => showXPToast(15, t('gamification.rulesXp')), 1000);
      }

      await addXP(totalXp);

      const result = await updateStreakAfterSession(avgScore);
      if (result?.improved && avgScore >= 75) {
        toast.success(t('bilan.streakToast', { count: result.newStreak }), { description: t('bilan.streakContinue') });
        if (result.newStreak === 7) {
          await addXP(50);
          setTimeout(() => showXPToast(50, t('gamification.streakBonusXp')), 1500);
        }
      } else if (avgScore < 75) {
        toast.error(t('bilan.streakReset'), { description: t('bilan.streakResetDesc') });
      } else {
        toast.success(t('bilan.sessionSaved'));
      }
    } catch {
      toast.success(t('bilan.sessionSaved'));
    }
    navigate('/dashboard');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: showed ? 1 : 0 }} className="space-y-4">
      <div className="text-center py-4">
        <span className="text-5xl">{verdict.emoji}</span>
        <h2 className={`text-xl font-display font-bold mt-3 ${verdict.colorClass}`}>{verdict.label}</h2>
        <p className="text-xs text-muted-foreground mt-2 max-w-xs mx-auto">{verdict.msg}</p>
      </div>

      <GlassCard elevated className="text-center py-6">
        <p className="text-[10px] font-semibold tracking-widest text-muted-foreground mb-3 uppercase">{t('bilan.finalScore')}</p>
        <div className="flex justify-center mb-3"><ScoreRing score={avgScore} size={100} /></div>
        <div className="flex justify-center gap-4 mb-2">
          <div className="text-center"><p className="text-[9px] text-muted-foreground uppercase">{t('bilan.preSession')}</p><p className="text-xs font-bold text-primary">40%</p></div>
          <div className="text-center"><p className="text-[9px] text-muted-foreground uppercase">{t('bilan.qcmTrade')}</p><p className="text-xs font-bold text-primary">30%</p></div>
          <div className="text-center"><p className="text-[9px] text-muted-foreground uppercase">{t('bilan.postSession')}</p><p className="text-xs font-bold" style={{ color: afterItems.length > 0 && afterChecked.size < afterItems.length ? 'hsl(var(--warning))' : 'hsl(var(--success))' }}>{Math.round(postSessionScore)}/30</p></div>
        </div>
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden mx-8 mt-2"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${avgScore}%` }} /></div>
        <p className="text-[10px] text-muted-foreground mt-2">{t('bilan.minRequired')}</p>
      </GlassCard>

      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="text-center py-4">
          <p className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase">{t('bilan.pnlSession')}</p>
          <p className={`text-2xl font-display font-bold mt-1 ${totalPnl >= 0 ? 'text-success' : 'text-destructive'}`}>{totalPnl >= 0 ? '+' : ''}{totalPnl}$</p>
          <p className="text-[10px] text-muted-foreground mt-1">{wins} win · {losses} loss</p>
        </GlassCard>
        <GlassCard className="text-center py-4">
          <p className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase">{t('dashboard.winRate')}</p>
          <p className="text-2xl font-display font-bold mt-1">{winRate}%</p>
          <div className="h-1 rounded-full bg-secondary overflow-hidden mx-4 mt-2"><div className="h-full rounded-full bg-success" style={{ width: `${winRate}%` }} /></div>
        </GlassCard>
        <GlassCard className="text-center py-4">
          <p className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase">{t('bilan.inPlan')}</p>
          <p className="text-2xl font-display font-bold mt-1">{todayTrades.length - horsplan.length}/{todayTrades.length}</p>
          <p className={`text-[10px] mt-1 ${horsplan.length > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
            {horsplan.length > 0 ? `${horsplan.length} ${t('bilan.outOfPlan')}` : t('bilan.noDeviation')}
          </p>
        </GlassCard>
        <GlassCard className="text-center py-4">
          <p className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase">{t('bilan.bestTrade')}</p>
          <p className="text-2xl font-display font-bold mt-1 text-success">{bestTrade ? `+${Number(bestTrade.result_amount) || 0}$` : '-'}</p>
          <p className="text-[10px] text-muted-foreground mt-1">{bestTrade?.setup || '-'}</p>
        </GlassCard>
      </div>

      {horsplan.length > 0 && (
        <GlassCard className="border border-destructive/15">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3"><span className="text-3xl">💸</span><div><p className="text-xs font-display font-semibold">{t('bilan.indisciplineCost')}</p><p className="text-[10px] text-muted-foreground">{t('bilan.outOfPlanTrades')}</p></div></div>
          </div>
          {horsplan.map(tr => (<div key={tr.id} className="flex justify-between py-2 border-t border-border/30"><span className="text-xs text-muted-foreground">{tr.setup} · Score {tr.total_score}%</span><span className="text-xs font-bold text-destructive">{Number(tr.result_amount) || 0}$</span></div>))}
          <div className="flex justify-between pt-2 mt-1 border-t border-border/50"><span className="text-xs font-semibold">{t('bilan.totalLostOutOfPlan')}</span><span className="text-sm font-bold text-destructive">{horsplanPnl}$</span></div>
        </GlassCard>
      )}

      <GlassCard className="!p-0">
        <div className="p-4 pb-2"><p className="text-xs font-display font-semibold">{t('bilan.tradeDetail')}</p></div>
        <div className="divide-y divide-border/30">
          {todayTrades.map(tr => {
            const pnl = Number(tr.result_amount) || 0;
            return (
              <div key={tr.id} className="flex items-center justify-between p-4 py-3">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${pnl >= 0 ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'}`}>{pnl >= 0 ? '✓' : '✗'}</div>
                  <div><p className="text-sm font-medium">{(tr as any).pair || tr.setup || 'Trade'}</p><div className="flex gap-2 items-center"><p className="text-[10px] text-muted-foreground">Score {tr.total_score}%</p></div></div>
                </div>
                <div className="text-right"><p className={`text-sm font-bold ${pnl >= 0 ? 'text-success' : 'text-destructive'}`}>{pnl >= 0 ? '+' : ''}{pnl}$</p>{!tr.respected_plan && <span className="text-[9px] font-bold text-destructive">HORS PLAN</span>}</div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {afterItems.length > 0 && (
        <GlassCard>
          <div className="flex items-center justify-between mb-2"><span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">{t('bilan.postChecklist')}</span><span className="text-xs font-semibold text-primary">{afterChecked.size}/{afterItems.length}</span></div>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden mb-3"><div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${afterProgress}%` }} /></div>
          <div className="space-y-1.5">
            {afterItems.map(item => (
              <button key={item.id} onClick={() => toggleAfterCheck(item.id)}
                className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl transition-all border text-xs ${afterChecked.has(item.id) ? 'glass-card-elevated border-primary/30' : 'glass-card border-border'}`}>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all flex-shrink-0 ${afterChecked.has(item.id) ? 'glow-button' : 'border border-muted-foreground/30'}`}>
                  {afterChecked.has(item.id) && <Check className="w-3 h-3" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    {item.is_required ? <Lock className="w-2.5 h-2.5 text-primary" /> : <ClipboardList className="w-2.5 h-2.5 text-muted-foreground" />}
                    <span className={afterChecked.has(item.id) ? 'text-foreground' : 'text-muted-foreground'}>{item.text}</span>
                  </div>
                  <span className={`text-[9px] ml-3.5 ${item.is_required ? 'text-primary' : 'text-muted-foreground'}`}>{item.is_required ? t('session.required') : t('session.recommended')}</span>
                </div>
              </button>
            ))}
          </div>
        </GlassCard>
      )}

      <GlassCard>
        <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-2">{t('bilan.sessionNote')}</p>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('bilan.notePlaceholder')}
          className="glass-input w-full px-3 py-2 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none h-20" />
      </GlassCard>

      <button onClick={handleSave} className="glow-button w-full py-4 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2">
        {t('bilan.saveSession')} · {avgScore >= 70 ? t('bilan.streakPlus') : t('bilan.scoreRecorded')}
      </button>
    </motion.div>
  );
}
