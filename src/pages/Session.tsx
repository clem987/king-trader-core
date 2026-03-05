import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Lock, ArrowLeft, X, ClipboardList, Crosshair, Clock, Zap } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import PostSessionBilan from '@/components/session/PostSessionBilan';
import TradeFormQCM from '@/components/session/TradeFormQCM';
import TradeCard from '@/components/session/TradeCard';
import EmotionalTracker from '@/components/session/EmotionalTracker';
import { useSessionTimer } from '@/hooks/useSessionTimer';
import { useStrategies } from '@/hooks/useStrategies';
import { useStrategyChecklists, StrategyChecklistItem } from '@/hooks/useStrategyChecklists';
import { useProfile } from '@/hooks/useProfile';
import { useTrades } from '@/hooks/useTrades';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

type Phase = 'checklist' | 'active' | 'trade' | 'bilan';

function calcDisciplineScore(
  checklistTotal: number,
  checklistChecked: number,
  qcm: { setupRespected: boolean | null; planRespected: boolean | null; emotion: string | null; clarityScore: number | null }
) {
  const checklistScore = checklistTotal > 0 ? checklistChecked / checklistTotal : 1;
  let qcmScore = 0, qcmCount = 0;
  if (qcm.setupRespected !== null) { qcmScore += qcm.setupRespected ? 1 : 0.2; qcmCount++; }
  if (qcm.planRespected !== null) { qcmScore += qcm.planRespected ? 1 : 0.2; qcmCount++; }
  if (qcm.emotion !== null) { qcmScore += qcm.emotion === 'calm' ? 1 : qcm.emotion === 'neutral' ? 0.65 : 0.2; qcmCount++; }
  if (qcm.clarityScore !== null) { qcmScore += qcm.clarityScore / 5; qcmCount++; }
  const qcmFinal = qcmCount > 0 ? qcmScore / qcmCount : 0;
  const preSessionPart = checklistScore * 40;
  const qcmPart = qcmCount > 0 ? qcmFinal * 30 : 0;
  return Math.round(preSessionPart + qcmPart);
}

export default function Session() {
  const navigate = useNavigate();
  const { activeStrategy } = useStrategies();
  const { getItems, resetChecks } = useStrategyChecklists(activeStrategy?.id || null);
  const { profile, updateProfile } = useProfile();
  const { todayTrades, addTrade } = useTrades();
  const [phase, setPhase] = useState<Phase>('checklist');
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [showAbandon, setShowAbandon] = useState(false);
  const [emotion, setEmotion] = useState<string | null>(null);
  const { formatted, elapsed } = useSessionTimer(phase === 'active' || phase === 'trade');
  const isMobile = useIsMobile();

  const items: StrategyChecklistItem[] = getItems('before');
  const requiredItems = items.filter(i => i.is_required);
  const allRequiredChecked = requiredItems.length > 0 ? requiredItems.every(i => checked.has(i.id)) : items.length === 0;
  const maxReached = profile && todayTrades.length >= (profile.max_trades_per_day ?? 3);
  const progress = items.length > 0 ? (checked.size / items.length) * 100 : 0;
  const maxTrades = activeStrategy?.max_trades ?? profile?.max_trades_per_day ?? 3;
  const totalPnl = todayTrades.reduce((s, t) => s + (Number(t.result_amount) || 0), 0);
  const wins = todayTrades.filter(t => (Number(t.result_amount) || 0) > 0).length;
  const winRate = todayTrades.length > 0 ? Math.round((wins / todayTrades.length) * 100) : 0;
  const avgScore = todayTrades.length > 0
    ? Math.round(todayTrades.reduce((s, t) => s + (t.total_score ?? 0), 0) / todayTrades.length)
    : 0;

  const toggleCheck = (id: string) => {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setChecked(next);
  };

  const handleStartSession = () => {
    if (!maxReached && allRequiredChecked) {
      resetChecks.mutate();
      setPhase('active');
    }
  };

  const handleSubmitTrade = async (trade: any) => {
    if (!profile) return;
    setSaving(true);
    const total = calcDisciplineScore(
      items.length, checked.size,
      { setupRespected: trade.setup_respected, planRespected: trade.plan_respected, emotion: trade.emotion, clarityScore: trade.clarity_score }
    );
    try {
      await addTrade.mutateAsync({
        pair: trade.pair,
        direction: trade.direction,
        setup: trade.setup,
        result_amount: trade.result_amount,
        rr_achieved: trade.rr_achieved,
        setup_respected: trade.setup_respected,
        plan_respected: trade.plan_respected,
        respected_plan: trade.plan_respected,
        emotion: trade.emotion,
        clarity_score: trade.clarity_score,
        discipline_score: Math.round(total * 0.6),
        execution_quality: trade.setup_respected ? 20 : 0,
        plan_respect: trade.plan_respected ? 30 : 0,
        emotional_management: trade.emotion === 'calm' ? 20 : trade.emotion === 'neutral' ? 13 : 4,
        total_score: total,
        notes: trade.notes,
      });

      const newXp = (profile.xp ?? 0) + Math.round(total / 10);
      let newLevel = profile.level || 'Bronze';
      if (newXp >= 500) newLevel = 'King';
      else if (newXp >= 300) newLevel = 'Master';
      else if (newXp >= 150) newLevel = 'Diamond';
      else if (newXp >= 50) newLevel = 'Gold';

      await updateProfile.mutateAsync({
        xp: newXp,
        level: newLevel,
        streak: total >= 70 ? (profile.streak ?? 0) + 1 : 0,
      });

      toast.success(`🏆 Score: ${total}/100 — ${total >= 75 ? '+1 streak !' : 'Bonne session'}`);
      setChecked(new Set());
      setPhase('active');
    } catch {
      toast.error("⚠️ Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleAbandon = () => {
    setShowAbandon(false);
    navigate('/dashboard');
  };

  return (
    <div className="p-4 lg:p-8 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => phase === 'checklist' ? navigate('/dashboard') : setShowAbandon(true)} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-display font-bold flex items-center gap-2">
              {phase === 'checklist' ? (
                <>PRÉ-SESSION</>
              ) : phase === 'active' ? (
                <><Zap className="w-4 h-4 text-primary" /> SESSION MODE™</>
              ) : phase === 'trade' ? (
                'Nouveau Trade'
              ) : 'Bilan'}
            </h1>
            <p className="text-[10px] text-muted-foreground">{activeStrategy?.name || profile?.strategy || 'Ma stratégie'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(phase === 'active' || phase === 'trade') && (
            <>
              <div className="chip text-[11px]">
                <Clock className="w-3 h-3" />
                <span className="font-mono-num">{formatted}</span>
              </div>
              <button onClick={() => setShowAbandon(true)} className="w-9 h-9 rounded-xl glass-card flex items-center justify-center hover:bg-muted/50 transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </>
          )}
        </div>
      </div>

      {maxReached && phase === 'checklist' && (
        <GlassCard className="mb-4 border-warning/30 text-center">
          <p className="text-sm text-warning font-semibold">⚠️ Max trades atteint ({profile?.max_trades_per_day}/jour)</p>
          <p className="text-[10px] text-muted-foreground mt-1">Discipline = pas de trade de plus</p>
        </GlassCard>
      )}

      <AnimatePresence mode="wait">
        {/* ═══ PHASE CHECKLIST ═══ */}
        {phase === 'checklist' && (
          <motion.div key="checklist" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className={`${!isMobile ? 'grid grid-cols-5 gap-8' : ''}`}>
              {/* Left column — checklist */}
              <div className={!isMobile ? 'col-span-3' : ''}>
                <GlassCard elevated className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">Validation</span>
                    <span className="text-xs font-semibold text-primary font-mono-num">{checked.size}/{items.length}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progress}%`,
                        background: progress >= 75
                          ? 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--success)))'
                          : 'linear-gradient(90deg, hsl(var(--destructive)), hsl(var(--primary)))',
                      }}
                    />
                  </div>
                  {allRequiredChecked && items.length > 0 && (
                    <p className="text-[10px] text-success font-semibold mt-2">✓ Tous les items obligatoires validés — Tu es prêt.</p>
                  )}
                </GlassCard>

                {items.length === 0 ? (
                  <GlassCard className="mb-4 text-center">
                    <p className="text-sm text-muted-foreground py-4">
                      Aucune checklist configurée.
                      {!activeStrategy && ' Crée une stratégie dans les réglages.'}
                      {activeStrategy && ' Ajoute des items dans les réglages de ta stratégie.'}
                    </p>
                  </GlassCard>
                ) : (
                  <div className="space-y-2 mb-6">
                    {items.map((item, i) => (
                      <button
                        key={item.id}
                        onClick={() => toggleCheck(item.id)}
                        className={`flex items-center gap-3.5 w-full text-left px-4 py-4 rounded-2xl transition-all border anim-fadeup ${
                          checked.has(item.id) ? 'glass-card-elevated border-primary/30 bg-primary/5' : 'glass-card border-border hover:border-primary/20'
                        }`}
                        style={{ animationDelay: `${i * 0.05}s` }}
                      >
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
                          checked.has(item.id) ? 'glow-button' : 'border-2 border-muted-foreground/30'
                        }`}>
                          {checked.has(item.id) && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            {item.is_required ? <Lock className="w-3 h-3 text-primary shrink-0" /> : <ClipboardList className="w-3 h-3 text-muted-foreground shrink-0" />}
                            <span className={`text-sm ${checked.has(item.id) ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                              {item.text}
                            </span>
                          </div>
                          <span className={`text-[9px] ml-4.5 ${item.is_required ? 'text-primary' : 'text-muted-foreground'}`}>
                            {item.is_required ? 'OBLIGATOIRE' : 'RECOMMANDÉ'}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleStartSession}
                  disabled={!allRequiredChecked || !!maxReached || items.length === 0}
                  className={`w-full py-4 rounded-2xl font-display font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    allRequiredChecked && !maxReached && items.length > 0 ? 'glow-button' : 'glass-card text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  {maxReached ? '⛔ Limite de trades atteinte' : !allRequiredChecked ? (
                    <><Lock className="w-4 h-4" /> 🔒 Session verrouillée</>
                  ) : '⚡ Lancer la session →'}
                </button>
              </div>

              {/* Right column — strategy preview (desktop only) */}
              {!isMobile && (
                <div className="col-span-2">
                  <GlassCard elevated>
                    <div className="text-center py-6">
                      <div className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase mb-3">
                        STRATÉGIE ACTIVE
                      </div>
                      <h3 className="text-xl font-display font-bold mb-1">{activeStrategy?.name || 'Ma stratégie'}</h3>
                      <p className="text-xs text-muted-foreground mb-6">
                        {activeStrategy?.market || 'NQ'} · R:R min {activeStrategy?.rr_min || '2'}:1 · Max {activeStrategy?.max_trades || 3} trades
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="glass-card p-3 rounded-xl">
                          <p className="text-[8px] font-semibold tracking-widest text-muted-foreground uppercase">MARCHÉ</p>
                          <p className="text-lg font-bold font-mono-num mt-0.5">{activeStrategy?.market || 'NQ'}</p>
                        </div>
                        <div className="glass-card p-3 rounded-xl">
                          <p className="text-[8px] font-semibold tracking-widest text-muted-foreground uppercase">R:R MIN</p>
                          <p className="text-lg font-bold font-mono-num mt-0.5">{activeStrategy?.rr_min || 2}:1</p>
                        </div>
                        <div className="glass-card p-3 rounded-xl">
                          <p className="text-[8px] font-semibold tracking-widest text-muted-foreground uppercase">MAX TRADES</p>
                          <p className="text-lg font-bold font-mono-num mt-0.5">{activeStrategy?.max_trades || 3}</p>
                        </div>
                        <div className="glass-card p-3 rounded-xl">
                          <p className="text-[8px] font-semibold tracking-widest text-muted-foreground uppercase">RISQUE MAX</p>
                          <p className="text-lg font-bold font-mono-num mt-0.5">{activeStrategy?.risk_max || 1}%</p>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                  <div className="mt-4 text-center">
                    <p className="text-[10px] text-muted-foreground">
                      Valide ta checklist pour lancer la session
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ═══ PHASE ACTIVE ═══ */}
        {phase === 'active' && (
          <motion.div key="active" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <div className={`${!isMobile ? 'grid grid-cols-5 gap-8' : 'space-y-4'}`}>
              {/* Left column — session info */}
              <div className={`${!isMobile ? 'col-span-2' : ''} space-y-4`}>
                {/* Strategy + Timer */}
                <GlassCard elevated>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-mono tracking-widest text-primary uppercase">SESSION MODE™</span>
                      </div>
                      <h3 className="text-base font-display font-bold">{activeStrategy?.name || 'Ma stratégie'}</h3>
                      <p className="text-[10px] text-muted-foreground">
                        {activeStrategy?.market || 'NQ'} · R:R min {activeStrategy?.rr_min || 2}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-mono font-bold tracking-widest text-foreground">{formatted}</p>
                      <p className="text-[9px] text-muted-foreground tracking-widest uppercase">DURÉE</p>
                    </div>
                  </div>

                  {/* 4 stats live */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'TRADES', value: `${todayTrades.length}/${maxTrades}` },
                      { label: 'P&L', value: `${totalPnl >= 0 ? '+' : ''}${totalPnl}$`, colorClass: totalPnl >= 0 ? 'text-success' : 'text-destructive' },
                      { label: 'WIN RATE', value: `${winRate}%` },
                      { label: 'SCORE', value: `${avgScore}%`, colorClass: avgScore >= 75 ? 'text-success' : avgScore >= 50 ? 'text-warning' : 'text-destructive' },
                    ].map(s => (
                      <div key={s.label} className="glass-card p-2 text-center rounded-xl">
                        <p className="text-[7px] font-semibold tracking-widest text-muted-foreground uppercase">{s.label}</p>
                        <p className={`text-sm font-bold font-mono-num mt-0.5 ${s.colorClass || 'text-foreground'}`}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* Emotional tracker */}
                <GlassCard>
                  <EmotionalTracker emotion={emotion} onSelect={setEmotion} />
                </GlassCard>

                {/* During checklist */}
                <DuringChecklistCompact strategyId={activeStrategy?.id || null} checked={checked} toggleCheck={toggleCheck} />

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={() => { setChecked(new Set()); setPhase('trade'); }}
                    disabled={todayTrades.length >= maxTrades}
                    className="glow-button w-full py-4 rounded-2xl font-display font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Crosshair className="w-4 h-4" />
                    {todayTrades.length >= maxTrades ? 'Limite atteinte' : '🎯 Prendre un trade'}
                  </button>
                  <button
                    onClick={() => setPhase('bilan')}
                    className="w-full py-3 rounded-2xl font-display font-semibold text-sm text-destructive border border-destructive/20 hover:bg-destructive/5 transition-all flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Terminer la session
                  </button>
                </div>
              </div>

              {/* Right column — trades */}
              <div className={!isMobile ? 'col-span-3' : ''}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-display font-bold">Trades de la session</h3>
                  <span className="text-[10px] text-muted-foreground">{todayTrades.length} pris</span>
                </div>

                {todayTrades.length === 0 ? (
                  <GlassCard className="text-center py-16">
                    <p className="text-5xl opacity-50 mb-4">🎯</p>
                    <p className="font-display font-bold text-lg mb-1">Aucun trade encore</p>
                    <p className="text-sm text-muted-foreground">Prends ton premier trade quand tu es prêt</p>
                  </GlassCard>
                ) : (
                  <div className="space-y-3">
                    {todayTrades.map((trade, i) => (
                      <TradeCard key={trade.id} trade={trade} index={i} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ PHASE TRADE ═══ */}
        {phase === 'trade' && (
          <motion.div key="trade" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <div className={`${!isMobile ? 'grid grid-cols-5 gap-8' : ''}`}>
              <div className={!isMobile ? 'col-span-3' : ''}>
                <DuringChecklist strategyId={activeStrategy?.id || null} checked={checked} toggleCheck={toggleCheck} />
                <TradeFormQCM onSubmit={handleSubmitTrade} saving={saving} />
              </div>
              {!isMobile && (
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-display font-bold">Trades précédents</h3>
                  </div>
                  {todayTrades.length === 0 ? (
                    <GlassCard className="text-center py-8">
                      <p className="text-muted-foreground text-sm">Aucun trade dans cette session</p>
                    </GlassCard>
                  ) : (
                    <div className="space-y-3">
                      {todayTrades.map((trade, i) => (
                        <TradeCard key={trade.id} trade={trade} index={i} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ═══ PHASE BILAN ═══ */}
        {phase === 'bilan' && (
          <motion.div key="bilan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <PostSessionBilan />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Abandon dialog */}
      {showAbandon && (
        <div className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setShowAbandon(false)}>
          <div className="glass-card-elevated p-6 max-w-xs w-full text-center" onClick={e => e.stopPropagation()}>
            <p className="text-3xl mb-3">⚠️</p>
            <p className="font-display font-bold text-lg mb-2">Abandonner la session ?</p>
            <p className="text-xs text-muted-foreground mb-5">Ton streak sera remis à zéro.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowAbandon(false)} className="flex-1 glow-button py-3 rounded-xl font-display font-bold text-sm">Continuer</button>
              <button onClick={handleAbandon} className="flex-1 glass-card py-3 rounded-xl font-display font-bold text-sm text-destructive border border-destructive/20">Abandonner</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact during-checklist for session active view
function DuringChecklistCompact({ strategyId, checked, toggleCheck }: {
  strategyId: string | null;
  checked: Set<string>;
  toggleCheck: (id: string) => void;
}) {
  const { getItems } = useStrategyChecklists(strategyId);
  const items = getItems('during');
  if (items.length === 0) return null;

  const checkedCount = [...checked].filter(id => items.some(i => i.id === id)).length;

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">Checklist pendant</span>
        <span className="text-xs font-semibold text-primary font-mono-num">{checkedCount}/{items.length}</span>
      </div>
      <div className="space-y-1.5">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => toggleCheck(item.id)}
            className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl transition-all border text-xs ${
              checked.has(item.id) ? 'glass-card-elevated border-primary/30' : 'glass-card border-border'
            }`}
          >
            <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all flex-shrink-0 ${
              checked.has(item.id) ? 'glow-button' : 'border border-muted-foreground/30'
            }`}>
              {checked.has(item.id) && <Check className="w-3 h-3" />}
            </div>
            <span className={checked.has(item.id) ? 'text-foreground' : 'text-muted-foreground'}>{item.text}</span>
          </button>
        ))}
      </div>
    </GlassCard>
  );
}

// Full during-checklist for trade form phase
function DuringChecklist({ strategyId, checked, toggleCheck }: {
  strategyId: string | null;
  checked: Set<string>;
  toggleCheck: (id: string) => void;
}) {
  const { getItems } = useStrategyChecklists(strategyId);
  const items = getItems('during');
  const requiredItems = items.filter(i => i.is_required);
  const allRequiredChecked = requiredItems.every(i => checked.has(i.id));

  if (items.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">Checklist entrée</span>
        <span className="text-xs font-semibold text-primary font-mono-num">{[...checked].filter(id => items.some(i => i.id === id)).length}/{items.length}</span>
      </div>
      <div className="space-y-1.5">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => toggleCheck(item.id)}
            className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl transition-all border text-xs ${
              checked.has(item.id) ? 'glass-card-elevated border-primary/30' : 'glass-card border-border'
            }`}
          >
            <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all flex-shrink-0 ${
              checked.has(item.id) ? 'glow-button' : 'border border-muted-foreground/30'
            }`}>
              {checked.has(item.id) && <Check className="w-3 h-3" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                {item.is_required ? <Lock className="w-2.5 h-2.5 text-primary" /> : <ClipboardList className="w-2.5 h-2.5 text-muted-foreground" />}
                <span className={checked.has(item.id) ? 'text-foreground' : 'text-muted-foreground'}>{item.text}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
      {!allRequiredChecked && requiredItems.length > 0 && (
        <div className="glass-card p-3 mb-4 mt-2 border border-warning/20 text-center rounded-xl">
          <p className="text-xs text-warning font-semibold">🔒 Valide les items obligatoires pour débloquer le formulaire</p>
        </div>
      )}
    </div>
  );
}
