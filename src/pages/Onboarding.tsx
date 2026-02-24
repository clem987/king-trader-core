import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';

const steps = [
  { key: 'market', label: 'Quel marché trades-tu ?', options: ['NQ', 'MNQ', 'ES', 'MES', 'Forex', 'Crypto', 'Autre'] },
  { key: 'trading_session', label: 'Ta session de trading ?', options: ['New York AM', 'New York PM', 'London', 'Asia', 'Toute la journée'] },
  { key: 'max_risk_per_trade', label: 'Risk max par trade ($) ?', type: 'number' as const },
  { key: 'min_rr', label: 'R:R minimum ?', options: ['1.5', '2', '2.5', '3', '4', '5'] },
  { key: 'max_trades_per_day', label: 'Max trades par jour ?', options: ['1', '2', '3', '4', '5'] },
  { key: 'strategy', label: 'Ta stratégie principale ?', type: 'text' as const },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const { updateProfile } = useProfile();
  const navigate = useNavigate();

  const current = steps[step];

  const handleSelect = (value: string) => {
    const val = current.key === 'max_risk_per_trade' || current.key === 'min_rr' || current.key === 'max_trades_per_day'
      ? Number(value) : value;
    setAnswers({ ...answers, [current.key]: val });
  };

  const handleNext = async () => {
    // Ensure default value for number inputs
    const currentAnswers = { ...answers };
    if (current.type === 'number' && currentAnswers[current.key] === undefined) {
      currentAnswers[current.key] = 100;
      setAnswers(currentAnswers);
    }
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      try {
        await updateProfile.mutateAsync({ ...currentAnswers, onboarding_completed: true });
        navigate('/dashboard');
      } catch {
        toast.error('Erreur lors de la sauvegarde');
      }
    }
  };

  // Auto-set default for number inputs
  const effectiveAnswers = { ...answers };
  if (current.type === 'number' && effectiveAnswers[current.key] === undefined) {
    effectiveAnswers[current.key] = 100;
  }
  const hasAnswer = effectiveAnswers[current.key] !== undefined && effectiveAnswers[current.key] !== '';

  return (
    <div className="min-h-screen flex flex-col px-6 pt-16 pb-8">
      {/* Progress */}
      <div className="flex gap-1.5 mb-12">
        {steps.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-secondary'}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="flex-1"
        >
          <h2 className="text-xl font-display font-bold mb-8">{current.label}</h2>

          {current.options ? (
            <div className="grid grid-cols-2 gap-3">
              {current.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  className={`glass-card py-3 px-4 rounded-xl text-sm font-medium text-left transition-all ${
                    answers[current.key] === (current.key === 'min_rr' || current.key === 'max_trades_per_day' ? Number(opt) : opt)
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  style={
                    answers[current.key] === (current.key === 'min_rr' || current.key === 'max_trades_per_day' ? Number(opt) : opt)
                      ? { borderColor: 'hsl(var(--primary))' }
                      : {}
                  }
                >
                  <div className="flex items-center justify-between">
                    {opt}
                    {answers[current.key] === (current.key === 'min_rr' || current.key === 'max_trades_per_day' ? Number(opt) : opt) && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <input
              type={current.type || 'text'}
              value={answers[current.key] ?? (current.type === 'number' ? '100' : '')}
              onChange={(e) => setAnswers({ ...answers, [current.key]: current.type === 'number' ? Number(e.target.value) : e.target.value })}
              onFocus={() => {
                if (answers[current.key] === undefined && current.type === 'number') {
                  setAnswers({ ...answers, [current.key]: 100 });
                }
              }}
              placeholder={current.type === 'number' ? '100' : 'Ex: ICT, SMC, Orderflow...'}
              className="glass-input w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          )}
        </motion.div>
      </AnimatePresence>

      <button
        onClick={handleNext}
        disabled={!hasAnswer}
        className="glow-button w-full py-3.5 rounded-xl font-semibold text-sm text-primary-foreground mt-8 disabled:opacity-30 flex items-center justify-center gap-2"
      >
        {step === steps.length - 1 ? 'Commencer' : 'Suivant'}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
