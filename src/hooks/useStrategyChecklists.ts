import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StrategyChecklistItem {
  id: string;
  checklist_id: string;
  text: string;
  is_checked: boolean;
  is_required: boolean;
  order_index: number;
}

export function useStrategyChecklists(strategyId: string | null) {
  const qc = useQueryClient();
  const key = ['strategy-checklists', strategyId];

  // Fetch the 3 checklists for this strategy
  const { data: checklists = [] } = useQuery({
    queryKey: ['strategy-checklist-ids', strategyId],
    queryFn: async () => {
      if (!strategyId) return [];
      const { data, error } = await supabase
        .from('strategy_checklists')
        .select('*')
        .eq('strategy_id', strategyId);
      if (error) throw error;
      return data as { id: string; strategy_id: string; type: string }[];
    },
    enabled: !!strategyId,
  });

  const getChecklistId = (type: 'before' | 'during' | 'after') =>
    checklists.find((c) => c.type === type)?.id || null;

  // Fetch all items for all checklists of this strategy
  const { data: allItems = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: async () => {
      if (!checklists.length) return [];
      const ids = checklists.map((c) => c.id);
      const { data, error } = await supabase
        .from('strategy_checklist_items')
        .select('*')
        .in('checklist_id', ids)
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data as StrategyChecklistItem[];
    },
    enabled: checklists.length > 0,
  });

  const getItems = (type: 'before' | 'during' | 'after') => {
    const clId = getChecklistId(type);
    return clId ? allItems.filter((i) => i.checklist_id === clId) : [];
  };

  const addItem = useMutation({
    mutationFn: async ({ type, text, is_required = true }: { type: 'before' | 'during' | 'after'; text: string; is_required?: boolean }) => {
      const clId = getChecklistId(type);
      if (!clId) throw new Error('Checklist not found');
      const items = getItems(type);
      const { error } = await supabase.from('strategy_checklist_items').insert({
        checklist_id: clId,
        text,
        order_index: items.length,
        is_required,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, ...values }: Partial<StrategyChecklistItem> & { id: string }) => {
      const { error } = await supabase.from('strategy_checklist_items').update(values).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const removeItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('strategy_checklist_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const reorderItems = useMutation({
    mutationFn: async (items: { id: string; order_index: number }[]) => {
      for (const item of items) {
        const { error } = await supabase
          .from('strategy_checklist_items')
          .update({ order_index: item.order_index })
          .eq('id', item.id);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const resetChecks = useMutation({
    mutationFn: async () => {
      if (!checklists.length) return;
      const ids = checklists.map((c) => c.id);
      const { error } = await supabase
        .from('strategy_checklist_items')
        .update({ is_checked: false })
        .in('checklist_id', ids);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return { checklists, getItems, getChecklistId, isLoading, addItem, updateItem, removeItem, reorderItems, resetChecks };
}
