export type ChecklistPhase = 'before' | 'during' | 'after';

export const CHECKLIST_SUGGESTIONS: Record<ChecklistPhase, string[]> = {
  before: [
    "J'ai dormi plus de 6 heures",
    "Revue du marché effectuée",
    "Actualités économiques vérifiées",
    "Capital max à risquer défini",
    "Pas de trade revenge aujourd'hui",
    "État mental ≥ 7/10",
    "Pas de nouvelles macro importantes",
  ],
  during: [
    "Structure H4 validée",
    "Liquidité identifiée",
    "Consolidation confirmée",
    "Stop loss défini avant entrée",
    "R:R ≥ 2.0 vérifié",
    "Entrée sur POI confirmée",
    "Volume cohérent avec le setup",
  ],
  after: [
    "J'ai respecté mon plan",
    "Pas de trade revenge pris",
    "Journal complété",
    "Émotions notées",
    "Leçon du jour identifiée",
  ],
};
