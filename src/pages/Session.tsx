import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Lock, ArrowLeft, X, ClipboardList } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import BottomNav from '@/components/BottomNav';
import SessionActiveView from '@/components/session/SessionActiveView';
import PostSessionBilan from '@/components/session/PostSessionBilan';
import TradeFormQCM from '@/components/session/TradeFormQCM';
import { useStrategies } from '@/hooks/useStrategies';
import { useStrategyChecklists, StrategyChecklistItem } from '@/hooks/useStrategyChecklists';
import { useProfile } from '@/hooks/useProfile';
import { useTrades } from '@/hooks/useTrades';
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
  const qcmWeight = qcmCount > 0 ? 0.4 : 0;
  return Math.round((checklistScore * (1 - qcmWeight) + (qcmCount > 0 ? qcmFinal * 0.4 : 0)) * 100);
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

  // Use strategy "before" checklist items
  const items: StrategyChecklistItem[] = getItems('before');
  const requiredItems = items.filter(i => i.is_required);
  const allRequiredChecked = requiredItems.length > 0 ? requiredItems.every(i => checked.has(i.id)) : items.length === 0;
  const maxReached = profile && todayTrades.length >= (profile.max_trades_per_day ?? 3);
  const progress = items.length > 0 ? (checked.size / items.length) * 100 : 0;

  const toggleCheck = (id: string) => {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setChecked(next);
  };

  const handleStartSession = () => {
    if (!maxReached && allRequiredChecked) {
      // Reset checks in DB for next session
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

      toast.success(`Trade enregistré ! Score: ${total}/100`);
      setChecked(new Set());
      setPhase('active');
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleAbandon = () => {
    setShowAbandon(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen pb-24 px-5 pt-14">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => phase === 'checklist' ? navigate('/dashboard') : setShowAbandon(true)} className="text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-display font-bold">
              {phase === 'checklist' ? 'Pré-Session' : phase === 'active' ? 'Session Mode™' : phase === 'trade' ? 'Nouveau Trade' : 'Bilan'}
            </h1>
            <p className="text-[10px] text-muted-foreground">{activeStrategy?.name || profile?.strategy || 'Ma stratégie'}</p>
          </div>
        </div>
        {(phase === 'active' || phase === 'trade') && (
          <button onClick={() => setShowAbandon(true)} className="w-9 h-9 rounded-xl glass-card flex items-center justify-center">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {maxReached && phase === 'checklist' && (
        <GlassCard className="mb-4 border-warning/30 text-center">
          <p className="text-sm text-warning font-semibold">⚠️ Max trades atteint ({profile?.max_trades_per_day}/jour)</p>
          <p className="text-[10px] text-muted-foreground mt-1">Discipline = pas de trade de plus</p>
        </GlassCard>
      )}

      <AnimatePresence mode="wait">
        {/* Phase 1: Checklist */}
        {phase === 'checklist' && (
          <motion.div key="checklist" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Progress */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">Validation</span>
                <span className="text-xs font-semibold text-primary">{checked.size}/{items.length}</span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              {allRequiredChecked && items.length > 0 && <p className="text-[10px] text-success font-semibold mt-2">✓ Tous les items obligatoires validés — Tu es prêt.</p>}
            </div>

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
                    className={`flex items-center gap-3.5 w-full text-left px-4 py-4 rounded-2xl transition-all border ${
                      checked.has(item.id) ? 'glass-card-elevated border-primary/30' : 'glass-card border-border'
                    }`}
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
                      checked.has(item.id) ? 'glow-button' : 'border-2 border-muted-foreground/30'
                    }`}>
                      {checked.has(item.id) && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {item.is_required ? (
                          <Lock className="w-3 h-3 text-primary shrink-0" />
                        ) : (
                          <ClipboardList className="w-3 h-3 text-muted-foreground shrink-0" />
                        )}
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
              className={`w-full py-4 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                allRequiredChecked && !maxReached && items.length > 0 ? 'glow-button' : 'glass-card text-muted-foreground cursor-not-allowed'
              }`}
            >
              {maxReached ? (
                'Limite atteinte'
              ) : !allRequiredChecked ? (
                <>
                  <Lock className="w-4 h-4" />
                  🔒 Session verrouillée
                </>
              ) : (
                '✓ Lancer la session'
              )}
            </button>
          </motion.div>
        )}

        {/* Phase 2: Active Session */}
        {phase === 'active' && (
          <motion.div key="active" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <SessionActiveView
              onTakeTrade={() => {
                setChecked(new Set());
                setPhase('trade');
              }}
              onEndSession={() => setPhase('bilan')}
            />
          </motion.div>
        )}

        {/* Phase 3: Trade Entry Form with QCM */}
        {phase === 'trade' && (
          <motion.div key="trade" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            {/* Mini checklist using "during" items */}
            <DuringChecklist strategyId={activeStrategy?.id || null} checked={checked} toggleCheck={toggleCheck} />

            <div className={`transition-opacity ${checked.size >= 0 ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
              <TradeFormQCM onSubmit={handleSubmitTrade} saving={saving} />
            </div>
          </motion.div>
        )}

        {/* Phase 4: Post-session bilan */}
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
            <p className="text-xs text-muted-foreground mb-5">Ton streak sera remis à zéro. La discipline, c'est aussi finir ce qu'on commence.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowAbandon(false)} className="flex-1 glow-button py-3 rounded-xl font-display font-bold text-sm">Continuer</button>
              <button onClick={handleAbandon} className="flex-1 glass-card py-3 rounded-xl font-display font-bold text-sm text-destructive border border-destructive/20">Abandonner</button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

// Mini "during" checklist for trade phase
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
        <span className="text-xs font-semibold text-primary">{[...checked].filter(id => items.some(i => i.id === id)).length}/{items.length}</span>
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
