import { useTranslation } from 'react-i18next';

const PLAN_FEATURES = {
  free: [
    { key: 'sessionsMonth', ok: true },
    { key: 'oneStrategy', ok: true },
    { key: 'scoreProcess', ok: true },
    { key: 'basicJournal', ok: true },
    { key: 'stats7d', ok: true },
    { key: 'postSessionBilan', ok: false },
    { key: 'advancedAnalytics', ok: false },
    { key: 'exportCsv', ok: false },
    { key: 'aiInsights', ok: false },
  ],
  pro: [
    { key: 'unlimitedSessions', ok: true },
    { key: 'unlimitedStrategies', ok: true },
    { key: 'fullScoreProcess', ok: true },
    { key: 'fullJournal', ok: true },
    { key: 'fullStats', ok: true },
    { key: 'postSessionBilan', ok: true },
    { key: 'indisciplineCost', ok: true },
    { key: 'exportCsv', ok: true },
    { key: 'aiInsights', ok: true },
  ],
  elite: [
    { key: 'allPro', ok: true },
    { key: 'aiCoach', ok: true },
    { key: 'squads', ok: true, soon: true },
    { key: 'brokerImport', ok: true, soon: true },
    { key: 'certification', ok: true },
    { key: 'prioritySupport', ok: true },
    { key: 'betaAccess', ok: true },
  ],
};

export default function Pricing() {
  const { t } = useTranslation();

  const plans = [
    { id: 'free' as const, price: '0', colorClass: 'text-muted-foreground', current: true },
    { id: 'pro' as const, price: '12', colorClass: 'text-primary', popular: true },
    { id: 'elite' as const, price: '29', colorClass: 'text-gold' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-20 lg:pb-8 page-enter">
      <div className="text-center mb-12">
        <div className="text-[10px] font-mono tracking-[4px] text-primary uppercase mb-3">{t('pricing.header')}</div>
        <h1 className="text-3xl lg:text-4xl font-display font-extrabold mb-4">{t('pricing.title')}</h1>
        <p className="text-muted-foreground max-w-md mx-auto text-sm">
          {t('pricing.subtitle')}<br />{t('pricing.chooseLevel')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {plans.map(plan => {
          const features = PLAN_FEATURES[plan.id];
          const planT = t(`pricing.${plan.id}`, { returnObjects: true }) as { name: string; tagline: string };
          return (
            <div key={plan.id}
              className={`relative glass-card rounded-3xl p-6 flex flex-col transition-all hover:-translate-y-1 ${
                plan.popular ? 'border-primary/40 shadow-lg shadow-primary/10' : 'border-border'
              }`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-4 py-1 rounded-full tracking-wider">
                  {t('pricing.mostPopular')}
                </div>
              )}
              <div className="mb-6">
                <div className="text-[10px] font-mono tracking-widest text-muted-foreground mb-2">{planT.name.toUpperCase()}</div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className={`text-4xl font-display font-extrabold ${plan.colorClass}`}>{plan.price}€</span>
                  <span className="text-sm text-muted-foreground">{t('pricing.month')}</span>
                </div>
                <div className="text-sm text-muted-foreground">{planT.tagline}</div>
              </div>
              <ul className="space-y-3 flex-1 mb-6">
                {features.map((f, i) => (
                  <li key={i} className={`flex items-start gap-2.5 text-sm ${f.ok ? 'text-foreground' : 'text-muted-foreground/40'}`}>
                    <span className={`mt-0.5 shrink-0 text-base ${f.ok ? 'text-success' : 'text-destructive/50'}`}>{f.ok ? '✓' : '✗'}</span>
                    <span>
                      {t(`pricing.features.${f.key}`)}
                      {f.soon && <span className="ml-1.5 text-[9px] font-mono bg-muted/30 text-muted-foreground px-1.5 py-0.5 rounded-full">{t('pricing.soon')}</span>}
                    </span>
                  </li>
                ))}
              </ul>
              <button disabled={plan.current}
                className={`w-full py-3.5 rounded-xl font-display font-bold text-sm transition-all ${
                  plan.current ? 'bg-muted/30 text-muted-foreground cursor-default'
                    : plan.popular ? 'glow-button shadow-md shadow-primary/20'
                    : 'border border-border hover:border-primary/30 hover:bg-primary/5 text-foreground'
                }`}>
                {plan.current ? t('pricing.currentPlan') : t('pricing.switchTo', { plan: planT.name })}
              </button>
            </div>
          );
        })}
      </div>

      <div className="glass-card rounded-2xl p-6 text-center">
        <div className="text-2xl mb-2">🔒</div>
        <h3 className="font-display font-bold mb-2">{t('pricing.guarantee')}</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">{t('pricing.guaranteeDesc')}</p>
      </div>
    </div>
  );
}
