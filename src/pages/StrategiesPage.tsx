import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Edit2, Check, Star, ChevronDown, ChevronUp, X, GripVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '@/components/GlassCard';
import BottomNav from '@/components/BottomNav';
import { useStrategies, Strategy } from '@/hooks/useStrategies';
import { useStrategyChecklists } from '@/hooks/useStrategyChecklists';
import { toast } from 'sonner';

type ChecklistType = 'before' | 'during' | 'after';
const CHECKLIST_LABELS: Record<ChecklistType, string> = {
  before: 'Avant session',
  during: 'Pendant session',
  after: 'Après session',
};

function StrategyForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<Strategy>;
  onSubmit: (v: { name: string; market: string; risk_max: number; rr_min: number; max_trades: number }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name || '');
  const [market, setMarket] = useState(initial?.market || 'NQ');
  const [riskMax, setRiskMax] = useState(String(initial?.risk_max ?? 100));
  const [rrMin, setRrMin] = useState(String(initial?.rr_min ?? 2));
  const [maxTrades, setMaxTrades] = useState(String(initial?.max_trades ?? 3));

  const handleSubmit = () => {
    if (!name.trim()) { toast.error('Nom requis'); return; }
    onSubmit({ name: name.trim(), market, risk_max: Number(riskMax), rr_min: Number(rrMin), max_trades: Number(maxTrades) });
  };

  return (
    <GlassCard className="mb-4">
      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Nom</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: ICT Silver Bullet"
            className="glass-input w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Marché</label>
          <input value={market} onChange={(e) => setMarket(e.target.value)} placeholder="Ex: NQ"
            className="glass-input w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] text-muted-foreground mb-1.5 block font-medium">Risk max ($)</label>
            <input type="number" value={riskMax} onChange={(e) => setRiskMax(e.target.value)}
              className="glass-input w-full px-3 py-3 rounded-xl text-sm text-foreground outline-none" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground mb-1.5 block font-medium">R:R min</label>
            <input type="number" value={rrMin} onChange={(e) => setRrMin(e.target.value)}
              className="glass-input w-full px-3 py-3 rounded-xl text-sm text-foreground outline-none" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground mb-1.5 block font-medium">Max trades</label>
            <input type="number" value={maxTrades} onChange={(e) => setMaxTrades(e.target.value)}
              className="glass-input w-full px-3 py-3 rounded-xl text-sm text-foreground outline-none" />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSubmit} className="glow-button flex-1 py-3 rounded-xl text-sm font-display font-bold">
            {initial?.id ? 'Modifier' : 'Créer'}
          </button>
          <button onClick={onCancel} className="glass-card px-4 py-3 rounded-xl text-sm text-muted-foreground">
            Annuler
          </button>
        </div>
      </div>
    </GlassCard>
  );
}

function ChecklistSection({ strategyId }: { strategyId: string }) {
  const { getItems, addItem, updateItem, removeItem, reorderItems } = useStrategyChecklists(strategyId);
  const [activeTab, setActiveTab] = useState<ChecklistType>('before');
  const [newText, setNewText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const items = getItems(activeTab);

  const handleAdd = async () => {
    if (!newText.trim()) return;
    await addItem.mutateAsync({ type: activeTab, text: newText.trim() });
    setNewText('');
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const reordered = [...items];
    [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
    reorderItems.mutate(reordered.map((item, i) => ({ id: item.id, order_index: i })));
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    const reordered = [...items];
    [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
    reorderItems.mutate(reordered.map((item, i) => ({ id: item.id, order_index: i })));
  };

  const startEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditText(text);
  };

  const saveEdit = async () => {
    if (!editingId || !editText.trim()) return;
    await updateItem.mutateAsync({ id: editingId, text: editText.trim() });
    setEditingId(null);
    setEditText('');
  };

  return (
    <div className="mt-3">
      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        {(['before', 'during', 'after'] as ChecklistType[]).map((type) => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className={`flex-1 py-2 rounded-xl text-[10px] font-semibold tracking-wider uppercase transition-colors ${
              activeTab === type ? 'glow-button' : 'glass-card text-muted-foreground'
            }`}
          >
            {CHECKLIST_LABELS[type]}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="space-y-2 mb-3">
        {items.map((item, index) => (
          <div key={item.id} className="flex items-center gap-2 py-2 px-3 glass-card rounded-xl">
            <GripVertical className="w-3 h-3 text-muted-foreground/50 shrink-0" />
            {editingId === item.id ? (
              <div className="flex-1 flex gap-2">
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="glass-input flex-1 px-2 py-1 rounded-lg text-sm text-foreground outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                  autoFocus
                />
                <button onClick={saveEdit} className="text-primary"><Check className="w-4 h-4" /></button>
                <button onClick={() => setEditingId(null)} className="text-muted-foreground"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <>
                <span className="text-sm flex-1">{item.text}</span>
                <div className="flex gap-1">
                  <button onClick={() => handleMoveUp(index)} className="text-muted-foreground hover:text-foreground transition-colors" disabled={index === 0}>
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleMoveDown(index)} className="text-muted-foreground hover:text-foreground transition-colors" disabled={index === items.length - 1}>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => startEdit(item.id, item.text)} className="text-muted-foreground hover:text-foreground transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => removeItem.mutate(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">Aucun item</p>
        )}
      </div>

      {/* Add */}
      <div className="flex gap-2">
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Nouvel item..."
          className="glass-input flex-1 px-4 py-3 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button onClick={handleAdd} className="glow-button w-12 rounded-xl flex items-center justify-center">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function StrategiesPage() {
  const navigate = useNavigate();
  const { strategies, isLoading, createStrategy, updateStrategy, deleteStrategy, setActive } = useStrategies();
  const [showForm, setShowForm] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleCreate = async (values: { name: string; market: string; risk_max: number; rr_min: number; max_trades: number }) => {
    await createStrategy.mutateAsync(values);
    setShowForm(false);
    toast.success('Stratégie créée');
  };

  const handleUpdate = async (values: { name: string; market: string; risk_max: number; rr_min: number; max_trades: number }) => {
    if (!editingStrategy) return;
    await updateStrategy.mutateAsync({ id: editingStrategy.id, ...values });
    setEditingStrategy(null);
    toast.success('Stratégie modifiée');
  };

  const handleDelete = async (id: string) => {
    await deleteStrategy.mutateAsync(id);
    toast.success('Stratégie supprimée');
  };

  const handleSetActive = async (id: string) => {
    await setActive.mutateAsync(id);
    toast.success('Stratégie activée');
  };

  return (
    <div className="min-h-screen pb-24 px-5 pt-14">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/settings')} className="text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-display font-bold">Stratégies</h1>
          <p className="text-[10px] text-muted-foreground">Gère tes stratégies et checklists</p>
        </div>
      </div>

      {/* Create button */}
      {!showForm && !editingStrategy && (
        <button
          onClick={() => setShowForm(true)}
          className="glow-button w-full py-3 rounded-xl text-sm font-display font-bold flex items-center justify-center gap-2 mb-4"
        >
          <Plus className="w-4 h-4" />
          Nouvelle stratégie
        </button>
      )}

      {/* Create form */}
      {showForm && (
        <StrategyForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      )}

      {/* Edit form */}
      {editingStrategy && (
        <StrategyForm initial={editingStrategy} onSubmit={handleUpdate} onCancel={() => setEditingStrategy(null)} />
      )}

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : strategies.length === 0 && !showForm ? (
        <GlassCard>
          <p className="text-sm text-muted-foreground text-center py-4">Aucune stratégie créée</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {strategies.map((s) => (
            <GlassCard key={s.id} className={s.is_active ? 'border border-primary/30' : ''}>
              <div className="flex items-start justify-between">
                <div className="flex-1" onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}>
                  <div className="flex items-center gap-2">
                    {s.is_active && <Star className="w-3.5 h-3.5 text-primary fill-primary" />}
                    <span className="text-sm font-display font-bold">{s.name}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {s.market} · Risk ${s.risk_max} · R:R {s.rr_min} · Max {s.max_trades}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {!s.is_active && (
                    <button onClick={() => handleSetActive(s.id)} className="text-muted-foreground hover:text-primary transition-colors" title="Activer">
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => setEditingStrategy(s)} className="text-muted-foreground hover:text-foreground transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded: checklists */}
              {expandedId === s.id && (
                <ChecklistSection strategyId={s.id} />
              )}
            </GlassCard>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
