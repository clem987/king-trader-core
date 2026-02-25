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
    <div className="min-h-screen pb-24 px-5 pt-14">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/dashboard')} className="text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-display font-bold">Réglages</h1>
          <p className="text-[10px] text-muted-foreground">Configure ta stratégie</p>
        </div>
      </div>

      {/* Trading settings */}
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

      {/* Checklist */}
      <GlassCard className="mb-4 anim-fadeup-1">
        <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-4">Checklist pré-session</p>
        <div className="space-y-2 mb-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2.5 px-3 glass-card rounded-xl">
              <span className="text-sm">{item.label}</span>
              <button onClick={() => removeItem.mutate(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Nouvel élément..."
            className="glass-input flex-1 px-4 py-3 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none"
            onKeyDown={(e) => e.key === 'Enter' && handleAddChecklist()}
          />
          <button onClick={handleAddChecklist} className="glow-button w-12 rounded-xl flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </GlassCard>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="glass-card w-full py-3 rounded-xl text-sm font-display font-semibold text-destructive flex items-center justify-center gap-2 border border-destructive/20 anim-fadeup-2"
      >
        <LogOut className="w-4 h-4" />
        Déconnexion
      </button>

      <BottomNav />
    </div>
  );
}
