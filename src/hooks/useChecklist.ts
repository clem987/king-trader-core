import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export function useChecklist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['checklist', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addItem = useMutation({
    mutationFn: async (label: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('checklist_items')
        .insert({ user_id: user.id, label, sort_order: items.length });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['checklist', user?.id] }),
  });

  const removeItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('checklist_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['checklist', user?.id] }),
  });

  return { items, isLoading, addItem, removeItem };
}
