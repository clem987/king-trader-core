import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, X, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '@/components/GlassCard';
import BottomNav from '@/components/BottomNav';
import { useProfile } from '@/hooks/useProfile';
import { useChecklist } from '@/hooks/useChecklist';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useProfile();
  const { items, addItem, removeItem } = useChecklist();
  const { signOut } = useAuth();
  const [newItem, setNewItem] = useState('');
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

  const handleAddChecklist = async () => {
    if (!newItem.trim()) return;
    await addItem.mutateAsync(newItem.trim());
    setNewItem('');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-12">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/dashboard')} className="text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-display font-bold">Réglages</h1>
      </div>

      <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Trading</h3>
      <div className="space-y-3 mb-6">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Marché</label>
          <input value={market} onChange={(e) => setMarket(e.target.value)}
            className="glass-input w-full px-4 py-3 rounded-xl text-sm text-foreground outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Risk max ($)</label>
            <input type="number" value={maxRisk} onChange={(e) => setMaxRisk(e.target.value)}
              className="glass-input w-full px-4 py-3 rounded-xl text-sm text-foreground outline-none" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">R:R min</label>
            <input type="number" value={minRR} onChange={(e) => setMinRR(e.target.value)}
              className="glass-input w-full px-4 py-3 rounded-xl text-sm text-foreground outline-none" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Max trades/jour</label>
            <input type="number" value={maxTrades} onChange={(e) => setMaxTrades(e.target.value)}
              className="glass-input w-full px-4 py-3 rounded-xl text-sm text-foreground outline-none" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Stratégie</label>
            <input value={strategy} onChange={(e) => setStrategy(e.target.value)}
              className="glass-input w-full px-4 py-3 rounded-xl text-sm text-foreground outline-none" />
          </div>
        </div>
        <button onClick={handleSave} className="glow-button w-full py-3 rounded-xl text-sm font-semibold text-primary-foreground">
          Sauvegarder
        </button>
      </div>

      <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Checklist personnalisée</h3>
      <div className="space-y-2 mb-4">
        {items.map((item) => (
          <GlassCard key={item.id} className="flex items-center justify-between py-2.5">
            <span className="text-sm">{item.label}</span>
            <button onClick={() => removeItem.mutate(item.id)} className="text-muted-foreground hover:text-destructive">
              <X className="w-4 h-4" />
            </button>
          </GlassCard>
        ))}
      </div>
      <div className="flex gap-2 mb-8">
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Nouvel élément..."
          className="glass-input flex-1 px-4 py-3 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none"
          onKeyDown={(e) => e.key === 'Enter' && handleAddChecklist()}
        />
        <button onClick={handleAddChecklist} className="glow-button w-12 rounded-xl flex items-center justify-center">
          <Plus className="w-4 h-4 text-primary-foreground" />
        </button>
      </div>

      <button
        onClick={handleLogout}
        className="glass-card w-full py-3 rounded-xl text-sm font-medium text-destructive flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        Déconnexion
      </button>

      <BottomNav />
    </div>
  );
}
