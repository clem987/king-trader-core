import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';

const emotions = [
  { id: 'focus', emoji: '🎯', label: 'Focus', risk: false },
  { id: 'neutre', emoji: '😐', label: 'Neutre', risk: false },
  { id: 'fomo', emoji: '🤑', label: 'FOMO', risk: true },
  { id: 'anxieux', emoji: '😰', label: 'Anxieux', risk: true },
  { id: 'revenge', emoji: '😤', label: 'Revenge', risk: true },
] as const;

interface EmotionalTrackerProps {
  emotion: string | null;
  onSelect: (id: string) => void;
}

export default function EmotionalTracker({ emotion, onSelect }: EmotionalTrackerProps) {
  const selected = emotions.find(e => e.id === emotion);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">
          État émotionnel actuel
        </span>
        {selected && (
          <span className={`text-xs font-semibold ${selected.risk ? 'text-destructive' : 'text-success'}`}>
            {selected.emoji} {selected.label}
          </span>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2">
        {emotions.map(e => (
          <button
            key={e.id}
            onClick={() => onSelect(e.id)}
            className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl transition-all border-2 ${
              emotion === e.id
                ? e.risk
                  ? 'border-destructive bg-destructive/10'
                  : 'border-success bg-success/10'
                : 'border-transparent glass-card'
            }`}
          >
            <span className="text-lg">{e.emoji}</span>
            <span className="text-[9px] font-bold tracking-wider text-muted-foreground uppercase">
              {e.label}
            </span>
          </button>
        ))}
      </div>

      {selected?.risk && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-3 border border-destructive/20"
        >
          <p className="text-xs text-destructive font-medium">
            ⚠️ Attention — état à risque détecté. Tu es sûr de vouloir prendre un trade ?
          </p>
        </motion.div>
      )}
    </div>
  );
}
