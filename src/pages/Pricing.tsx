const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '0',
    tagline: 'Pour découvrir',
    colorClass: 'text-muted-foreground',
    current: true,
    features: [
      { text: '5 sessions par mois', ok: true },
      { text: '1 stratégie', ok: true },
      { text: 'Score Process', ok: true },
      { text: 'Journal basique', ok: true },
      { text: 'Stats 7 jours', ok: true },
      { text: 'Bilan post-session', ok: false },
      { text: 'Analytics avancés', ok: false },
      { text: 'Export CSV', ok: false },
      { text: 'Insights IA', ok: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '12',
    tagline: 'Pour les traders sérieux',
    colorClass: 'text-primary',
    popular: true,
    features: [
      { text: 'Sessions illimitées', ok: true },
      { text: 'Stratégies illimitées', ok: true },
      { text: 'Score Process complet', ok: true },
      { text: 'Journal complet + filtres', ok: true },
      { text: 'Stats & analytics complets', ok: true },
      { text: 'Bilan post-session', ok: true },
      { text: "Coût de l'indiscipline", ok: true },
      { text: 'Export CSV', ok: true },
      { text: 'Insights IA', ok: true },
    ],
  },
  {
    id: 'elite',
    name: 'Elite 👑',
    price: '29',
    tagline: 'Pour les pros',
    colorClass: 'text-gold',
    features: [
      { text: 'Tout Pro +', ok: true },
      { text: 'Coach IA personnel', ok: true },
      { text: 'Squads de traders', ok: true, soon: true },
      { text: 'Import broker auto', ok: true, soon: true },
      { text: 'Certification King Trader', ok: true },
      { text: 'Support prioritaire', ok: true },
      { text: 'Accès bêta features', ok: true },
    ],
  },
];

export default function Pricing() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-20 lg:pb-8 page-enter">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="text-[10px] font-mono tracking-[4px] text-primary uppercase mb-3">
          PLANS & TARIFS
        </div>
        <h1 className="text-3xl lg:text-4xl font-display font-extrabold mb-4">
          Passe au niveau supérieur
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto text-sm">
          "Les traders disciplinés gagnent sur le long terme."
          <br />
          Choisis le plan qui correspond à ton niveau.
        </p>
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {PLANS.map(plan => (
          <div
            key={plan.id}
            className={`relative glass-card rounded-3xl p-6 flex flex-col transition-all hover:-translate-y-1 ${
              plan.popular
                ? 'border-primary/40 shadow-lg shadow-primary/10'
                : 'border-border'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-4 py-1 rounded-full tracking-wider">
                LE PLUS POPULAIRE
              </div>
            )}

            <div className="mb-6">
              <div className="text-[10px] font-mono tracking-widest text-muted-foreground mb-2">
                {plan.name.toUpperCase()}
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className={`text-4xl font-display font-extrabold ${plan.colorClass}`}>
                  {plan.price}€
                </span>
                <span className="text-sm text-muted-foreground">/mois</span>
              </div>
              <div className="text-sm text-muted-foreground">{plan.tagline}</div>
            </div>

            <ul className="space-y-3 flex-1 mb-6">
              {plan.features.map((f, i) => (
                <li
                  key={i}
                  className={`flex items-start gap-2.5 text-sm ${
                    f.ok ? 'text-foreground' : 'text-muted-foreground/40'
                  }`}
                >
                  <span className={`mt-0.5 shrink-0 text-base ${f.ok ? 'text-success' : 'text-destructive/50'}`}>
                    {f.ok ? '✓' : '✗'}
                  </span>
                  <span>
                    {f.text}
                    {f.soon && (
                      <span className="ml-1.5 text-[9px] font-mono bg-muted/30 text-muted-foreground px-1.5 py-0.5 rounded-full">
                        BIENTÔT
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>

            <button
              disabled={plan.current}
              className={`w-full py-3.5 rounded-xl font-display font-bold text-sm transition-all ${
                plan.current
                  ? 'bg-muted/30 text-muted-foreground cursor-default'
                  : plan.popular
                  ? 'glow-button shadow-md shadow-primary/20'
                  : 'border border-border hover:border-primary/30 hover:bg-primary/5 text-foreground'
              }`}
            >
              {plan.current ? 'Plan actuel' : `Passer à ${plan.name} →`}
            </button>
          </div>
        ))}
      </div>

      {/* Garantie */}
      <div className="glass-card rounded-2xl p-6 text-center">
        <div className="text-2xl mb-2">🔒</div>
        <h3 className="font-display font-bold mb-2">Satisfait ou remboursé 14 jours</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Annule à tout moment. Aucun engagement. Paiement sécurisé via Stripe.
        </p>
      </div>
    </div>
  );
}
