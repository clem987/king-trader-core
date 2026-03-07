import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import { useTranslation } from 'react-i18next';

const COMMON_PAIRS = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'GBP/JPY', 'XAU/USD', 'NAS100', 'US30', 'BTC/USD', 'EUR/GBP', 'USD/CHF'];

interface TradeFormQCMProps {
  onSubmit: (trade: {
    pair: string; direction: string; setup: string; result_amount: number;
    rr_achieved: number; setup_respected: boolean; plan_respected: boolean;
    emotion: string; clarity_score: number; notes: string;
  }) => Promise<void>;
  saving: boolean;
}

export default function TradeFormQCM({ onSubmit, saving }: TradeFormQCMProps) {
  const { t } = useTranslation();
  const [pair, setPair] = useState('');
  const [customPair, setCustomPair] = useState('');
  const [direction, setDirection] = useState<'LONG' | 'SHORT' | null>(null);
  const [setup, setSetup] = useState('');
  const [result, setResult] = useState('');
  const [rr, setRr] = useState('');
  const [setupRespected, setSetupRespected] = useState<boolean | null>(null);
  const [planRespected, setPlanRespected] = useState<boolean | null>(null);
  const [emotion, setEmotion] = useState<string | null>(null);
  const [clarityScore, setClarityScore] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  const finalPair = pair === 'custom' ? customPair.toUpperCase() : pair;
  const isComplete = finalPair && direction && setupRespected !== null && planRespected !== null && emotion && clarityScore !== null;

  const handleSubmit = async () => {
    if (!isComplete) return;
    await onSubmit({ pair: finalPair, direction: direction!, setup, result_amount: parseFloat(result) || 0, rr_achieved: parseFloat(rr) || 0, setup_respected: setupRespected!, plan_respected: planRespected!, emotion: emotion!, clarity_score: clarityScore!, notes });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <GlassCard>
        <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-3">{t('tradeForm.pairTitle')}</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {COMMON_PAIRS.map(p => (
            <button key={p} onClick={() => setPair(p)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${pair === p ? 'glow-button border-transparent' : 'glass-card text-muted-foreground border-border'}`}>{p}</button>
          ))}
          <button onClick={() => setPair('custom')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${pair === 'custom' ? 'glow-button border-transparent' : 'glass-card text-muted-foreground border-border'}`}>{t('tradeForm.other')}</button>
        </div>
        {pair === 'custom' && (
          <input value={customPair} onChange={e => setCustomPair(e.target.value)} placeholder="Ex: SOL/USD"
            className="glass-input w-full px-4 py-2.5 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none mt-2" />
        )}
      </GlassCard>

      <GlassCard>
        <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-3">{t('tradeForm.direction')}</p>
        <div className="flex gap-3">
          <button onClick={() => setDirection('LONG')} className={`qcm-opt ${direction === 'LONG' ? 'active-success' : ''}`}>↗ LONG</button>
          <button onClick={() => setDirection('SHORT')} className={`qcm-opt ${direction === 'SHORT' ? 'active-danger' : ''}`}>↘ SHORT</button>
        </div>
      </GlassCard>

      <GlassCard>
        <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-3">{t('tradeForm.tradeDetails')}</p>
        <div className="space-y-3">
          <input type="text" placeholder={t('tradeForm.setupPlaceholder')} value={setup} onChange={e => setSetup(e.target.value)}
            className="glass-input w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none" />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" placeholder={t('tradeForm.pnlPlaceholder')} value={result} onChange={e => setResult(e.target.value)}
              className="glass-input w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none" />
            <input type="number" placeholder={t('tradeForm.rrPlaceholder')} value={rr} onChange={e => setRr(e.target.value)}
              className="glass-input w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none" step="0.1" />
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-4">{t('tradeForm.selfEval')}</p>
        <div className="mb-4">
          <p className="text-xs font-semibold mb-2">{t('tradeForm.setupRespected')}</p>
          <div className="flex gap-3">
            <button onClick={() => setSetupRespected(true)} className={`qcm-opt ${setupRespected === true ? 'active-success' : ''}`}>✓ {t('common.yes')}</button>
            <button onClick={() => setSetupRespected(false)} className={`qcm-opt ${setupRespected === false ? 'active-danger' : ''}`}>✗ {t('common.no')}</button>
          </div>
        </div>
        <div className="mb-4">
          <p className="text-xs font-semibold mb-2">{t('tradeForm.planRespected')}</p>
          <div className="flex gap-3">
            <button onClick={() => setPlanRespected(true)} className={`qcm-opt ${planRespected === true ? 'active-success' : ''}`}>✓ {t('common.yes')}</button>
            <button onClick={() => setPlanRespected(false)} className={`qcm-opt ${planRespected === false ? 'active-danger' : ''}`}>✗ {t('common.no')}</button>
          </div>
        </div>
        <div className="mb-4">
          <p className="text-xs font-semibold mb-2">{t('tradeForm.emotionalState')}</p>
          <div className="flex gap-2">
            {[{ id: 'calm', label: t('tradeForm.calm') }, { id: 'neutral', label: t('tradeForm.neutral') }, { id: 'stressed', label: t('tradeForm.stressed') }].map(e => (
              <button key={e.id} onClick={() => setEmotion(e.id)}
                className={`qcm-opt ${emotion === e.id ? (e.id === 'calm' ? 'active-success' : e.id === 'stressed' ? 'active-danger' : 'active') : ''}`}>{e.label}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold mb-2">{t('tradeForm.mentalClarity')}</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setClarityScore(n)} className={`qcm-opt ${clarityScore === n ? 'active' : ''}`}>{n}</button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">{t('tradeForm.clarityScale')}</p>
        </div>
      </GlassCard>

      <textarea placeholder={t('tradeForm.personalNotes')} value={notes} onChange={e => setNotes(e.target.value)}
        className="glass-input w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none h-20" />

      <button onClick={handleSubmit} disabled={!isComplete || saving}
        className="glow-button w-full py-3.5 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
        <Send className="w-4 h-4" />
        {saving ? t('tradeForm.submitting') : t('tradeForm.submit')}
      </button>
    </motion.div>
  );
}
