import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Lock, ArrowLeft, Camera, Send } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import BottomNav from '@/components/BottomNav';
import { useChecklist } from '@/hooks/useChecklist';
import { useProfile } from '@/hooks/useProfile';
import { useTrades } from '@/hooks/useTrades';
import { toast } from 'sonner';

type Phase = 'checklist' | 'trade' | 'review';

export default function Session() {
  const navigate = useNavigate();
  const { items } = useChecklist();
  const { profile, updateProfile } = useProfile();
  const { todayTrades, addTrade } = useTrades();
  const [phase, setPhase] = useState<Phase>('checklist');
  const [checked, setChecked] = useState<Set<string>>(new Set());

  // Trade review state
  const [setup, setSetup] = useState('');
  const [result, setResult] = useState('');
  const [respectedPlan, setRespectedPlan] = useState(false);
  const [hesitated, setHesitated] = useState(false);
  const [feltFear, setFeltFear] = useState(false);
  const [respectedRR, setRespectedRR] = useState(false);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const allChecked = items.length > 0 && checked.size === items.length;
  const maxReached = profile && todayTrades.length >= (profile.max_trades_per_day ?? 3);

  const toggleCheck = (id: string) => {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setChecked(next);
  };

  const calculateScore = () => {
    let score = 0;
    if (respectedPlan) score += 30;
    if (!hesitated) score += 20;
    if (!feltFear) score += 20;
    if (respectedRR) score += 30;
    return score;
  };

  const handleSubmitTrade = async () => {
    if (!profile) return;
    setSaving(true);
    const total = calculateScore();
    try {
      await addTrade.mutateAsync({
        setup,
        result_amount: Number(result) || 0,
        respected_plan: respectedPlan,
        hesitated,
        felt_fear: feltFear,
        respected_rr: respectedRR,
        discipline_score: respectedPlan ? 30 : 0,
        execution_quality: !hesitated ? 20 : 0,
        plan_respect: respectedRR ? 30 : 0,
        emotional_management: !feltFear ? 20 : 0,
        total_score: total,
        notes,
      });

      // Update XP
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
      navigate('/dashboard');
    } catch {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-12">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/dashboard')} className="text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-display font-bold">Mode Session</h1>
      </div>

      {maxReached && (
        <GlassCard className="mb-4 border-warning/30 text-center">
          <p className="text-sm text-warning font-medium">⚠️ Max trades atteint ({profile?.max_trades_per_day}/jour)</p>
          <p className="text-xs text-muted-foreground mt-1">Discipline = pas de trade de plus</p>
        </GlassCard>
      )}

      <AnimatePresence mode="wait">
        {phase === 'checklist' && (
          <motion.div key="checklist" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="text-sm text-muted-foreground mb-4">
              Valide chaque point avant d'entrer en trade
            </p>

            <div className="space-y-2 mb-6">
              {items.map((item) => (
                <GlassCard
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className="flex items-center gap-3 cursor-pointer py-3"
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                    checked.has(item.id)
                      ? 'bg-primary'
                      : 'border border-border'
                  }`}>
                    {checked.has(item.id) && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                  </div>
                  <span className={`text-sm ${checked.has(item.id) ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {item.label}
                  </span>
                </GlassCard>
              ))}
            </div>

            <button
              onClick={() => !maxReached && setPhase('trade')}
              disabled={!allChecked || maxReached}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                allChecked && !maxReached
                  ? 'glow-button text-primary-foreground'
                  : 'glass-card text-muted-foreground cursor-not-allowed'
              }`}
            >
              {!allChecked ? <Lock className="w-4 h-4" /> : null}
              {maxReached ? 'Limite atteinte' : !allChecked ? 'Valide toute la checklist' : 'Entrer en trade'}
            </button>
          </motion.div>
        )}

        {phase === 'trade' && (
          <motion.div key="trade" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <p className="text-sm text-muted-foreground mb-6">
              Après ton trade, remplis le bilan
            </p>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Setup utilisé (ex: BOS + FVG)"
                value={setup}
                onChange={(e) => setSetup(e.target.value)}
                className="glass-input w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />

              <input
                type="number"
                placeholder="Résultat en $ (ex: 150 ou -50)"
                value={result}
                onChange={(e) => setResult(e.target.value)}
                className="glass-input w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />

              <p className="text-xs text-muted-foreground font-medium mt-4 mb-2">Auto-évaluation</p>

              {[
                { label: 'J\'ai respecté mon plan', state: respectedPlan, set: setRespectedPlan },
                { label: 'J\'ai hésité', state: hesitated, set: setHesitated },
                { label: 'J\'ai ressenti de la peur', state: feltFear, set: setFeltFear },
                { label: 'J\'ai respecté mon R:R', state: respectedRR, set: setRespectedRR },
              ].map(({ label, state, set }) => (
                <GlassCard
                  key={label}
                  onClick={() => set(!state)}
                  className="flex items-center gap-3 cursor-pointer py-3"
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                    state ? 'bg-primary' : 'border border-border'
                  }`}>
                    {state && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                  </div>
                  <span className="text-sm">{label}</span>
                </GlassCard>
              ))}

              <textarea
                placeholder="Notes personnelles..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="glass-input w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none h-20"
              />

              <button
                onClick={handleSubmitTrade}
                disabled={saving}
                className="glow-button w-full py-3.5 rounded-xl font-semibold text-sm text-primary-foreground flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {saving ? 'Enregistrement...' : 'Valider le trade'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
