import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from '@/hooks/useProfile';
import { useStrategies } from '@/hooks/useStrategies';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const MARKETS = [
  { id: 'forex', emoji: '💱' },
  { id: 'futures', emoji: '📈' },
  { id: 'crypto', emoji: '₿' },
  { id: 'stocks', emoji: '🏦' },
];

const CHECKLIST_SUGGESTIONS: Record<string, string[]> = {
  forex: ['Revue London/NY session', 'Actualités macro vérifiées', 'Structure H4 validée', 'Capital max défini'],
  futures: ['Rapport COT vérifié', 'Niveaux clés tracés', 'Volume profile analysé', 'Capital max défini'],
  crypto: ['Dominance BTC vérifiée', 'Niveaux supports/résistances', 'Sentiment marché OK', 'Capital max défini'],
  stocks: ['Earnings calendar vérifié', 'Trend daily validé', 'Volume suffisant', 'Capital max défini'],
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profile, updateProfile } = useProfile();
  const { createStrategy } = useStrategies();
  const [step, setStep] = useState(0); // 0 = splash
  const [market, setMarket] = useState('');
  const [stratName, setStratName] = useState('');
  const [rrMin, setRrMin] = useState('2');
  const [maxTrades, setMaxTrades] = useState('3');
  const [selectedChecklist, setSelectedChecklist] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.onboarding_completed) navigate('/dashboard', { replace: true });
  }, [profile, navigate]);

  // Auto-advance splash after 2.5s
  useEffect(() => {
    if (step === 0) {
      const timer = setTimeout(() => setStep(1), 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleFinish = async () => {
    if (!market || !stratName) return;
    setSaving(true);
    try {
      await createStrategy.mutateAsync({ name: stratName, market, rr_min: Number(rrMin), max_trades: Number(maxTrades), risk_max: 100 });
      await updateProfile.mutateAsync({ market, strategy: stratName, onboarding_completed: true });
      toast.success(t('onboarding.welcome'));
      navigate('/dashboard', { replace: true });
    } catch { toast.error(t('onboarding.configError')); }
    finally { setSaving(false); }
  };

  const getPlaceholder = () => {
    const key = market as 'forex' | 'futures' | 'crypto';
    return t(`onboarding.placeholders.${key || 'default'}`);
  };

  const marketTaglines: Record<string, string> = {
    futures: t('onboarding.marketTaglines.futures'),
    forex: t('onboarding.marketTaglines.forex'),
    crypto: t('onboarding.marketTaglines.crypto'),
    stocks: t('onboarding.marketTaglines.stocks'),
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {/* Step 0 — Splash */}
        {step === 0 && (
          <motion.div key="splash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center text-center">
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-20 h-20 rounded-2xl glow-button flex items-center justify-center text-4xl mb-6">
              👑
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <h1 className="text-3xl font-display font-extrabold tracking-tight">
                KING <span className="text-primary">TRADER</span>
              </h1>
              <p className="text-sm text-muted-foreground italic mt-3">{t('dashboard.quote')}</p>
              <p className="text-xs text-muted-foreground mt-6">{t('onboarding.splashTagline')}</p>
            </motion.div>
          </motion.div>
        )}

        {step >= 1 && (
          <motion.div key="flow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-8 justify-center">
              <div className="w-10 h-10 rounded-xl glow-button flex items-center justify-center text-xl font-bold">👑</div>
              <span className="text-xl font-display font-extrabold">KING <span className="text-primary">TRADER</span></span>
            </div>

            {/* Step indicators */}
            <div className="flex items-center gap-2 mb-8 justify-center">
              {[1, 2, 3].map(s => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    s < step ? 'bg-primary text-primary-foreground' : s === step ? 'border-2 border-primary text-primary' : 'bg-muted/30 text-muted-foreground'
                  }`}>{s < step ? '✓' : s}</div>
                  {s < 3 && <div className={`w-10 h-0.5 transition-all ${s < step ? 'bg-primary' : 'bg-muted/30'}`} />}
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-display font-extrabold mb-2">{t('onboarding.step1Title')}</h2>
                    <p className="text-sm text-muted-foreground">{t('onboarding.step1Desc')}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {MARKETS.map(m => {
                      const mT = t(`onboarding.markets.${m.id}`, { returnObjects: true }) as { label: string; desc: string };
                      return (
                        <button key={m.id} onClick={() => setMarket(m.id)}
                          className={`glass-card rounded-2xl p-5 text-left transition-all border flex flex-col gap-2 ${
                            market === m.id ? 'border-primary/50 bg-primary/10' : 'border-border hover:border-primary/20'
                          }`}>
                          <div className="text-3xl">{m.emoji}</div>
                          <div className="font-bold">{mT.label}</div>
                          <div className="text-xs text-muted-foreground">{mT.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                  {market && (
                    <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-primary/80 text-center mb-4 italic">
                      {marketTaglines[market]}
                    </motion.p>
                  )}
                  <button onClick={() => market && setStep(2)} disabled={!market}
                    className={`w-full py-4 rounded-2xl font-display font-bold transition-all ${market ? 'glow-button' : 'glass-card text-muted-foreground cursor-not-allowed'}`}>
                    {t('common.continue')}
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-display font-extrabold mb-2">{t('onboarding.step2Title')}</h2>
                    <p className="text-sm text-muted-foreground">{t('onboarding.step2Desc')}</p>
                  </div>
                  <div className="glass-card rounded-2xl p-5 mb-4 flex flex-col gap-4">
                    <div>
                      <label className="text-xs font-mono tracking-widest text-muted-foreground mb-2 block">{t('onboarding.strategyNameLabel')}</label>
                      <input value={stratName} onChange={e => setStratName(e.target.value)} placeholder={getPlaceholder()}
                        className="glass-input w-full px-4 py-3 rounded-xl text-sm outline-none placeholder:text-muted-foreground" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-mono tracking-widest text-muted-foreground mb-2 block">{t('onboarding.rrMinLabel')}</label>
                        <div className="flex items-center gap-2">
                          {['1.5', '2', '2.5', '3'].map(v => (
                            <button key={v} onClick={() => setRrMin(v)}
                              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all border ${
                                rrMin === v ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/30'
                              }`}>{v}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-mono tracking-widest text-muted-foreground mb-2 block">{t('onboarding.maxTradesLabel')}</label>
                        <div className="flex items-center gap-2">
                          {['1', '2', '3', '4'].map(v => (
                            <button key={v} onClick={() => setMaxTrades(v)}
                              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all border ${
                                maxTrades === v ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/30'
                              }`}>{v}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Tip */}
                  <div className="glass-card rounded-xl p-3 mb-4 border border-primary/10">
                    <p className="text-xs text-muted-foreground">
                      💡 {t('onboarding.strategyTip')}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="py-4 px-6 rounded-2xl glass-card text-muted-foreground font-bold text-sm">←</button>
                    <button onClick={() => stratName && setStep(3)} disabled={!stratName}
                      className={`flex-1 py-4 rounded-2xl font-display font-bold transition-all ${stratName ? 'glow-button' : 'glass-card text-muted-foreground cursor-not-allowed'}`}>
                      {t('common.continue')}
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                  <div className="text-center mb-4">
                    <h2 className="text-2xl font-display font-extrabold mb-2">{t('onboarding.step3Title')}</h2>
                    <p className="text-sm text-muted-foreground">{t('onboarding.step3Desc')}</p>
                  </div>
                  {/* Why checklist */}
                  <div className="glass-card rounded-xl p-3 mb-4 border border-primary/10">
                    <p className="text-[10px] font-bold tracking-widest text-primary uppercase mb-1">{t('onboarding.whyChecklist')}</p>
                    <p className="text-xs text-muted-foreground">{t('onboarding.whyChecklistDesc')}</p>
                  </div>
                  <div className="glass-card rounded-2xl p-4 mb-4">
                    <div className="text-xs font-mono tracking-widest text-muted-foreground mb-3">
                      {t('onboarding.suggestionsFor', { market: market.toUpperCase() })}
                    </div>
                    <div className="space-y-2">
                      {(CHECKLIST_SUGGESTIONS[market] || []).map(suggestion => {
                        const selected = selectedChecklist.includes(suggestion);
                        return (
                          <button key={suggestion} onClick={() => setSelectedChecklist(prev => selected ? prev.filter(s => s !== suggestion) : [...prev, suggestion])}
                            className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl transition-all border text-sm ${
                              selected ? 'border-primary/40 bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:border-primary/20'
                            }`}>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                              selected ? 'bg-primary border-primary' : 'border-muted-foreground/40'
                            }`}>
                              {selected && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round"/></svg>}
                            </div>
                            {suggestion}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground text-center mb-4">
                    {t('onboarding.rulesSelected', { count: selectedChecklist.length })} {t('onboarding.canModifyLater')}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(2)} className="py-4 px-6 rounded-2xl glass-card text-muted-foreground font-bold text-sm">←</button>
                    <button onClick={handleFinish} disabled={saving}
                      className="flex-1 py-4 rounded-2xl glow-button font-display font-bold text-base flex items-center justify-center gap-2">
                      {saving ? (<><div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />{t('onboarding.configuring')}</>) : t('onboarding.startTrading')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
