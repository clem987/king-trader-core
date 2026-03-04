import { useState, useEffect } from 'react';
import { LogOut, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '@/components/GlassCard';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useProfile();
  const { signOut } = useAuth();
  const [market, setMarket] = useState('');
  const [maxRisk, setMaxRisk] = useState('');
  const [minRR, setMinRR] = useState('');
  const [maxTrades, setMaxTrades] = useState('');
  const [strategy, setStrategy] = useState('');

  useEffect(() => {
    if (profile) {
      setMarket(profile.market || '');
      setMaxRisk(String(profile.max_risk_per_trade || ''));
      setMinRR(String(profile.min_rr || ''));
      setMaxTrades(String(profile.max_trades_per_day || ''));
      setStrategy(profile.strategy || '');
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        market,
        max_risk_per_trade: Number(maxRisk),
        min_rr: Number(minRR),
        max_trades_per_day: Number(maxTrades),
        strategy,
      });
      toast.success('Paramètres sauvegardés');
    } catch {
      toast.error('Erreur');
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="p-4 lg:p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-display font-bold">Réglages</h1>
        <p className="text-xs text-muted-foreground">Configure ta stratégie</p>
      </div>

      <GlassCard className="mb-4 anim-fadeup">
        <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-4">Stratégie</p>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Nom de la stratégie</label>
            <input value={strategy} onChange={(e) => setStrategy(e.target.value)}
              placeholder="Ex: ICT, SMC..."
              className="glass-input w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Marché</label>
            <input value={market} onChange={(e) => setMarket(e.target.value)}
              placeholder="Ex: Forex, Crypto..."
              className="glass-input w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground mb-1.5 block font-medium">Risk max ($)</label>
              <input type="number" value={maxRisk} onChange={(e) => setMaxRisk(e.target.value)}
                className="glass-input w-full px-3 py-3 rounded-xl text-sm text-foreground outline-none" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground mb-1.5 block font-medium">R:R min</label>
              <input type="number" value={minRR} onChange={(e) => setMinRR(e.target.value)}
                className="glass-input w-full px-3 py-3 rounded-xl text-sm text-foreground outline-none" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground mb-1.5 block font-medium">Max trades</label>
              <input type="number" value={maxTrades} onChange={(e) => setMaxTrades(e.target.value)}
                className="glass-input w-full px-3 py-3 rounded-xl text-sm text-foreground outline-none" />
            </div>
          </div>
          <button onClick={handleSave} className="glow-button w-full py-3 rounded-xl text-sm font-display font-bold">
            Sauvegarder
          </button>
        </div>
      </GlassCard>

      <button
        onClick={() => navigate('/strategies')}
        className="glow-button w-full py-3.5 px-4 rounded-xl text-sm font-display font-bold flex items-center justify-center gap-2 anim-fadeup-1 mb-4"
      >
        <ClipboardList className="w-4 h-4" />
        Gérer les stratégies & checklists
      </button>

      <button
        onClick={handleLogout}
        className="glass-card w-full py-3 rounded-xl text-sm font-display font-semibold text-destructive flex items-center justify-center gap-2 border border-destructive/20 anim-fadeup-3"
      >
        <LogOut className="w-4 h-4" />
        Déconnexion
      </button>
    </div>
  );
}
