import { useNavigate } from 'react-router-dom';

const FREE_FEATURES = ['score_process', 'session_basic', 'journal_basic', 'stats_7d'];

interface PremiumGateProps {
  feature: string;
  plan?: string;
  children: React.ReactNode;
}

export default function PremiumGate({ feature, plan = 'free', children }: PremiumGateProps) {
  const navigate = useNavigate();
  const hasAccess = plan !== 'free' || FREE_FEATURES.includes(feature);

  if (hasAccess) return <>{children}</>;

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div style={{ filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none' }}>
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/60 backdrop-blur-sm rounded-2xl">
        <div className="text-2xl">🔒</div>
        <div className="text-sm font-display font-bold text-center px-4">Feature Pro</div>
        <button
          onClick={() => navigate('/pricing')}
          className="glow-button px-5 py-2 rounded-lg text-sm font-bold"
        >
          Débloquer →
        </button>
      </div>
    </div>
  );
}
